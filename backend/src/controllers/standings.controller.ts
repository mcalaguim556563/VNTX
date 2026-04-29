import { Request, Response } from 'express';
import { Standing, Team, Tournament, Match, Result } from '../models';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

/**
 * calculateStandings — the single source of truth.
 *
 * Strategy: compute everything from RAW SQL so we bypass ALL
 * Sequelize camelCase/snake_case aliasing ambiguity.
 * This is bullet-proof regardless of model configuration.
 */
export const calculateStandings = async (tournamentId: string | number) => {
  const tid = Number(tournamentId);

  // 1. Get all completed matches for this tournament with scores via raw SQL
  const matches = await sequelize.query<{
    id: number;
    home_team_id: number;
    away_team_id: number;
    home_score: number;
    away_score: number;
    status: string;
  }>(
    `SELECT m.id, m.home_team_id, m.away_team_id, m.home_score, m.away_score, m.status
     FROM matches m
     WHERE m.tournament_id = :tid AND m.status = 'completed'
       AND m.home_score IS NOT NULL AND m.away_score IS NOT NULL`,
    { replacements: { tid }, type: QueryTypes.SELECT }
  );

  // 2. Get all teams in this tournament via raw SQL
  const teams = await sequelize.query<{
    id: number;
    name: string;
    tournament_id: number;
  }>(
    `SELECT id, name, tournament_id FROM teams WHERE tournament_id = :tid`,
    { replacements: { tid }, type: QueryTypes.SELECT }
  );

  console.log(`[Standings] Tournament ${tid}: ${teams.length} teams, ${matches.length} completed matches`);

  if (teams.length === 0) {
    console.warn(`[Standings] No teams with tournament_id=${tid} found. Check that teams are assigned to this tournament.`);
    // Clear stale standings and exit
    await sequelize.query(`DELETE FROM standings WHERE tournament_id = :tid`, {
      replacements: { tid }, type: QueryTypes.RAW,
    });
    return [];
  }

  // 3. Build stat map keyed by team id
  const map = new Map<number, {
    teamId: number;
    played: number; won: number; lost: number; drawn: number;
    points: number; goalsFor: number; goalsAgainst: number; goalDifference: number;
  }>();

  for (const team of teams) {
    map.set(team.id, {
      teamId: team.id,
      played: 0, won: 0, lost: 0, drawn: 0,
      points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0,
    });
  }

  // 4. Process every completed match with valid scores
  for (const m of matches) {
    const hs = Number(m.home_score);
    const as_ = Number(m.away_score);
    const home = map.get(m.home_team_id);
    const away = map.get(m.away_team_id);

    // A team not in this tournament's roster is still counted if they played
    // (handles edge cases where team was moved but match exists)
    const homeEntry = home ?? {
      teamId: m.home_team_id,
      played: 0, won: 0, lost: 0, drawn: 0,
      points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0,
    };
    const awayEntry = away ?? {
      teamId: m.away_team_id,
      played: 0, won: 0, lost: 0, drawn: 0,
      points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0,
    };

    if (!home) map.set(m.home_team_id, homeEntry);
    if (!away) map.set(m.away_team_id, awayEntry);

    homeEntry.played++;
    awayEntry.played++;
    homeEntry.goalsFor     += hs;
    homeEntry.goalsAgainst += as_;
    awayEntry.goalsFor     += as_;
    awayEntry.goalsAgainst += hs;

    if (hs > as_) {
      homeEntry.won++;    homeEntry.points += 3;
      awayEntry.lost++;
    } else if (as_ > hs) {
      awayEntry.won++;    awayEntry.points += 3;
      homeEntry.lost++;
    } else {
      homeEntry.drawn++;  homeEntry.points += 1;
      awayEntry.drawn++;  awayEntry.points += 1;
    }

    homeEntry.goalDifference = homeEntry.goalsFor - homeEntry.goalsAgainst;
    awayEntry.goalDifference = awayEntry.goalsFor - awayEntry.goalsAgainst;
  }

  // 5. Sort: points → GD → GF → wins
  const sorted = Array.from(map.values())
    .sort((a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      b.won - a.won
    )
    .map((s, i) => ({ ...s, rankPosition: i + 1, tournamentId: tid }));

  // 6. Wipe + rewrite standings using raw SQL — zero aliasing issues
  await sequelize.query(`DELETE FROM standings WHERE tournament_id = :tid`, {
    replacements: { tid }, type: QueryTypes.RAW,
  });

  if (sorted.length > 0) {
    const values = sorted.map(s =>
      `(${tid}, ${s.teamId}, ${s.played}, ${s.won}, ${s.lost}, ${s.drawn}, ${s.points}, ${s.goalsFor}, ${s.goalsAgainst}, ${s.goalDifference}, ${s.rankPosition}, NOW(), NOW())`
    ).join(',\n');

    await sequelize.query(
      `INSERT INTO standings (tournament_id, team_id, played, won, lost, drawn, points, goals_for, goals_against, goal_difference, rank_position, created_at, updated_at)
       VALUES ${values}`,
      { type: QueryTypes.RAW }
    );
  }

  // 7. Mirror stats back to each team row (wins, losses, draws, points, gf, ga)
  for (const s of sorted) {
    await sequelize.query(
      `UPDATE teams SET wins=:won, losses=:lost, draws=:drawn, points=:pts,
       goals_for=:gf, goals_against=:ga
       WHERE id=:id`,
      {
        replacements: {
          won: s.won, lost: s.lost, drawn: s.drawn, pts: s.points,
          gf: s.goalsFor, ga: s.goalsAgainst, id: s.teamId,
        },
        type: QueryTypes.RAW,
      }
    );
  }

  console.log(`✅ Standings saved for tournament ${tid}:`,
    sorted.map(s => `#${s.rankPosition} team${s.teamId} → ${s.points}pts (${s.won}W ${s.drawn}D ${s.lost}L ${s.goalsFor}:${s.goalsAgainst})`).join(' | ')
  );

  return sorted;
};

// ── Also sync Result table when a match is completed ────────────────────────
export const syncResultRecord = async (matchId: number, homeScore: number, awayScore: number, homeTeamId: number, awayTeamId: number) => {
  const winnerId = homeScore > awayScore ? homeTeamId : awayScore > homeScore ? awayTeamId : null;
  
  // Use raw SQL to avoid any ORM aliasing issues
  const existing = await sequelize.query<{ id: number }>(
    `SELECT id FROM results WHERE match_id = :mid LIMIT 1`,
    { replacements: { mid: matchId }, type: QueryTypes.SELECT }
  );

  if (existing.length > 0) {
    await sequelize.query(
      `UPDATE results SET home_score=:hs, away_score=:as_, winner_id=:wid, updated_at=NOW() WHERE match_id=:mid`,
      { replacements: { hs: homeScore, as_: awayScore, wid: winnerId, mid: matchId }, type: QueryTypes.RAW }
    );
  } else {
    await sequelize.query(
      `INSERT INTO results (match_id, home_score, away_score, winner_id, created_at, updated_at) VALUES (:mid, :hs, :as_, :wid, NOW(), NOW())`,
      { replacements: { hs: homeScore, as_: awayScore, wid: winnerId, mid: matchId }, type: QueryTypes.RAW }
    );
  }
};

export const standingController = {
  getByTournament: async (req: Request, res: Response) => {
    try {
      // Use raw SQL for the fetch too — guarantees correct snake_case → camelCase
      const rows = await sequelize.query<any>(
        `SELECT s.id, s.tournament_id, s.team_id, s.played, s.won, s.lost, s.drawn,
                s.points, s.goals_for, s.goals_against, s.goal_difference, s.rank_position,
                t.name AS team_name, t.color AS team_color, t.abbreviation AS team_abbr, t.sport AS team_sport
         FROM standings s
         LEFT JOIN teams t ON t.id = s.team_id
         WHERE s.tournament_id = :tid
         ORDER BY s.rank_position ASC`,
        { replacements: { tid: req.params.tournamentId }, type: QueryTypes.SELECT }
      );

      const data = rows.map(r => ({
        id:             r.id,
        teamId:         r.team_id,
        tournamentId:   r.tournament_id,
        played:         r.played,
        won:            r.won,
        lost:           r.lost,
        drawn:          r.drawn,
        points:         r.points,
        goalsFor:       r.goals_for,
        goalsAgainst:   r.goals_against,
        goalDifference: r.goal_difference,
        rankPosition:   r.rank_position,
        team: {
          id:           r.team_id,
          name:         r.team_name   ?? 'Unknown',
          color:        r.team_color  ?? '#00C8F8',
          abbreviation: r.team_abbr   ?? '?',
          sport:        r.team_sport  ?? '',
        },
      }));

      res.json({ message: 'OK', data });
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching standings', error: error.message });
    }
  },

  calculate: async (req: Request, res: Response) => {
    try {
      const sorted = await calculateStandings(req.params.tournamentId);
      res.json({ message: 'Standings calculated', data: sorted });
    } catch (error: any) {
      res.status(500).json({ message: 'Error calculating standings', error: error.message });
    }
  },

  /** Debug endpoint: GET /api/standings/debug/:tournamentId */
  debug: async (req: Request, res: Response) => {
    try {
      const tid = req.params.tournamentId;

      const [teams, matches, standings, results] = await Promise.all([
        sequelize.query(`SELECT id, name, tournament_id FROM teams WHERE tournament_id = :tid`, { replacements: { tid }, type: QueryTypes.SELECT }),
        sequelize.query(`SELECT id, home_team_id, away_team_id, home_score, away_score, status FROM matches WHERE tournament_id = :tid`, { replacements: { tid }, type: QueryTypes.SELECT }),
        sequelize.query(`SELECT * FROM standings WHERE tournament_id = :tid ORDER BY rank_position`, { replacements: { tid }, type: QueryTypes.SELECT }),
        sequelize.query(`SELECT r.* FROM results r JOIN matches m ON m.id = r.match_id WHERE m.tournament_id = :tid`, { replacements: { tid }, type: QueryTypes.SELECT }),
      ]);

      res.json({
        tournamentId: tid,
        teamsInTournament: teams,
        matches,
        results,
        currentStandings: standings,
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Debug error', error: error.message });
    }
  },
};
