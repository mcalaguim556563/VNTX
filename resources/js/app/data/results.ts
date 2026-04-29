export interface MatchResult {
  id: string;
  matchId: string;
  tournamentId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  date: string;
  venue: string;
  round: string;
  highlight: string;
  homeStats: TeamStats;
  awayStats: TeamStats;
}

export interface TeamStats {
  shots: number;
  shotsOnTarget: number;
  possession: number;
  fouls?: number;
  yellowCards?: number;
  redCards?: number;
  corners?: number;
  assists?: number;
  rebounds?: number;
  turnovers?: number;
  threePointers?: number;
}

export const results: MatchResult[] = [
  {
    id: 'r1', matchId: 'm1', tournamentId: 't1',
    homeTeamName: 'Manila Eagles', awayTeamName: 'Cebu Strikers FC',
    homeScore: 3, awayScore: 1,
    date: '2025-03-05', venue: 'VNTX National Stadium', round: 'Round 1',
    highlight: 'Manila Eagles dominated the first half with two quick goals from Santos and Ramos.',
    homeStats: { shots: 14, shotsOnTarget: 9, possession: 58, fouls: 8, yellowCards: 1, redCards: 0, corners: 7 },
    awayStats: { shots: 8, shotsOnTarget: 4, possession: 42, fouls: 11, yellowCards: 2, redCards: 0, corners: 3 },
  },
  {
    id: 'r2', matchId: 'm2', tournamentId: 't1',
    homeTeamName: 'Davao Warriors', awayTeamName: 'Quezon City Lions',
    homeScore: 2, awayScore: 2,
    date: '2025-03-05', venue: 'VNTX National Stadium', round: 'Round 1',
    highlight: 'A thrilling draw with Lions equalizing in the 89th minute through a stunning free kick.',
    homeStats: { shots: 11, shotsOnTarget: 6, possession: 53, fouls: 9, yellowCards: 2, redCards: 0, corners: 5 },
    awayStats: { shots: 10, shotsOnTarget: 5, possession: 47, fouls: 7, yellowCards: 1, redCards: 0, corners: 4 },
  },
  {
    id: 'r3', matchId: 'm3', tournamentId: 't1',
    homeTeamName: 'Ayala Phoenix', awayTeamName: 'North District FC',
    homeScore: 1, awayScore: 0,
    date: '2025-03-06', venue: 'VNTX National Stadium', round: 'Round 1',
    highlight: 'A narrow 1-0 victory for Phoenix secured by a first-half penalty goal.',
    homeStats: { shots: 9, shotsOnTarget: 5, possession: 61, fouls: 6, yellowCards: 0, redCards: 0, corners: 8 },
    awayStats: { shots: 5, shotsOnTarget: 2, possession: 39, fouls: 14, yellowCards: 3, redCards: 1, corners: 2 },
  },
  {
    id: 'r4', matchId: 'm4', tournamentId: 't1',
    homeTeamName: 'Manila Eagles', awayTeamName: 'Davao Warriors',
    homeScore: 2, awayScore: 0,
    date: '2025-03-12', venue: 'VNTX National Stadium', round: 'Round 2',
    highlight: 'Manila Eagles continued their strong form with a clean sheet victory over Davao Warriors.',
    homeStats: { shots: 16, shotsOnTarget: 10, possession: 62, fouls: 5, yellowCards: 0, redCards: 0, corners: 9 },
    awayStats: { shots: 7, shotsOnTarget: 3, possession: 38, fouls: 10, yellowCards: 2, redCards: 0, corners: 3 },
  },
  {
    id: 'r5', matchId: 'm5', tournamentId: 't1',
    homeTeamName: 'Cebu Strikers FC', awayTeamName: 'Quezon City Lions',
    homeScore: 3, awayScore: 2,
    date: '2025-03-12', venue: 'VNTX National Stadium', round: 'Round 2',
    highlight: 'Cebu came from behind twice to win a pulsating 5-goal thriller.',
    homeStats: { shots: 13, shotsOnTarget: 8, possession: 49, fouls: 12, yellowCards: 2, redCards: 0, corners: 6 },
    awayStats: { shots: 12, shotsOnTarget: 7, possession: 51, fouls: 9, yellowCards: 1, redCards: 0, corners: 5 },
  },
  {
    id: 'r6', matchId: 'm6', tournamentId: 't1',
    homeTeamName: 'North District FC', awayTeamName: 'South Bay United',
    homeScore: 1, awayScore: 1,
    date: '2025-03-13', venue: 'City Central Stadium', round: 'Round 2',
    highlight: 'South Bay United rescued a late draw to deny North District their first win.',
    homeStats: { shots: 8, shotsOnTarget: 4, possession: 55, fouls: 7, yellowCards: 1, redCards: 0, corners: 4 },
    awayStats: { shots: 7, shotsOnTarget: 3, possession: 45, fouls: 9, yellowCards: 2, redCards: 0, corners: 3 },
  },
  {
    id: 'r7', matchId: 'm7', tournamentId: 't2',
    homeTeamName: 'Makati Thunder', awayTeamName: 'Pasig Blazers',
    homeScore: 88, awayScore: 76,
    date: '2025-02-20', venue: 'Metro Sports Complex', round: 'Round 1',
    highlight: 'Thunder\'s balanced attack powered by Chua\'s 24-point performance overwhelmed the Blazers.',
    homeStats: { shots: 82, shotsOnTarget: 45, possession: 52, rebounds: 38, turnovers: 12, threePointers: 9 },
    awayStats: { shots: 74, shotsOnTarget: 38, possession: 48, rebounds: 31, turnovers: 15, threePointers: 6 },
  },
  {
    id: 'r8', matchId: 'm8', tournamentId: 't2',
    homeTeamName: 'Taguig Sharks', awayTeamName: 'BGC Rockets',
    homeScore: 72, awayScore: 69,
    date: '2025-02-20', venue: 'Metro Sports Complex', round: 'Round 1',
    highlight: 'Sharks held on for a nail-biting 3-point victory in a low-scoring defensive battle.',
    homeStats: { shots: 68, shotsOnTarget: 34, possession: 50, rebounds: 35, turnovers: 10, threePointers: 7 },
    awayStats: { shots: 71, shotsOnTarget: 35, possession: 50, rebounds: 32, turnovers: 13, threePointers: 8 },
  },
  {
    id: 'r9', matchId: 'm9', tournamentId: 't2',
    homeTeamName: 'Makati Thunder', awayTeamName: 'Taguig Sharks',
    homeScore: 95, awayScore: 87,
    date: '2025-03-01', venue: 'Metro Sports Complex', round: 'Round 2',
    highlight: 'Makati Thunder remain unbeaten after another dominant display, leading by as much as 20 points.',
    homeStats: { shots: 90, shotsOnTarget: 51, possession: 54, rebounds: 42, turnovers: 9, threePointers: 12 },
    awayStats: { shots: 85, shotsOnTarget: 44, possession: 46, rebounds: 35, turnovers: 16, threePointers: 8 },
  },
  {
    id: 'r10', matchId: 'm10', tournamentId: 't2',
    homeTeamName: 'Pasig Blazers', awayTeamName: 'BGC Rockets',
    homeScore: 81, awayScore: 74,
    date: '2025-03-01', venue: 'Metro Sports Complex', round: 'Round 2',
    highlight: 'Blazers recover from their opening loss with a solid team performance.',
    homeStats: { shots: 78, shotsOnTarget: 41, possession: 51, rebounds: 36, turnovers: 11, threePointers: 10 },
    awayStats: { shots: 75, shotsOnTarget: 37, possession: 49, rebounds: 33, turnovers: 14, threePointers: 7 },
  },
  {
    id: 'r11', matchId: 'm23', tournamentId: 't2',
    homeTeamName: 'Makati Thunder', awayTeamName: 'BGC Rockets',
    homeScore: 102, awayScore: 88,
    date: '2025-03-15', venue: 'Metro Sports Complex', round: 'Round 3',
    highlight: 'Thunder break the 100-point barrier in commanding fashion, with Pascual scoring 30.',
    homeStats: { shots: 98, shotsOnTarget: 58, possession: 56, rebounds: 45, turnovers: 8, threePointers: 14 },
    awayStats: { shots: 88, shotsOnTarget: 44, possession: 44, rebounds: 30, turnovers: 18, threePointers: 9 },
  },
  {
    id: 'r12', matchId: 'm24', tournamentId: 't1',
    homeTeamName: 'Quezon City Lions', awayTeamName: 'Ayala Phoenix',
    homeScore: 0, awayScore: 0,
    date: '2025-03-19', venue: 'VNTX National Stadium', round: 'Round 3',
    highlight: 'A goalless stalemate in a tactical match where both goalkeepers were rarely tested.',
    homeStats: { shots: 7, shotsOnTarget: 2, possession: 48, fouls: 10, yellowCards: 2, redCards: 0, corners: 4 },
    awayStats: { shots: 8, shotsOnTarget: 3, possession: 52, fouls: 8, yellowCards: 1, redCards: 0, corners: 5 },
  },
  {
    id: 'r13', matchId: 'm25', tournamentId: 't2',
    homeTeamName: 'Pasig Blazers', awayTeamName: 'Taguig Sharks',
    homeScore: 79, awayScore: 82,
    date: '2025-04-01', venue: 'Metro Sports Complex', round: 'Round 5',
    highlight: 'Taguig stole the win in overtime after Roque hit a clutch three-pointer at the buzzer.',
    homeStats: { shots: 80, shotsOnTarget: 40, possession: 50, rebounds: 33, turnovers: 14, threePointers: 8 },
    awayStats: { shots: 82, shotsOnTarget: 42, possession: 50, rebounds: 37, turnovers: 12, threePointers: 11 },
  },
];
