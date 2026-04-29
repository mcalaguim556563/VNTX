export interface StandingEntry {
  rank: number;
  teamId: string;
  teamName: string;
  teamColor: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface TournamentStandings {
  tournamentId: string;
  tournamentName: string;
  sport: string;
  lastUpdated: string;
  entries: StandingEntry[];
}

export const standings: TournamentStandings[] = [
  {
    tournamentId: 't1',
    tournamentName: 'VNTX Champions Cup 2025',
    sport: 'Soccer',
    lastUpdated: '2025-04-16',
    entries: [
      { rank: 1, teamId: 'team1', teamName: 'Manila Eagles', teamColor: '#00C8F8', played: 10, won: 8, drawn: 2, lost: 0, goalsFor: 24, goalsAgainst: 10, goalDifference: 14, points: 26 },
      { rank: 2, teamId: 'team2', teamName: 'Cebu Strikers FC', teamColor: '#EF4444', played: 10, won: 7, drawn: 2, lost: 1, goalsFor: 20, goalsAgainst: 12, goalDifference: 8, points: 23 },
      { rank: 3, teamId: 'team3', teamName: 'Davao Warriors', teamColor: '#10B981', played: 10, won: 6, drawn: 2, lost: 2, goalsFor: 16, goalsAgainst: 14, goalDifference: 2, points: 20 },
      { rank: 4, teamId: 'team13', teamName: 'Ayala Phoenix', teamColor: '#DC2626', played: 10, won: 4, drawn: 4, lost: 2, goalsFor: 12, goalsAgainst: 13, goalDifference: -1, points: 16 },
      { rank: 5, teamId: 'team4', teamName: 'Quezon City Lions', teamColor: '#F59E0B', played: 10, won: 5, drawn: 2, lost: 3, goalsFor: 14, goalsAgainst: 16, goalDifference: -2, points: 17 },
      { rank: 6, teamId: 'team14', teamName: 'North District FC', teamColor: '#7C3AED', played: 10, won: 3, drawn: 2, lost: 5, goalsFor: 9, goalsAgainst: 20, goalDifference: -11, points: 11 },
      { rank: 7, teamId: 'team15', teamName: 'South Bay United', teamColor: '#0EA5E9', played: 10, won: 2, drawn: 2, lost: 6, goalsFor: 7, goalsAgainst: 22, goalDifference: -15, points: 8 },
    ],
  },
  {
    tournamentId: 't2',
    tournamentName: 'Metro Basketball League 2025',
    sport: 'Basketball',
    lastUpdated: '2025-04-16',
    entries: [
      { rank: 1, teamId: 'team5', teamName: 'Makati Thunder', teamColor: '#6366F1', played: 16, won: 12, drawn: 0, lost: 4, goalsFor: 1520, goalsAgainst: 1360, goalDifference: 160, points: 24 },
      { rank: 2, teamId: 'team6', teamName: 'Pasig Blazers', teamColor: '#EC4899', played: 16, won: 10, drawn: 0, lost: 6, goalsFor: 1380, goalsAgainst: 1310, goalDifference: 70, points: 20 },
      { rank: 3, teamId: 'team7', teamName: 'Taguig Sharks', teamColor: '#14B8A6', played: 16, won: 9, drawn: 0, lost: 7, goalsFor: 1340, goalsAgainst: 1295, goalDifference: 45, points: 18 },
      { rank: 4, teamId: 'team8', teamName: 'BGC Rockets', teamColor: '#F97316', played: 16, won: 7, drawn: 0, lost: 9, goalsFor: 1250, goalsAgainst: 1380, goalDifference: -130, points: 14 },
    ],
  },
  {
    tournamentId: 't3',
    tournamentName: 'Summer Tennis Open 2025',
    sport: 'Tennis',
    lastUpdated: '2025-04-10',
    entries: [
      { rank: 1, teamId: 'team9', teamName: 'Alabang Kings', teamColor: '#8B5CF6', played: 4, won: 3, drawn: 0, lost: 1, goalsFor: 9, goalsAgainst: 5, goalDifference: 4, points: 6 },
      { rank: 2, teamId: 'team10', teamName: 'Ortigas Aces', teamColor: '#22C55E', played: 4, won: 2, drawn: 0, lost: 2, goalsFor: 6, goalsAgainst: 7, goalDifference: -1, points: 4 },
    ],
  },
  {
    tournamentId: 't4',
    tournamentName: 'National Volleyball Championship',
    sport: 'Volleyball',
    lastUpdated: '2025-04-12',
    entries: [
      { rank: 1, teamId: 'team11', teamName: 'Eastwood Falcons', teamColor: '#EAB308', played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 2, goalDifference: 4, points: 6 },
      { rank: 2, teamId: 'team12', teamName: 'Rockwell Raptors', teamColor: '#06B6D4', played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 5, goalDifference: -1, points: 3 },
    ],
  },
];
