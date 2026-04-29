import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.DB_NAME
  || process.env.DB_DATABASE
  || process.env.MYSQL_ADDON_DB
  || 'vntx';

const dbUser = process.env.DB_USER
  || process.env.DB_USERNAME
  || process.env.MYSQL_ADDON_USER
  || 'root';

const dbPassword = process.env.DB_PASSWORD
  || process.env.MYSQL_ADDON_PASSWORD
  || '';

const dbHost = process.env.DB_HOST
  || process.env.MYSQL_ADDON_HOST
  || 'localhost';

const dbPort = parseInt(
  process.env.DB_PORT
    || process.env.MYSQL_ADDON_PORT
    || '3306',
  10
);

const useSsl = ['1', 'true', 'yes'].includes((process.env.DB_SSL || '').toLowerCase());

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  timezone: '+00:00',
  dialectOptions: useSsl
    ? { ssl: { rejectUnauthorized: false } }
    : undefined,
});

export default sequelize;
