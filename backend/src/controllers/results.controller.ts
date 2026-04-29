import { Request, Response } from 'express';
import { Result, Match, Team } from '../models';
import { calculateStandings } from './standings.controller';

export const resultController = {
  create: async (req: Request, res: Response) => {
    try {
      const { matchId, homeScore, awayScore, highlights } = req.body;
      const existing = await Result.findOne({ where: { matchId } });
      if (existing) return res.status(400).json({ message: 'Result already exists for this match' });

      const match = await Match.findByPk(matchId);
      if (!match) return res.status(404).json({ message: 'Match not found' });

      let winnerId: number | null = null;
      if (homeScore > awayScore) winnerId = (match as any).homeTeamId;
      else if (awayScore > homeScore) winnerId = (match as any).awayTeamId;

      const result = await Result.create({ matchId, homeScore, awayScore, winnerId, highlights });
      await Match.update({ status: 'completed' }, { where: { id: matchId } });

      await calculateStandings((match as any).tournamentId);

      res.status(201).json({ message: 'Result created', data: result });
    } catch (error: any) {
      res.status(400).json({ message: 'Error creating result', error: error.message });
    }
  },

  getAll: async (_req: Request, res: Response) => {
    try {
      const results = await Result.findAll({
        order: [['createdAt', 'DESC']],
        include: [
          { model: Match, as: 'match', include: [{ model: Team, as: 'homeTeam', attributes: ['id', 'name'] }, { model: Team, as: 'awayTeam', attributes: ['id', 'name'] }] },
          { model: Team, as: 'winner', attributes: ['id', 'name'] },
        ],
      });
      res.json({ message: 'OK', data: results });
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching results', error: error.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const result = await Result.findByPk(req.params.id, {
        include: [{ model: Match, as: 'match', include: [{ model: Team, as: 'homeTeam' }, { model: Team, as: 'awayTeam' }] }, { model: Team, as: 'winner' }],
      });
      if (!result) return res.status(404).json({ message: 'Result not found' });
      res.json({ message: 'OK', data: result });
    } catch (error: any) {
      res.status(500).json({ message: 'Error', error: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const result = await Result.findByPk(req.params.id, { include: [{ model: Match, as: 'match' }] });
      if (!result) return res.status(404).json({ message: 'Result not found' });
      const { homeScore, awayScore, highlights } = req.body;
      const match = (result as any).match;
      let winnerId: number | null = null;
      if (homeScore > awayScore) winnerId = match?.homeTeamId ?? null;
      else if (awayScore > homeScore) winnerId = match?.awayTeamId ?? null;
      await result.update({ homeScore, awayScore, winnerId, highlights });
      
      if (match?.tournamentId) {
        await calculateStandings(match.tournamentId);
      }

      res.json({ message: 'Result updated', data: result });
    } catch (error: any) {
      res.status(400).json({ message: 'Error updating', error: error.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const result = await Result.findByPk(req.params.id);
      if (!result) return res.status(404).json({ message: 'Result not found' });
      const matchInfo = await Match.findByPk((result as any).matchId);
      await Match.update({ status: 'scheduled' }, { where: { id: (result as any).matchId } });
      await result.destroy();

      if (matchInfo?.tournamentId) {
          await calculateStandings(matchInfo.tournamentId);
      }

      res.json({ message: 'Result deleted' });
    } catch (error: any) {
      res.status(500).json({ message: 'Error deleting', error: error.message });
    }
  },
};
