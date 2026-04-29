export interface Player {
  id: string;
  name: string;
  position: string;
  number: number;
  age: number;
}

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  sport: string;
  coach: string;
  city: string;
  color: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  goalsFor?: number;
  goalsAgainst?: number;
  playerCount: number;
  tournamentId: string;
  players: Player[];
}

export const teams: Team[] = [
  {
    id: 'team1',
    name: 'Manila Eagles',
    abbreviation: 'MEA',
    sport: 'Soccer',
    coach: 'Carlos Reyes',
    city: 'Manila',
    color: '#00C8F8',
    wins: 8, losses: 2, draws: 2, points: 26,
    goalsFor: 24, goalsAgainst: 10,
    playerCount: 18,
    tournamentId: 't1',
    players: [
      { id: 'p1', name: 'Rafael Santos', position: 'Forward', number: 9, age: 24 },
      { id: 'p2', name: 'Marco Dela Cruz', position: 'Midfielder', number: 8, age: 22 },
      { id: 'p3', name: 'Luis Garcia', position: 'Goalkeeper', number: 1, age: 27 },
      { id: 'p4', name: 'David Lim', position: 'Defender', number: 4, age: 25 },
      { id: 'p5', name: 'Jose Ramos', position: 'Forward', number: 10, age: 23 },
    ],
  },
  {
    id: 'team2',
    name: 'Cebu Strikers FC',
    abbreviation: 'CSF',
    sport: 'Soccer',
    coach: 'Miguel Torres',
    city: 'Cebu',
    color: '#EF4444',
    wins: 7, losses: 3, draws: 2, points: 23,
    goalsFor: 20, goalsAgainst: 12,
    playerCount: 17,
    tournamentId: 't1',
    players: [
      { id: 'p6', name: 'Antonio Cruz', position: 'Forward', number: 11, age: 21 },
      { id: 'p7', name: 'Roberto Bautista', position: 'Midfielder', number: 6, age: 26 },
      { id: 'p8', name: 'Francis Navarro', position: 'Goalkeeper', number: 1, age: 29 },
    ],
  },
  {
    id: 'team3',
    name: 'Davao Warriors',
    abbreviation: 'DWA',
    sport: 'Soccer',
    coach: 'Emmanuel Santos',
    city: 'Davao',
    color: '#10B981',
    wins: 6, losses: 4, draws: 2, points: 20,
    goalsFor: 16, goalsAgainst: 14,
    playerCount: 16,
    tournamentId: 't1',
    players: [
      { id: 'p9', name: 'Kristofer Valdez', position: 'Forward', number: 7, age: 24 },
      { id: 'p10', name: 'Alvin Castillo', position: 'Defender', number: 3, age: 23 },
    ],
  },
  {
    id: 'team4',
    name: 'Quezon City Lions',
    abbreviation: 'QCL',
    sport: 'Soccer',
    coach: 'Ramon Gonzalez',
    city: 'Quezon City',
    color: '#F59E0B',
    wins: 5, losses: 5, draws: 2, points: 17,
    goalsFor: 14, goalsAgainst: 16,
    playerCount: 18,
    tournamentId: 't1',
    players: [
      { id: 'p11', name: 'Jericho Mendoza', position: 'Midfielder', number: 5, age: 22 },
      { id: 'p12', name: 'Bernard Tan', position: 'Defender', number: 2, age: 28 },
    ],
  },
  {
    id: 'team5',
    name: 'Makati Thunder',
    abbreviation: 'MAK',
    sport: 'Basketball',
    coach: 'Andres Villanueva',
    city: 'Makati',
    color: '#6366F1',
    wins: 12, losses: 4, draws: 0, points: 24,
    playerCount: 12,
    tournamentId: 't2',
    players: [
      { id: 'p13', name: 'Jerome Chua', position: 'Point Guard', number: 3, age: 24 },
      { id: 'p14', name: 'Samuel Reyes', position: 'Shooting Guard', number: 23, age: 26 },
      { id: 'p15', name: 'Danilo Pascual', position: 'Center', number: 34, age: 27 },
    ],
  },
  {
    id: 'team6',
    name: 'Pasig Blazers',
    abbreviation: 'PBL',
    sport: 'Basketball',
    coach: 'Federico Morales',
    city: 'Pasig',
    color: '#EC4899',
    wins: 10, losses: 6, draws: 0, points: 20,
    playerCount: 12,
    tournamentId: 't2',
    players: [
      { id: 'p16', name: 'Norman Diaz', position: 'Small Forward', number: 12, age: 25 },
      { id: 'p17', name: 'Patrick Flores', position: 'Power Forward', number: 44, age: 23 },
    ],
  },
  {
    id: 'team7',
    name: 'Taguig Sharks',
    abbreviation: 'TSK',
    sport: 'Basketball',
    coach: 'Victor Hernandez',
    city: 'Taguig',
    color: '#14B8A6',
    wins: 9, losses: 7, draws: 0, points: 18,
    playerCount: 13,
    tournamentId: 't2',
    players: [
      { id: 'p18', name: 'Kenneth Roque', position: 'Point Guard', number: 1, age: 22 },
      { id: 'p19', name: 'James Ocampo', position: 'Center', number: 55, age: 28 },
    ],
  },
  {
    id: 'team8',
    name: 'BGC Rockets',
    abbreviation: 'BGR',
    sport: 'Basketball',
    coach: 'Leandro Aquino',
    city: 'Taguig (BGC)',
    color: '#F97316',
    wins: 7, losses: 9, draws: 0, points: 14,
    playerCount: 11,
    tournamentId: 't2',
    players: [
      { id: 'p20', name: 'Carl Delos Reyes', position: 'Shooting Guard', number: 21, age: 24 },
      { id: 'p21', name: 'Anthony Uy', position: 'Small Forward', number: 8, age: 26 },
    ],
  },
  {
    id: 'team9',
    name: 'Alabang Kings',
    abbreviation: 'ALK',
    sport: 'Tennis',
    coach: 'Maria Santos',
    city: 'Alabang',
    color: '#8B5CF6',
    wins: 3, losses: 1, draws: 0, points: 6,
    playerCount: 4,
    tournamentId: 't3',
    players: [
      { id: 'p22', name: 'Sebastian Cruz', position: 'Singles', number: 1, age: 21 },
      { id: 'p23', name: 'Tricia Lim', position: 'Singles', number: 2, age: 24 },
    ],
  },
  {
    id: 'team10',
    name: 'Ortigas Aces',
    abbreviation: 'OAC',
    sport: 'Tennis',
    coach: 'Patricia Rivera',
    city: 'Ortigas',
    color: '#22C55E',
    wins: 2, losses: 2, draws: 0, points: 4,
    playerCount: 4,
    tournamentId: 't3',
    players: [
      { id: 'p24', name: 'Michael Buenaventura', position: 'Singles', number: 1, age: 28 },
      { id: 'p25', name: 'Lisa Gomez', position: 'Doubles', number: 2, age: 23 },
    ],
  },
  {
    id: 'team11',
    name: 'Eastwood Falcons',
    abbreviation: 'EWF',
    sport: 'Volleyball',
    coach: 'Grace Villanueva',
    city: 'Eastwood',
    color: '#EAB308',
    wins: 2, losses: 0, draws: 0, points: 6,
    playerCount: 12,
    tournamentId: 't4',
    players: [
      { id: 'p26', name: 'Angelica Lopez', position: 'Setter', number: 1, age: 22 },
      { id: 'p27', name: 'Nicole Tan', position: 'Libero', number: 10, age: 20 },
    ],
  },
  {
    id: 'team12',
    name: 'Rockwell Raptors',
    abbreviation: 'RWR',
    sport: 'Volleyball',
    coach: 'Ferdinand Reyes',
    city: 'Rockwell',
    color: '#06B6D4',
    wins: 1, losses: 1, draws: 0, points: 3,
    playerCount: 12,
    tournamentId: 't4',
    players: [
      { id: 'p28', name: 'Kristine Dela Torre', position: 'Outside Hitter', number: 4, age: 21 },
      { id: 'p29', name: 'Joanna Cruz', position: 'Setter', number: 7, age: 23 },
    ],
  },
  {
    id: 'team13',
    name: 'Ayala Phoenix',
    abbreviation: 'AYP',
    sport: 'Soccer',
    coach: 'Lorenzo Diaz',
    city: 'Makati',
    color: '#DC2626',
    wins: 4, losses: 4, draws: 4, points: 16,
    goalsFor: 12, goalsAgainst: 13,
    playerCount: 16,
    tournamentId: 't1',
    players: [
      { id: 'p30', name: 'Robin Santiago', position: 'Midfielder', number: 14, age: 25 },
    ],
  },
  {
    id: 'team14',
    name: 'North District FC',
    abbreviation: 'NDF',
    sport: 'Soccer',
    coach: 'Alberto Mercado',
    city: 'Caloocan',
    color: '#7C3AED',
    wins: 3, losses: 7, draws: 2, points: 11,
    goalsFor: 9, goalsAgainst: 20,
    playerCount: 17,
    tournamentId: 't1',
    players: [
      { id: 'p31', name: 'Rodel Abrina', position: 'Goalkeeper', number: 1, age: 30 },
    ],
  },
  {
    id: 'team15',
    name: 'South Bay United',
    abbreviation: 'SBU',
    sport: 'Soccer',
    coach: 'Rogelio Espiritu',
    city: 'Las Piñas',
    color: '#0EA5E9',
    wins: 2, losses: 8, draws: 2, points: 8,
    goalsFor: 7, goalsAgainst: 22,
    playerCount: 15,
    tournamentId: 't1',
    players: [
      { id: 'p32', name: 'Vincent Cortez', position: 'Forward', number: 99, age: 21 },
    ],
  },
];
