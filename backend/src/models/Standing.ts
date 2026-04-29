import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Standing extends Model {
  public id!: number;
  public tournamentId!: number;
  public teamId!: number;
  public played!: number;
  public won!: number;
  public lost!: number;
  public drawn!: number;
  public points!: number;
  public goalsFor!: number;
  public goalsAgainst!: number;
  public goalDifference!: number;
  public rankPosition!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Standing.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tournamentId: { type: DataTypes.INTEGER, allowNull: false, field: 'tournament_id' },
    teamId: { type: DataTypes.INTEGER, allowNull: false, field: 'team_id' },
    played: { type: DataTypes.INTEGER, defaultValue: 0 },
    won: { type: DataTypes.INTEGER, defaultValue: 0 },
    lost: { type: DataTypes.INTEGER, defaultValue: 0 },
    drawn: { type: DataTypes.INTEGER, defaultValue: 0 },
    points: { type: DataTypes.INTEGER, defaultValue: 0 },
    goalsFor: { type: DataTypes.INTEGER, defaultValue: 0, field: 'goals_for' },
    goalsAgainst: { type: DataTypes.INTEGER, defaultValue: 0, field: 'goals_against' },
    goalDifference: { type: DataTypes.INTEGER, defaultValue: 0, field: 'goal_difference' },
    rankPosition: { type: DataTypes.INTEGER, defaultValue: 0, field: 'rank_position' },
  },
  { sequelize, tableName: 'standings', timestamps: true, underscored: true }
);

export default Standing;
