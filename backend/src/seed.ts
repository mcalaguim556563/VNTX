/**
 * VNTX Clean Seed Script
 * Run from project root: npx ts-node --project backend/tsconfig.json backend/src/seed.ts
 */
import path from 'path';
import dotenv from 'dotenv';
// Load backend .env explicitly (when run from project root)
dotenv.config({ path: path.join(__dirname, '../.env') });

import sequelize from './config/database';
import './models'; // load associations
import { Tournament, Team, Match, Result, Standing } from './models';

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected');

    // ── Wipe everything safely (disable FK checks for truncation) ──
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.query('TRUNCATE TABLE results');
    await sequelize.query('TRUNCATE TABLE standings');
    await sequelize.query('TRUNCATE TABLE matches');
    await sequelize.query('TRUNCATE TABLE teams');
    await sequelize.query('TRUNCATE TABLE tournaments');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🗑️  All data cleared');

    // ── 4 Tournaments ─────────────────────────────────────
    const [t1, t2, t3, t4] = await Tournament.bulkCreate([
      {
        name: 'VNTX Champions Cup 2025',
        sport: 'Soccer',
        format: 'Round Robin',
        status: 'in_progress',
        startDate: '2025-05-01',
        endDate: '2025-07-31',
        venue: 'National Stadium',
        description: 'Premier soccer tournament of the year.',
        maxTeams: 4,
        teamCount: 0,
        prizePool: '₱500,000',
        organizer: 'VNTX Sports',
      },
      {
        name: 'Metro Basketball League 2025',
        sport: 'Basketball',
        format: 'Single Elimination',
        status: 'upcoming',
        startDate: '2025-08-01',
        endDate: '2025-09-30',
        venue: 'Metro Sports Arena',
        description: 'City-wide basketball championship.',
        maxTeams: 4,
        teamCount: 0,
        prizePool: '₱250,000',
        organizer: 'Metro Sports Council',
      },
      {
        name: 'Summer Tennis Open 2025',
        sport: 'Tennis',
        format: 'Single Elimination',
        status: 'draft',
        startDate: '2025-10-01',
        endDate: '2025-10-15',
        venue: 'Rizal Memorial Courts',
        description: 'Open tennis tournament for all skill levels.',
        maxTeams: 4,
        teamCount: 0,
        prizePool: '₱100,000',
        organizer: 'Philippine Tennis Federation',
      },
      {
        name: 'National Volleyball Championship',
        sport: 'Volleyball',
        format: 'Round Robin',
        status: 'completed',
        startDate: '2025-01-10',
        endDate: '2025-03-20',
        venue: 'PhilSports Arena',
        description: 'Annual national volleyball championship.',
        maxTeams: 4,
        teamCount: 0,
        prizePool: '₱150,000',
        organizer: 'VNTX Volleyball Assoc.',
      },
    ]) as any[];

    console.log('🏆 4 Tournaments created');

    // ── 4 Teams (all in Tournament 1) ─────────────────────
    const [teamA, teamB, teamC, teamD] = await Team.bulkCreate([
      {
        name: 'Manila Eagles',
        abbreviation: 'MEA',
        sport: 'Soccer',
        coach: 'Carlos Ramirez',
        city: 'Manila',
        color: '#00C8F8',
        playerCount: 16,
        tournamentId: t1.id,
      },
      {
        name: 'Cebu Strikers FC',
        abbreviation: 'CSF',
        sport: 'Soccer',
        coach: 'Jose Fernandez',
        city: 'Cebu',
        color: '#10B981',
        playerCount: 15,
        tournamentId: t1.id,
      },
      {
        name: 'Davao Warriors',
        abbreviation: 'DWR',
        sport: 'Soccer',
        coach: 'Miguel Santos',
        city: 'Davao',
        color: '#F59E0B',
        playerCount: 14,
        tournamentId: t1.id,
      },
      {
        name: 'Quezon United',
        abbreviation: 'QZU',
        sport: 'Soccer',
        coach: 'Roberto Cruz',
        city: 'Quezon City',
        color: '#6366F1',
        playerCount: 16,
        tournamentId: t1.id,
      },
    ]) as any[];

    // Update tournament team count
    await Tournament.update({ teamCount: 4 }, { where: { id: t1.id } });

    console.log('👥 4 Teams created');
    console.log('✅ Seed complete! Now go add matches and results via the admin panel.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
