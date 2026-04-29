import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { Match, Team, Tournament, Result } from '../models';
import sequelize from '../config/database';
import { calculateStandings, syncResultRecord } from './standings.controller';

/** Flatten the Sequelize match instance into the shape the frontend expects */
function normalize(match: any, homeTeam: any, awayTeam: any) {
  const raw = match.toJSON ? match.toJSON() : match;

  // matchDate from DATEONLY can come back as a Date object or ISO string
  let matchDateStr = raw.matchDate ?? raw.match_date ?? '';
  if (matchDateStr instanceof Date) {
    matchDateStr = matchDateStr.toISOString().split('T')[0];
  } else if (typeof matchDateStr === 'string' && matchDateStr.includes('T')) {
    matchDateStr = matchDateStr.split('T')[0];
  }

  return {
    ...raw,
    homeTeamName: homeTeam?.name ?? raw.homeTeamName ?? raw.home_team_name ?? '',
    awayTeamName: awayTeam?.name ?? raw.awayTeamName ?? raw.away_team_name ?? '',
    matchDate:    matchDateStr,
    matchTime:    raw.matchTime    ?? raw.match_time    ?? '',
    roundName:    raw.roundName    ?? raw.round_name    ?? '',
    tournamentId: raw.tournamentId ?? raw.tournament_id ?? null,
    homeTeamId:   raw.homeTeamId   ?? raw.home_team_id  ?? null,
    awayTeamId:   raw.awayTeamId   ?? raw.away_team_id  ?? null,
    homeScore:    raw.homeScore    !== undefined ? raw.homeScore    : (raw.home_score    ?? null),
    awayScore:    raw.awayScore    !== undefined ? raw.awayScore    : (raw.away_score    ?? null),
  };
}

/**
 * When a match is saved, sync the Result record and recalculate standings.
 * Uses raw field access to avoid any Sequelize aliasing ambiguity.
 */
async function syncResultAndStandings(matchId: number) {
  const rows = await sequelize.query<{
    id: number;
    tournament_id: number;
    home_team_id: number;
    away_team_id: number;
    home_score: number | null;
    away_score: number | null;
    status: string;
  }>(
    `SELECT id, tournament_id, home_team_id, away_team_id, home_score, away_score, status
     FROM matches WHERE id = :id LIMIT 1`,
    { replacements: { id: matchId }, type: QueryTypes.SELECT }
  );

  if (rows.length === 0) return;
  const m = rows[0];

  const hs = m.home_score !== null && m.home_score !== undefined ? Number(m.home_score) : null;
  const as_ = m.away_score !== null && m.away_score !== undefined ? Number(m.away_score) : null;

  console.log(`[syncResultAndStandings] match ${m.id} status=${m.status} home=${hs} away=${as_} tournament=${m.tournament_id}`);

  if (m.status === 'completed' && hs !== null && as_ !== null) {
    // Upsert the Result record
    await syncResultRecord(m.id, hs, as_, m.home_team_id, m.away_team_id);
    // Recalculate standings for the tournament
    if (m.tournament_id) {
      await calculateStandings(m.tournament_id);
    }
  } else if (m.status !== 'completed') {
    // If moved away from completed — remove result and recalculate
    await sequelize.query(
      `DELETE FROM results WHERE match_id = :mid`,
      { replacements: { mid: m.id }, type: QueryTypes.RAW }
    );
    if (m.tournament_id) {
      await calculateStandings(m.tournament_id);
    }
  }
}

