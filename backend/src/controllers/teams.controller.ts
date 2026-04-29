import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Team, Tournament, Match } from '../models';
import { calculateStandings } from './standings.controller';

/** Recount how many teams belong to a given tournament and persist the value. */
async function syncTournamentTeamCount(tournamentId: number | string | null) {
  if (!tournamentId) return;
  const count = await Team.count({ where: { tournamentId } });
  await Tournament.update({ teamCount: count }, { where: { id: tournamentId } });
}

export const teamController = {
  create: async (req: Request, res: Response) => {
    try {
      const team = await Team.create(req.body);
      // Keep tournament's team count in sync
      const tid = (team as any).tournamentId ?? (team as any).tournament_id ?? req.body.tournamentId ?? null;
      await syncTournamentTeamCount(tid);
      res.status(201).json({ message: 'Team created', data: team });
    } catch (error: any) {
      res.status(400).json({ message: 'Error creating team', error: error.message });
    }
  },

  getAll: async (_req: Request, res: Response) => {
    try {
      const teams = await Team.findAll({
        order: [['createdAt', 'DESC']],
        include: [{ model: Tournament, as: 'tournament', attributes: ['id', 'name'] }],
      });
      res.json({ message: 'OK', data: teams });
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching teams', error: error.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const team = await Team.findByPk(req.params.id, { include: [{ model: Tournament, as: 'tournament' }] });
      if (!team) return res.status(404).json({ message: 'Team not found' });
      res.json({ message: 'OK', data: team });
    } catch (error: any) {
      res.status(500).json({ message: 'Error', error: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const team = await Team.findByPk(req.params.id);
      if (!team) return res.status(404).json({ message: 'Team not found' });

      const oldTournamentId = (team as any).tournamentId ?? (team as any).tournament_id ?? null;
      await team.update(req.body);

      // Sync team name to match denormalized fields
      if (req.body.name) {
        await Match.update(
          { homeTeamName: req.body.name },
          { where: { homeTeamId: team.id } }
        );
        await Match.update(
          { awayTeamName: req.body.name },
          { where: { awayTeamId: team.id } }
        );
      }

      const newTournamentId = (team as any).tournamentId ?? (team as any).tournament_id ?? null;

      // Sync team count for old and new tournaments
      if (oldTournamentId) await syncTournamentTeamCount(oldTournamentId);
      if (newTournamentId && newTournamentId !== oldTournamentId) {
        await syncTournamentTeamCount(newTournamentId);
      }

      // Recalculate standings so any name/stat changes propagate
      const activeTournamentId = newTournamentId ?? oldTournamentId;
      if (activeTournamentId) {
        await calculateStandings(activeTournamentId);
      }

      res.json({ message: 'Team updated', data: team });
    } catch (error: any) {
      res.status(400).json({ message: 'Error updating', error: error.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const team = await Team.findByPk(req.params.id);
      if (!team) return res.status(404).json({ message: 'Team not found' });

      const tournamentId = (team as any).tournamentId || (team as any).tournament_id;

      // Delete matches associated with this team
      await Match.destroy({
        where: {
          [Op.or]: [{ homeTeamId: team.id }, { awayTeamId: team.id }]
        }
      });

      await team.destroy();

      if (tournamentId) {
        await syncTournamentTeamCount(tournamentId);
        await calculateStandings(tournamentId);
      }

      res.json({ message: 'Team deleted' });
    } catch (error: any) {
      res.status(500).json({ message: 'Error deleting', error: error.message });
    }
  },
};
