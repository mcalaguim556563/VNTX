import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Tournament extends Model {
  public id!: number;
  public name!: string;
  public sport!: string;
  public format!: string;
  public status!: 'draft' | 'upcoming' | 'in_progress' | 'completed';
  public startDate!: string;
  public endDate!: string;
  public venue!: string;
  public description!: string;
  public teamCount!: number;
  public maxTeams!: number;
  public prizePool!: string;
  public organizer!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Tournament.init(
  {
    id:          { type: DataTypes.INTEGER,      autoIncrement: true, primaryKey: true },
    name:        { type: DataTypes.STRING(255),  allowNull: false },
    sport:       { type: DataTypes.STRING(100),  allowNull: false },
    format:      { type: DataTypes.STRING(100),  allowNull: false },
    status:      { type: DataTypes.ENUM('draft', 'upcoming', 'in_progress', 'completed'), defaultValue: 'draft' },
    startDate:   { type: DataTypes.DATEONLY,     allowNull: false, field: 'start_date' },
    endDate:     { type: DataTypes.DATEONLY,     allowNull: false, field: 'end_date' },
    venue:       { type: DataTypes.STRING(255),  allowNull: true },
    description: { type: DataTypes.TEXT,         allowNull: true },
    teamCount:   { type: DataTypes.INTEGER,      defaultValue: 0,  field: 'team_count' },
    maxTeams:    { type: DataTypes.INTEGER,      defaultValue: 8,  field: 'max_teams' },
    prizePool:   { type: DataTypes.STRING(100),  allowNull: true,  field: 'prize_pool' },
    organizer:   { type: DataTypes.STRING(255),  allowNull: true },
  },
  { sequelize, tableName: 'tournaments', timestamps: true, underscored: true }
);

export default Tournament;
