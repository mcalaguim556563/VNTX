import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Result extends Model {
  public id!: number;
  public matchId!: number;
  public homeScore!: number;
  public awayScore!: number;
  public winnerId?: number;
  public highlights?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Result.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    matchId: { type: DataTypes.INTEGER, allowNull: false, unique: true, field: 'match_id' },
    homeScore: { type: DataTypes.INTEGER, allowNull: false, field: 'home_score' },
    awayScore: { type: DataTypes.INTEGER, allowNull: false, field: 'away_score' },
    winnerId: { type: DataTypes.INTEGER, allowNull: true, field: 'winner_id' },
    highlights: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: 'results', timestamps: true, underscored: true }
);

export default Result;
