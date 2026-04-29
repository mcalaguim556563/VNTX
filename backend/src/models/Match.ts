import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Match extends Model {
  public id!: number;
  public tournamentId!: number;
  public homeTeamId!: number;
  public homeTeamName!: string;
  public awayTeamId!: number;
  public awayTeamName!: string;
  public matchDate!: string;
  public matchTime!: string;
  public venue!: string;
  public status!: 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled';
  public homeScore!: number | null;
  public awayScore!: number | null;
  public roundName!: string;
  public matchNumber!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Match.init(
  {
    id:           { type: DataTypes.INTEGER,     autoIncrement: true, primaryKey: true },
    tournamentId: { type: DataTypes.INTEGER,     allowNull: false, field: 'tournament_id' },
    homeTeamId:   { type: DataTypes.INTEGER,     allowNull: false, field: 'home_team_id' },
    homeTeamName: { type: DataTypes.STRING(255), allowNull: true,  field: 'home_team_name' },
    awayTeamId:   { type: DataTypes.INTEGER,     allowNull: false, field: 'away_team_id' },
    awayTeamName: { type: DataTypes.STRING(255), allowNull: true,  field: 'away_team_name' },
    matchDate:    { type: DataTypes.DATEONLY,    allowNull: false, field: 'match_date' },
    matchTime:    { type: DataTypes.STRING(10),  allowNull: true,  field: 'match_time' },
    venue:        { type: DataTypes.STRING(255), allowNull: true  },
    status: {
      type: DataTypes.ENUM('scheduled', 'live', 'completed', 'postponed', 'cancelled'),
      defaultValue: 'scheduled',
    },
    homeScore:    { type: DataTypes.INTEGER,     allowNull: true,  field: 'home_score' },
    awayScore:    { type: DataTypes.INTEGER,     allowNull: true,  field: 'away_score' },
    roundName:    { type: DataTypes.STRING(100), allowNull: true,  field: 'round_name' },
    matchNumber:  { type: DataTypes.INTEGER,     allowNull: true,  field: 'match_number' },
  },
  { sequelize, tableName: 'matches', timestamps: true, underscored: true }
);

export default Match;