export const matchController = {
  create: async (req: Request, res: Response) => {
    try {
      const {
        homeTeamId, awayTeamId, tournamentId,
        matchDate, matchTime, venue, status,
        roundName, matchNumber, homeScore, awayScore,
      } = req.body;

      const [homeTeam, awayTeam] = await Promise.all([
        Team.findByPk(homeTeamId, { attributes: ['id', 'name', 'color', 'abbreviation'] }),
        Team.findByPk(awayTeamId, { attributes: ['id', 'name', 'color', 'abbreviation'] }),
      ]);

      const match = await Match.create({
        tournamentId,
        homeTeamId,
        awayTeamId,
        homeTeamName: (homeTeam as any)?.name ?? '',
        awayTeamName: (awayTeam as any)?.name ?? '',
        matchDate,
        matchTime,
        venue,
        status: status ?? 'scheduled',
        roundName,
        matchNumber: matchNumber ?? null,
        homeScore: homeScore ?? null,
        awayScore: awayScore ?? null,
      });

      await syncResultAndStandings(match.id);

      res.status(201).json({ message: 'Match created', data: normalize(match, homeTeam, awayTeam) });
    } catch (error: any) {
      res.status(400).json({ message: 'Error creating match', error: error.message });
    }
  },

  getAll: async (_req: Request, res: Response) => {
    try {
      const matches = await Match.findAll({
        order: [['match_date', 'DESC']],
        include: [
          { model: Team, as: 'homeTeam', attributes: ['id', 'name', 'color', 'abbreviation'] },
          { model: Team, as: 'awayTeam', attributes: ['id', 'name', 'color', 'abbreviation'] },
          { model: Tournament, as: 'tournament', attributes: ['id', 'name'] },
          { model: Result, as: 'result' },
        ],
      });
      res.json({
        message: 'OK',
        data: matches.map(m => normalize(m, (m as any).homeTeam, (m as any).awayTeam)),
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching matches', error: error.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const match = await Match.findByPk(req.params.id, {
        include: [
          { model: Team, as: 'homeTeam', attributes: ['id', 'name', 'color', 'abbreviation'] },
          { model: Team, as: 'awayTeam', attributes: ['id', 'name', 'color', 'abbreviation'] },
          { model: Tournament, as: 'tournament' },
          { model: Result, as: 'result' },
        ],
      });
      if (!match) return res.status(404).json({ message: 'Match not found' });
      res.json({ message: 'OK', data: normalize(match, (match as any).homeTeam, (match as any).awayTeam) });
    } catch (error: any) {
      res.status(500).json({ message: 'Error', error: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const match = await Match.findByPk(req.params.id);
      if (!match) return res.status(404).json({ message: 'Match not found' });

      const { homeTeamId, awayTeamId } = req.body;

      let homeTeamName = req.body.homeTeamName;
      let awayTeamName = req.body.awayTeamName;

      const [homeTeamObj, awayTeamObj] = await Promise.all([
        homeTeamId ? Team.findByPk(homeTeamId, { attributes: ['id', 'name'] }) : Promise.resolve(null),
        awayTeamId ? Team.findByPk(awayTeamId, { attributes: ['id', 'name'] }) : Promise.resolve(null),
      ]);
      if (homeTeamObj) homeTeamName = (homeTeamObj as any).name;
      if (awayTeamObj) awayTeamName = (awayTeamObj as any).name;

      await match.update({ ...req.body, homeTeamName, awayTeamName });

      await syncResultAndStandings(match.id);

      const updated = await Match.findByPk(match.id, {
        include: [
          { model: Team, as: 'homeTeam', attributes: ['id', 'name', 'color', 'abbreviation'] },
          { model: Team, as: 'awayTeam', attributes: ['id', 'name', 'color', 'abbreviation'] },
          { model: Result, as: 'result' },
        ],
      });

      res.json({
        message: 'Match updated',
        data: normalize(updated!, (updated as any)?.homeTeam, (updated as any)?.awayTeam),
      });
    } catch (error: any) {
      res.status(400).json({ message: 'Error updating', error: error.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const match = await Match.findByPk(req.params.id);
      if (!match) return res.status(404).json({ message: 'Match not found' });

      // Get tournament_id before deletion
      const rows = await sequelize.query<{ tournament_id: number }>(
        `SELECT tournament_id FROM matches WHERE id = :id LIMIT 1`,
        { replacements: { id: match.id }, type: QueryTypes.SELECT }
      );
      const tournamentId = rows[0]?.tournament_id ?? null;

      // Delete result then match
      await sequelize.query(`DELETE FROM results WHERE match_id = :mid`, { replacements: { mid: match.id }, type: QueryTypes.RAW });
      await match.destroy();

      if (tournamentId) {
        await calculateStandings(tournamentId);
      }

      res.json({ message: 'Match deleted' });
    } catch (error: any) {
      res.status(500).json({ message: 'Error deleting', error: error.message });
    }
  },
};
