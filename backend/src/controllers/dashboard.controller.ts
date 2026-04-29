import { Request, Response } from 'express';
import { Tournament, Team, Match, Result } from '../models';
import { Op, QueryTypes } from 'sequelize';
import sequelize from '../config/database';

export const dashboardController = {
  getStats: async (_req: Request, res: Response) => {
    try {
      const [totalTournaments, activeTournaments, totalTeams, totalMatches, completedMatches, liveMatches, totalResults] =
        await Promise.all([
          Tournament.count(),
          Tournament.count({ where: { status: 'in_progress' } }),
          Team.count(),
          Match.count(),
          Match.count({ where: { status: 'completed' } }),
          Match.count({ where: { status: 'live' } }),
          Result.count(),
        ]);

      const upcomingMatches = await Match.count({ where: { status: 'scheduled' } });

      res.json({ totalTournaments, activeTournaments, totalTeams, totalMatches, completedMatches, liveMatches, upcomingMatches, totalResults });
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
  },

  getRecent: async (_req: Request, res: Response) => {
    try {
      const [recentTournaments, recentTeams, recentMatches] = await Promise.all([
        Tournament.findAll({ limit: 4, order: [['createdAt', 'DESC']] }),
        Team.findAll({
          limit: 4,
          order: [['createdAt', 'DESC']],
          include: [{ model: Tournament, as: 'tournament', attributes: ['id', 'name'] }],
        }),
        Match.findAll({
          limit: 6,
          order: [['createdAt', 'DESC']],
          include: [
            { model: Team, as: 'homeTeam', attributes: ['id', 'name', 'color', 'abbreviation'] },
            { model: Team, as: 'awayTeam', attributes: ['id', 'name', 'color', 'abbreviation'] },
            { model: Tournament, as: 'tournament', attributes: ['id', 'name'] },
            { model: Result, as: 'result' },
          ],
        }),
      ]);
      res.json({ tournaments: recentTournaments, teams: recentTeams, matches: recentMatches });
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching recent', error: error.message });
    }
  },

  getUpcoming: async (_req: Request, res: Response) => {
    try {
      const upcoming = await Match.findAll({
        where: { status: 'scheduled' },
        order: [['match_date', 'ASC']],
        limit: 10,
        include: [
          { model: Team, as: 'homeTeam', attributes: ['id', 'name', 'color'] },
          { model: Team, as: 'awayTeam', attributes: ['id', 'name', 'color'] },
          { model: Tournament, as: 'tournament', attributes: ['id', 'name'] },
        ],
      });
      res.json(upcoming);
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching upcoming', error: error.message });
    }
  },

  getResultsDistribution: async (_req: Request, res: Response) => {
    try {
      // ── Strategy: query results.created_at (always set) so any recorded
      //    result appears, regardless of the associated match_date value.
      const rows: any[] = await sequelize.query(
        `SELECT DATE_FORMAT(r.created_at, '%Y-%m') AS month, COUNT(*) AS count
         FROM results r
         WHERE r.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
         GROUP BY month
         ORDER BY month ASC`,
        { type: QueryTypes.SELECT }
      );

      // Also query completed matches per month as a fallback
      const matchRows: any[] = await sequelize.query(
        `SELECT DATE_FORMAT(COALESCE(match_date, created_at), '%Y-%m') AS month, COUNT(*) AS count
         FROM matches
         WHERE status = 'completed'
           AND COALESCE(match_date, created_at) >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
         GROUP BY month
         ORDER BY month ASC`,
        { type: QueryTypes.SELECT }
      );

      // Build full 6-month range so chart always has all data points
      const result: { month: string; results: number; matches: number }[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const lbl = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

        const foundResult = rows.find((r: any) => r.month === key);
        const foundMatch  = matchRows.find((r: any) => r.month === key);

        result.push({
          month:   lbl,
          results: foundResult ? Number(foundResult.count) : 0,
          matches: foundMatch  ? Number(foundMatch.count)  : 0,
        });
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching chart data', error: error.message });
    }
  },

  // ── New: overall analytics snapshot ─────────────────────────────────────────
  getAnalytics: async (_req: Request, res: Response) => {
    try {
      // Top scoring matches
      const topMatches: any[] = await sequelize.query(
        `SELECT m.id, m.home_team_name, m.away_team_name,
                r.home_score, r.away_score,
                (r.home_score + r.away_score) AS total_goals
         FROM matches m
         JOIN results r ON r.match_id = m.id
         ORDER BY total_goals DESC
         LIMIT 5`,
        { type: QueryTypes.SELECT }
      );

      // Tournament match distribution
      const tournamentDist: any[] = await sequelize.query(
        `SELECT t.name AS tournament, COUNT(m.id) AS match_count,
                SUM(CASE WHEN m.status = 'completed' THEN 1 ELSE 0 END) AS completed
         FROM tournaments t
         LEFT JOIN matches m ON m.tournament_id = t.id
         GROUP BY t.id, t.name
         ORDER BY match_count DESC
         LIMIT 6`,
        { type: QueryTypes.SELECT }
      );

      res.json({ topMatches, tournamentDist });
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching analytics', error: error.message });
    }
  },
};
