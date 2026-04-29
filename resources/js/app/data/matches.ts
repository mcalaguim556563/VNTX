export type MatchStatus = 'Scheduled' | 'Live' | 'Completed' | 'Postponed' | 'Cancelled';

export interface Match {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  date: string;
  time: string;
  venue: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  round: string;
  matchNumber: number;
}

export const matches: Match[] = [
  // COMPLETED MATCHES - Champions Cup
  {
    id: 'm1', tournamentId: 't1', homeTeamId: 'team1', homeTeamName: 'Manila Eagles',
    awayTeamId: 'team2', awayTeamName: 'Cebu Strikers FC',
    date: '2025-03-05', time: '15:00', venue: 'VNTX National Stadium',
    status: 'Completed', homeScore: 3, awayScore: 1,
    round: 'Round 1', matchNumber: 1,
  },
  {
    id: 'm2', tournamentId: 't1', homeTeamId: 'team3', homeTeamName: 'Davao Warriors',
    awayTeamId: 'team4', awayTeamName: 'Quezon City Lions',
    date: '2025-03-05', time: '18:00', venue: 'VNTX National Stadium',
    status: 'Completed', homeScore: 2, awayScore: 2,
    round: 'Round 1', matchNumber: 2,
  },
  {
    id: 'm3', tournamentId: 't1', homeTeamId: 'team13', homeTeamName: 'Ayala Phoenix',
    awayTeamId: 'team14', awayTeamName: 'North District FC',
    date: '2025-03-06', time: '15:00', venue: 'VNTX National Stadium',
    status: 'Completed', homeScore: 1, awayScore: 0,
    round: 'Round 1', matchNumber: 3,
  },
  {
    id: 'm4', tournamentId: 't1', homeTeamId: 'team1', homeTeamName: 'Manila Eagles',
    awayTeamId: 'team3', awayTeamName: 'Davao Warriors',
    date: '2025-03-12', time: '15:00', venue: 'VNTX National Stadium',
    status: 'Completed', homeScore: 2, awayScore: 0,
    round: 'Round 2', matchNumber: 4,
  },
  {
    id: 'm5', tournamentId: 't1', homeTeamId: 'team2', homeTeamName: 'Cebu Strikers FC',
    awayTeamId: 'team4', awayTeamName: 'Quezon City Lions',
    date: '2025-03-12', time: '18:00', venue: 'VNTX National Stadium',
    status: 'Completed', homeScore: 3, awayScore: 2,
    round: 'Round 2', matchNumber: 5,
  },
  {
    id: 'm6', tournamentId: 't1', homeTeamId: 'team14', homeTeamName: 'North District FC',
    awayTeamId: 'team15', awayTeamName: 'South Bay United',
    date: '2025-03-13', time: '15:00', venue: 'City Central Stadium',
    status: 'Completed', homeScore: 1, awayScore: 1,
    round: 'Round 2', matchNumber: 6,
  },
  // BASKETBALL - Completed
  {
    id: 'm7', tournamentId: 't2', homeTeamId: 'team5', homeTeamName: 'Makati Thunder',
    awayTeamId: 'team6', awayTeamName: 'Pasig Blazers',
    date: '2025-02-20', time: '19:00', venue: 'Metro Sports Complex',
    status: 'Completed', homeScore: 88, awayScore: 76,
    round: 'Round 1', matchNumber: 7,
  },
  {
    id: 'm8', tournamentId: 't2', homeTeamId: 'team7', homeTeamName: 'Taguig Sharks',
    awayTeamId: 'team8', awayTeamName: 'BGC Rockets',
    date: '2025-02-20', time: '21:00', venue: 'Metro Sports Complex',
    status: 'Completed', homeScore: 72, awayScore: 69,
    round: 'Round 1', matchNumber: 8,
  },
  {
    id: 'm9', tournamentId: 't2', homeTeamId: 'team5', homeTeamName: 'Makati Thunder',
    awayTeamId: 'team7', awayTeamName: 'Taguig Sharks',
    date: '2025-03-01', time: '19:00', venue: 'Metro Sports Complex',
    status: 'Completed', homeScore: 95, awayScore: 87,
    round: 'Round 2', matchNumber: 9,
  },
  {
    id: 'm10', tournamentId: 't2', homeTeamId: 'team6', homeTeamName: 'Pasig Blazers',
    awayTeamId: 'team8', awayTeamName: 'BGC Rockets',
    date: '2025-03-01', time: '21:00', venue: 'Metro Sports Complex',
    status: 'Completed', homeScore: 81, awayScore: 74,
    round: 'Round 2', matchNumber: 10,
  },
  // LIVE MATCHES
  {
    id: 'm11', tournamentId: 't1', homeTeamId: 'team1', homeTeamName: 'Manila Eagles',
    awayTeamId: 'team13', awayTeamName: 'Ayala Phoenix',
    date: '2025-04-16', time: '15:00', venue: 'VNTX National Stadium',
    status: 'Live', homeScore: 1, awayScore: 0,
    round: 'Round 5', matchNumber: 11,
  },
  {
    id: 'm12', tournamentId: 't2', homeTeamId: 'team5', homeTeamName: 'Makati Thunder',
    awayTeamId: 'team6', awayTeamName: 'Pasig Blazers',
    date: '2025-04-16', time: '19:00', venue: 'Metro Sports Complex',
    status: 'Live', homeScore: 54, awayScore: 51,
    round: 'Round 8', matchNumber: 12,
  },
  // SCHEDULED MATCHES
  {
    id: 'm13', tournamentId: 't1', homeTeamId: 'team2', homeTeamName: 'Cebu Strikers FC',
    awayTeamId: 'team3', awayTeamName: 'Davao Warriors',
    date: '2025-04-19', time: '15:00', venue: 'Cebu Sports Complex',
    status: 'Scheduled', round: 'Round 5', matchNumber: 13,
  },
  {
    id: 'm14', tournamentId: 't1', homeTeamId: 'team4', homeTeamName: 'Quezon City Lions',
    awayTeamId: 'team15', awayTeamName: 'South Bay United',
    date: '2025-04-19', time: '18:00', venue: 'QC Memorial Circle',
    status: 'Scheduled', round: 'Round 5', matchNumber: 14,
  },
  {
    id: 'm15', tournamentId: 't2', homeTeamId: 'team7', homeTeamName: 'Taguig Sharks',
    awayTeamId: 'team5', awayTeamName: 'Makati Thunder',
    date: '2025-04-20', time: '19:00', venue: 'Metro Sports Complex',
    status: 'Scheduled', round: 'Round 9', matchNumber: 15,
  },
  {
    id: 'm16', tournamentId: 't2', homeTeamId: 'team8', homeTeamName: 'BGC Rockets',
    awayTeamId: 'team6', awayTeamName: 'Pasig Blazers',
    date: '2025-04-20', time: '21:00', venue: 'BGC Arena',
    status: 'Scheduled', round: 'Round 9', matchNumber: 16,
  },
  {
    id: 'm17', tournamentId: 't1', homeTeamId: 'team1', homeTeamName: 'Manila Eagles',
    awayTeamId: 'team4', awayTeamName: 'Quezon City Lions',
    date: '2025-04-26', time: '15:00', venue: 'VNTX National Stadium',
    status: 'Scheduled', round: 'Round 6', matchNumber: 17,
  },
  {
    id: 'm18', tournamentId: 't1', homeTeamId: 'team2', homeTeamName: 'Cebu Strikers FC',
    awayTeamId: 'team13', awayTeamName: 'Ayala Phoenix',
    date: '2025-04-26', time: '18:00', venue: 'Cebu Sports Complex',
    status: 'Scheduled', round: 'Round 6', matchNumber: 18,
  },
  {
    id: 'm19', tournamentId: 't3', homeTeamId: 'team9', homeTeamName: 'Alabang Kings',
    awayTeamId: 'team10', awayTeamName: 'Ortigas Aces',
    date: '2025-06-05', time: '10:00', venue: 'Greenfield Tennis Club',
    status: 'Scheduled', round: 'Round 1', matchNumber: 19,
  },
  {
    id: 'm20', tournamentId: 't4', homeTeamId: 'team11', homeTeamName: 'Eastwood Falcons',
    awayTeamId: 'team12', awayTeamName: 'Rockwell Raptors',
    date: '2025-07-15', time: '14:00', venue: 'National Indoor Arena',
    status: 'Scheduled', round: 'Round 1', matchNumber: 20,
  },
  // POSTPONED
  {
    id: 'm21', tournamentId: 't1', homeTeamId: 'team3', homeTeamName: 'Davao Warriors',
    awayTeamId: 'team14', awayTeamName: 'North District FC',
    date: '2025-04-05', time: '15:00', venue: 'Davao Sports Center',
    status: 'Postponed', round: 'Round 4', matchNumber: 21,
  },
  // CANCELLED
  {
    id: 'm22', tournamentId: 't5', homeTeamId: 'team5', homeTeamName: 'Makati Thunder',
    awayTeamId: 'team7', awayTeamName: 'Taguig Sharks',
    date: '2025-01-10', time: '19:00', venue: 'City Sports Hall',
    status: 'Cancelled', round: 'Group Stage', matchNumber: 22,
  },
  {
    id: 'm23', tournamentId: 't2', homeTeamId: 'team5', homeTeamName: 'Makati Thunder',
    awayTeamId: 'team8', awayTeamName: 'BGC Rockets',
    date: '2025-03-15', time: '19:00', venue: 'Metro Sports Complex',
    status: 'Completed', homeScore: 102, awayScore: 88,
    round: 'Round 3', matchNumber: 23,
  },
  {
    id: 'm24', tournamentId: 't1', homeTeamId: 'team4', homeTeamName: 'Quezon City Lions',
    awayTeamId: 'team13', awayTeamName: 'Ayala Phoenix',
    date: '2025-03-19', time: '18:00', venue: 'VNTX National Stadium',
    status: 'Completed', homeScore: 0, awayScore: 0,
    round: 'Round 3', matchNumber: 24,
  },
  {
    id: 'm25', tournamentId: 't2', homeTeamId: 'team6', homeTeamName: 'Pasig Blazers',
    awayTeamId: 'team7', awayTeamName: 'Taguig Sharks',
    date: '2025-04-01', time: '19:00', venue: 'Metro Sports Complex',
    status: 'Completed', homeScore: 79, awayScore: 82,
    round: 'Round 5', matchNumber: 25,
  },
];
