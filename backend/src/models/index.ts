import Tournament from './Tournament';
import Team from './Team';
import Match from './Match';
import Result from './Result';
import Standing from './Standing';
import User from './User';

// Tournament ↔ Teams
Tournament.hasMany(Team, { foreignKey: 'tournament_id', as: 'teams' });
Team.belongsTo(Tournament, { foreignKey: 'tournament_id', as: 'tournament' });

// Tournament ↔ Matches
Tournament.hasMany(Match, { foreignKey: 'tournament_id', as: 'matches' });
Match.belongsTo(Tournament, { foreignKey: 'tournament_id', as: 'tournament' });

// Match ↔ Teams (home / away)
Match.belongsTo(Team, { foreignKey: 'home_team_id', as: 'homeTeam' });
Match.belongsTo(Team, { foreignKey: 'away_team_id', as: 'awayTeam' });

// Match ↔ Result
Match.hasOne(Result, { foreignKey: 'match_id', as: 'result' });
Result.belongsTo(Match, { foreignKey: 'match_id', as: 'match' });

// Result ↔ Winner Team
Result.belongsTo(Team, { foreignKey: 'winner_id', as: 'winner' });

// Standing ↔ Tournament + Team
Standing.belongsTo(Tournament, { foreignKey: 'tournament_id', as: 'tournament' });
Standing.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });

export { User, Tournament, Team, Match, Result, Standing };
