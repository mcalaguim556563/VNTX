import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Sequelize, QueryTypes } from 'sequelize';
import sequelize from './config/database';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

// Load models + associations
import './models';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────
app.use('/api', routes);

// ── Health check ───────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'VNTX Backend is running', timestamp: new Date().toISOString() });
});

// ── Global error handler ───────────────────────────────
app.use(errorHandler);

/**
 * Safe targeted migrations — only ADDs missing columns, never removes or modifies.
 * This avoids the instability of sequelize.sync({ alter: true }).
 */
async function runMigrations(db: Sequelize): Promise<void> {
  const q = (sql: string) => db.query(sql, { type: QueryTypes.RAW });

  interface ColRow { COLUMN_NAME: string }
  const getColumns = async (table: string): Promise<string[]> => {
    const dbName = process.env.DB_NAME || 'vntx_db';
    const rows = await db.query<ColRow>(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${dbName}' AND TABLE_NAME = '${table}'`,
      { type: QueryTypes.SELECT }
    );
    return rows.map((r: ColRow) => r.COLUMN_NAME.toLowerCase());
  };

  // ── matches table ──────────────────────────────────────────────────────────
  const matchCols = await getColumns('matches');
  if (!matchCols.includes('home_team_name'))  await q("ALTER TABLE matches ADD COLUMN home_team_name VARCHAR(255) NULL");
  if (!matchCols.includes('away_team_name'))  await q("ALTER TABLE matches ADD COLUMN away_team_name VARCHAR(255) NULL");
  if (!matchCols.includes('match_time'))      await q("ALTER TABLE matches ADD COLUMN match_time VARCHAR(10) NULL");
  if (!matchCols.includes('venue'))           await q("ALTER TABLE matches ADD COLUMN venue VARCHAR(255) NULL");
  if (!matchCols.includes('round_name'))      await q("ALTER TABLE matches ADD COLUMN round_name VARCHAR(100) NULL");
  if (!matchCols.includes('match_number'))    await q("ALTER TABLE matches ADD COLUMN match_number INT NULL");
  if (!matchCols.includes('home_score'))      await q("ALTER TABLE matches ADD COLUMN home_score INT NULL");
  if (!matchCols.includes('away_score'))      await q("ALTER TABLE matches ADD COLUMN away_score INT NULL");

  // ── results table ──────────────────────────────────────────────────────────
  const resultCols = await getColumns('results');
  if (!resultCols.includes('highlights'))     await q("ALTER TABLE results ADD COLUMN highlights TEXT NULL");
  if (!resultCols.includes('winner_id'))      await q("ALTER TABLE results ADD COLUMN winner_id INT NULL");

  // ── teams table ────────────────────────────────────────────────────────────
  const teamCols = await getColumns('teams');
  if (!teamCols.includes('abbreviation'))     await q("ALTER TABLE teams ADD COLUMN abbreviation VARCHAR(10) NULL");
  if (!teamCols.includes('color'))            await q("ALTER TABLE teams ADD COLUMN color VARCHAR(20) NULL DEFAULT '#00C8F8'");
  if (!teamCols.includes('coach'))            await q("ALTER TABLE teams ADD COLUMN coach VARCHAR(255) NULL");
  if (!teamCols.includes('city'))             await q("ALTER TABLE teams ADD COLUMN city VARCHAR(255) NULL");
  if (!teamCols.includes('sport'))            await q("ALTER TABLE teams ADD COLUMN sport VARCHAR(100) NULL DEFAULT 'Soccer'");
  if (!teamCols.includes('wins'))             await q("ALTER TABLE teams ADD COLUMN wins INT NOT NULL DEFAULT 0");
  if (!teamCols.includes('losses'))           await q("ALTER TABLE teams ADD COLUMN losses INT NOT NULL DEFAULT 0");
  if (!teamCols.includes('draws'))            await q("ALTER TABLE teams ADD COLUMN draws INT NOT NULL DEFAULT 0");
  if (!teamCols.includes('points'))           await q("ALTER TABLE teams ADD COLUMN points INT NOT NULL DEFAULT 0");
  if (!teamCols.includes('goals_for'))        await q("ALTER TABLE teams ADD COLUMN goals_for INT NOT NULL DEFAULT 0");
  if (!teamCols.includes('goals_against'))    await q("ALTER TABLE teams ADD COLUMN goals_against INT NOT NULL DEFAULT 0");
  if (!teamCols.includes('player_count'))     await q("ALTER TABLE teams ADD COLUMN player_count INT NOT NULL DEFAULT 0");
  if (!teamCols.includes('tournament_id'))    await q("ALTER TABLE teams ADD COLUMN tournament_id INT NULL");

  // ── standings table ────────────────────────────────────────────────────────
  const standCols = await getColumns('standings');
  if (!standCols.includes('rank_position'))   await q("ALTER TABLE standings ADD COLUMN rank_position INT NOT NULL DEFAULT 0");
  if (!standCols.includes('goal_difference')) await q("ALTER TABLE standings ADD COLUMN goal_difference INT NOT NULL DEFAULT 0");
  if (!standCols.includes('goals_for'))       await q("ALTER TABLE standings ADD COLUMN goals_for INT NOT NULL DEFAULT 0");
  if (!standCols.includes('goals_against'))   await q("ALTER TABLE standings ADD COLUMN goals_against INT NOT NULL DEFAULT 0");
  if (!standCols.includes('drawn'))           await q("ALTER TABLE standings ADD COLUMN drawn INT NOT NULL DEFAULT 0");

  // ── tournaments table ──────────────────────────────────────────────────────
  const tourCols = await getColumns('tournaments');
  if (!tourCols.includes('prize_pool'))       await q("ALTER TABLE tournaments ADD COLUMN prize_pool VARCHAR(255) NULL");
  if (!tourCols.includes('organizer'))        await q("ALTER TABLE tournaments ADD COLUMN organizer VARCHAR(255) NULL");
  if (!tourCols.includes('description'))      await q("ALTER TABLE tournaments ADD COLUMN description TEXT NULL");
  if (!tourCols.includes('max_teams'))        await q("ALTER TABLE tournaments ADD COLUMN max_teams INT NOT NULL DEFAULT 8");
  if (!tourCols.includes('team_count'))       await q("ALTER TABLE tournaments ADD COLUMN team_count INT NOT NULL DEFAULT 0");

  console.log('✅ Safe migrations completed');
}

// ── Start ──────────────────────────────────────────────
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL database connected');

    // First sync models to create any missing tables (safe — alter:false won't drop columns)
    await sequelize.sync({ alter: false });
    console.log('✅ Database models synchronized');

    // Then add any missing columns that sequelize.sync doesn't handle
    await runMigrations(sequelize);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 API:    http://localhost:${PORT}/api`);
      console.log(`❤️  Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

start();

export default app;
