import { Request, Response } from 'express';
import { Tournament, Team, Match } from '../models';

export const tournamentController = {
  create: async (req: Request, res: Response) => {
    try {
      const tournament = await Tournament.create(req.body);
      res.status(201).json({ message: 'Tournament created', data: tournament });
    } catch (error: any) {
      res.status(400).json({ message: 'Error creating tournament', error: error.message });
    }
  },

  getAll: async (_req: Request, res: Response) => {
    try {
      const tournaments = await Tournament.findAll({
        order: [['createdAt', 'DESC']],
        include: [
          { model: Team, as: 'teams', attributes: ['id', 'name'] },
          { model: Match, as: 'matches', attributes: ['id', 'status'] },
        ],
      });

      // Ensure teamCount reflects the live association, not just the cached column
      const data = tournaments.map((t: any) => {
        const raw = t.toJSON ? t.toJSON() : t;
        const liveTeamCount = Array.isArray(raw.teams) ? raw.teams.length : (raw.team_count ?? raw.teamCount ?? 0);
        return { ...raw, teamCount: liveTeamCount, team_count: liveTeamCount };
      });

      res.json({ message: 'OK', data });
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching tournaments', error: error.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const tournament = await Tournament.findByPk(req.params.id, {
        include: [
          { model: Team, as: 'teams' },
          { model: Match, as: 'matches', include: [{ model: Team, as: 'homeTeam', attributes: ['id', 'name'] }, { model: Team, as: 'awayTeam', attributes: ['id', 'name'] }] },
        ],
      });
      if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
      res.json({ message: 'OK', data: tournament });
    } catch (error: any) {
      res.status(500).json({ message: 'Error', error: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const tournament = await Tournament.findByPk(req.params.id);
      if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
      await tournament.update(req.body);

      // Recount actual teams and persist — avoids client sending stale teamCount
      const liveCount = await Team.count({ where: { tournamentId: tournament.id } });
      if ((tournament as any).teamCount !== liveCount) {
        await tournament.update({ teamCount: liveCount });
      }

      // Return with fresh data
      const fresh = await Tournament.findByPk(tournament.id, {
        include: [{ model: Team, as: 'teams', attributes: ['id', 'name'] }]
      });
      res.json({ message: 'Tournament updated', data: fresh });
    } catch (error: any) {
      res.status(400).json({ message: 'Error updating', error: error.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const tournament = await Tournament.findByPk(req.params.id);
      if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
      await tournament.destroy();
      res.json({ message: 'Tournament deleted' });
    } catch (error: any) {
      res.status(500).json({ message: 'Error deleting', error: error.message });
    }
  },
};
