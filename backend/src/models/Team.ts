import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Team extends Model {
  public id!: number;
  public name!: string;
  public abbreviation!: string;
  public sport!: string;
  public coach!: string;
  public city!: string;
  public color!: string;
  public wins!: number;
  public losses!: number;
  public draws!: number;
  public points!: number;
  public goalsFor!: number;
  public goalsAgainst!: number;
  public playerCount!: number;
  public tournamentId!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Team.init(
  {
    id:           { type: DataTypes.INTEGER,       autoIncrement: true, primaryKey: true },
    name:         { type: DataTypes.STRING(255),   allowNull: false },
    abbreviation: { type: DataTypes.STRING(10),    allowNull: true },
    sport:        { type: DataTypes.STRING(100),   allowNull: false },
    coach:        { type: DataTypes.STRING(255),   allowNull: true },
    city:         { type: DataTypes.STRING(255),   allowNull: true },
    color:        { type: DataTypes.STRING(20),    allowNull: true, defaultValue: '#00C8F8' },
    wins:         { type: DataTypes.INTEGER,       defaultValue: 0 },
    losses:       { type: DataTypes.INTEGER,       defaultValue: 0 },
    draws:        { type: DataTypes.INTEGER,       defaultValue: 0 },
    points:       { type: DataTypes.INTEGER,       defaultValue: 0 },
    goalsFor:     { type: DataTypes.INTEGER,       defaultValue: 0, field: 'goals_for' },
    goalsAgainst: { type: DataTypes.INTEGER,       defaultValue: 0, field: 'goals_against' },
    playerCount:  { type: DataTypes.INTEGER,       defaultValue: 0, field: 'player_count' },
    tournamentId: { type: DataTypes.INTEGER,       allowNull: true, field: 'tournament_id' },
  },
  { sequelize, tableName: 'teams', timestamps: true, underscored: true }
);

export default Team;
