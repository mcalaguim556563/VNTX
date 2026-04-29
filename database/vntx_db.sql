-- ============================================================
--  VNTX Sports Tournament Management System
--  Full Database Seed Script
--  Database: vntx_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS vntx_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vntx_db;

-- ── Users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,
  role          ENUM('admin','user') DEFAULT 'user',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Tournaments ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournaments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  sport         VARCHAR(100) NOT NULL,
  format        VARCHAR(100) NOT NULL,
  status        ENUM('draft','upcoming','in_progress','completed') DEFAULT 'draft',
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  venue         VARCHAR(255),
  description   TEXT,
  team_count    INT DEFAULT 0,
  max_teams     INT DEFAULT 8,
  prize_pool    VARCHAR(100),
  organizer     VARCHAR(255),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Teams ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  abbreviation  VARCHAR(10),
  sport         VARCHAR(100) NOT NULL,
  coach         VARCHAR(255),
  city          VARCHAR(255),
  color         VARCHAR(20),
  wins          INT DEFAULT 0,
  losses        INT DEFAULT 0,
  draws         INT DEFAULT 0,
  points        INT DEFAULT 0,
  goals_for     INT DEFAULT 0,
  goals_against INT DEFAULT 0,
  player_count  INT DEFAULT 0,
  tournament_id INT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── Matches ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matches (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id   INT NOT NULL,
  home_team_id    INT NOT NULL,
  home_team_name  VARCHAR(255),
  away_team_id    INT NOT NULL,
  away_team_name  VARCHAR(255),
  match_date      DATE NOT NULL,
  match_time      VARCHAR(10),
  venue           VARCHAR(255),
  status          ENUM('scheduled','live','completed','postponed','cancelled') DEFAULT 'scheduled',
  home_score      INT DEFAULT NULL,
  away_score      INT DEFAULT NULL,
  round_name      VARCHAR(100),
  match_number    INT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (home_team_id)  REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (away_team_id)  REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Results ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS results (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  match_id        INT NOT NULL UNIQUE,
  tournament_id   INT,
  home_team_name  VARCHAR(255),
  away_team_name  VARCHAR(255),
  home_score      INT NOT NULL DEFAULT 0,
  away_score      INT NOT NULL DEFAULT 0,
  result_date     DATE,
  venue           VARCHAR(255),
  round_name      VARCHAR(100),
  highlight       TEXT,
  winner_id       INT DEFAULT NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id)     REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE SET NULL,
  FOREIGN KEY (winner_id)    REFERENCES teams(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── Standings ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS standings (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id   INT NOT NULL,
  team_id         INT NOT NULL,
  played          INT DEFAULT 0,
  won             INT DEFAULT 0,
  lost            INT DEFAULT 0,
  drawn           INT DEFAULT 0,
  points          INT DEFAULT 0,
  goals_for       INT DEFAULT 0,
  goals_against   INT DEFAULT 0,
  goal_difference INT DEFAULT 0,
  rank_position   INT DEFAULT 0,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id)       REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA
-- ============================================================

-- ── Admin user (password = admin123 bcrypt hash) ───────────────
INSERT INTO users (name, email, password, role) VALUES
('Admin User',  'admin@vntx.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('System User', 'user@vntx.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- ── Tournaments ────────────────────────────────────────────────
INSERT INTO tournaments (id, name, sport, format, status, start_date, end_date, venue, description, team_count, max_teams, prize_pool, organizer) VALUES
(1,  'VNTX Champions Cup 2025',          'Soccer',     'Round Robin',        'in_progress', '2025-03-01', '2025-05-31', 'VNTX National Stadium',    'The premier soccer championship featuring the best teams from across the region.',                              12, 12, '₱500,000',  'VNTX Sports Organization'),
(2,  'Metro Basketball League 2025',     'Basketball', 'Double Elimination', 'in_progress', '2025-02-15', '2025-06-15', 'Metro Sports Complex',      'High-intensity basketball league featuring 16 elite teams competing for the championship.',                     16, 16, '₱750,000',  'Metro Sports Authority'),
(3,  'Summer Tennis Open 2025',          'Tennis',     'Single Elimination', 'upcoming',    '2025-06-01', '2025-06-30', 'Greenfield Tennis Club',    'Annual summer tennis open with singles and doubles categories.',                                               6,  8,  '₱200,000',  'VNTX Sports Organization'),
(4,  'National Volleyball Championship', 'Volleyball', 'Round Robin',        'upcoming',    '2025-07-10', '2025-08-20', 'National Indoor Arena',     'The country top volleyball tournament bringing together national-level teams.',                                4,  8,  '₱300,000',  'National Volleyball Federation'),
(5,  'Corporate Badminton Cup',          'Badminton',  'Round Robin',        'completed',   '2025-01-05', '2025-01-25', 'City Sports Hall',          'Annual corporate badminton tournament open to company teams.',                                                 10, 10, '₱100,000',  'Corporate Sports League'),
(6,  'Intercity Soccer Showdown',        'Soccer',     'Single Elimination', 'completed',   '2024-11-01', '2024-12-15', 'City Central Stadium',      'Intercity competition between regional soccer champions.',                                                      8,  8,  '₱250,000',  'VNTX Sports Organization'),
(7,  'Youth Basketball Development League', 'Basketball', 'Swiss System',    'draft',       '2025-09-01', '2025-11-30', 'Youth Sports Center',       'Development league for young basketball players under 18.',                                                    0,  12, '₱50,000',   'Youth Sports Development Program'),
(8,  'Aquatics Swimming Championship',   'Swimming',   'Single Elimination', 'upcoming',    '2025-08-01', '2025-08-10', 'Olympia Aquatic Center',    'Multi-discipline swimming championship with freestyle, backstroke, breaststroke, and butterfly events.',        3,  8,  '₱150,000',  'Aquatics Federation'),
(9,  'VNTX All-Stars Exhibition',        'Soccer',     'Round Robin',        'completed',   '2025-02-01', '2025-02-28', 'VNTX National Stadium',     'Annual exhibition tournament featuring all-star players from previous seasons.',                               4,  4,  '₱80,000',   'VNTX Sports Organization'),
(10, 'Eastern Region Tennis Tour',       'Tennis',     'Round Robin',        'draft',       '2025-10-01', '2025-10-31', 'Eastern Recreation Club',   'Regional tennis circuit for professional and semi-professional players.',                                       0,  16, '₱180,000',  'Eastern Sports Council');

-- ── Teams ──────────────────────────────────────────────────────
INSERT INTO teams (id, name, abbreviation, sport, coach, city, color, wins, losses, draws, points, goals_for, goals_against, player_count, tournament_id) VALUES
(1,  'Manila Eagles',     'MEA', 'Soccer',     'Carlos Reyes',       'Manila',         '#00C8F8', 8, 2, 2, 26, 24, 10, 18, 1),
(2,  'Cebu Strikers FC',  'CSF', 'Soccer',     'Miguel Torres',      'Cebu',           '#EF4444', 7, 3, 2, 23, 20, 12, 17, 1),
(3,  'Davao Warriors',    'DWA', 'Soccer',     'Emmanuel Santos',    'Davao',          '#10B981', 6, 4, 2, 20, 16, 14, 16, 1),
(4,  'Quezon City Lions', 'QCL', 'Soccer',     'Ramon Gonzalez',     'Quezon City',    '#F59E0B', 5, 5, 2, 17, 14, 16, 18, 1),
(5,  'Makati Thunder',    'MAK', 'Basketball', 'Andres Villanueva',  'Makati',         '#6366F1', 12,4, 0, 24, 0,  0,  12, 2),
(6,  'Pasig Blazers',     'PBL', 'Basketball', 'Federico Morales',   'Pasig',          '#EC4899', 10,6, 0, 20, 0,  0,  12, 2),
(7,  'Taguig Sharks',     'TSK', 'Basketball', 'Victor Hernandez',   'Taguig',         '#14B8A6', 9, 7, 0, 18, 0,  0,  13, 2),
(8,  'BGC Rockets',       'BGR', 'Basketball', 'Leandro Aquino',     'Taguig (BGC)',   '#F97316', 7, 9, 0, 14, 0,  0,  11, 2),
(9,  'Alabang Kings',     'ALK', 'Tennis',     'Maria Santos',       'Alabang',        '#8B5CF6', 3, 1, 0, 6,  0,  0,  4,  3),
(10, 'Ortigas Aces',      'OAC', 'Tennis',     'Patricia Rivera',    'Ortigas',        '#22C55E', 2, 2, 0, 4,  0,  0,  4,  3),
(11, 'Eastwood Falcons',  'EWF', 'Volleyball', 'Grace Villanueva',   'Eastwood',       '#EAB308', 2, 0, 0, 6,  0,  0,  12, 4),
(12, 'Rockwell Raptors',  'RWR', 'Volleyball', 'Ferdinand Reyes',    'Rockwell',       '#06B6D4', 1, 1, 0, 3,  0,  0,  12, 4),
(13, 'Ayala Phoenix',     'AYP', 'Soccer',     'Lorenzo Diaz',       'Makati',         '#DC2626', 4, 4, 4, 16, 12, 13, 16, 1),
(14, 'North District FC', 'NDF', 'Soccer',     'Alberto Mercado',    'Caloocan',       '#7C3AED', 3, 7, 2, 11, 9,  20, 17, 1),
(15, 'South Bay United',  'SBU', 'Soccer',     'Rogelio Espiritu',   'Las Piñas',     '#0EA5E9', 2, 8, 2, 8,  7,  22, 15, 1);

-- ── Matches ────────────────────────────────────────────────────
INSERT INTO matches (id, tournament_id, home_team_id, home_team_name, away_team_id, away_team_name, match_date, match_time, venue, status, home_score, away_score, round_name, match_number) VALUES
(1,  1, 1,  'Manila Eagles',     2,  'Cebu Strikers FC',  '2025-03-05', '15:00', 'VNTX National Stadium',  'completed',  3,    1,    'Round 1', 1),
(2,  1, 3,  'Davao Warriors',    4,  'Quezon City Lions', '2025-03-05', '18:00', 'VNTX National Stadium',  'completed',  2,    2,    'Round 1', 2),
(3,  1, 13, 'Ayala Phoenix',     14, 'North District FC', '2025-03-06', '15:00', 'VNTX National Stadium',  'completed',  1,    0,    'Round 1', 3),
(4,  1, 1,  'Manila Eagles',     3,  'Davao Warriors',    '2025-03-12', '15:00', 'VNTX National Stadium',  'completed',  2,    0,    'Round 2', 4),
(5,  1, 2,  'Cebu Strikers FC',  4,  'Quezon City Lions', '2025-03-12', '18:00', 'VNTX National Stadium',  'completed',  3,    2,    'Round 2', 5),
(6,  1, 14, 'North District FC', 15, 'South Bay United',  '2025-03-13', '15:00', 'City Central Stadium',   'completed',  1,    1,    'Round 2', 6),
(7,  2, 5,  'Makati Thunder',    6,  'Pasig Blazers',     '2025-02-20', '19:00', 'Metro Sports Complex',   'completed',  88,   76,   'Round 1', 7),
(8,  2, 7,  'Taguig Sharks',     8,  'BGC Rockets',       '2025-02-20', '21:00', 'Metro Sports Complex',   'completed',  72,   69,   'Round 1', 8),
(9,  2, 5,  'Makati Thunder',    7,  'Taguig Sharks',     '2025-03-01', '19:00', 'Metro Sports Complex',   'completed',  95,   87,   'Round 2', 9),
(10, 2, 6,  'Pasig Blazers',     8,  'BGC Rockets',       '2025-03-01', '21:00', 'Metro Sports Complex',   'completed',  81,   74,   'Round 2', 10),
(11, 1, 1,  'Manila Eagles',     13, 'Ayala Phoenix',     '2025-04-16', '15:00', 'VNTX National Stadium',  'live',       1,    0,    'Round 5', 11),
(12, 2, 5,  'Makati Thunder',    6,  'Pasig Blazers',     '2025-04-16', '19:00', 'Metro Sports Complex',   'live',       54,   51,   'Round 8', 12),
(13, 1, 2,  'Cebu Strikers FC',  3,  'Davao Warriors',    '2025-04-19', '15:00', 'Cebu Sports Complex',    'scheduled',  NULL, NULL, 'Round 5', 13),
(14, 1, 4,  'Quezon City Lions', 15, 'South Bay United',  '2025-04-19', '18:00', 'QC Memorial Circle',     'scheduled',  NULL, NULL, 'Round 5', 14),
(15, 2, 7,  'Taguig Sharks',     5,  'Makati Thunder',    '2025-04-20', '19:00', 'Metro Sports Complex',   'scheduled',  NULL, NULL, 'Round 9', 15),
(16, 2, 8,  'BGC Rockets',       6,  'Pasig Blazers',     '2025-04-20', '21:00', 'BGC Arena',              'scheduled',  NULL, NULL, 'Round 9', 16),
(17, 1, 1,  'Manila Eagles',     4,  'Quezon City Lions', '2025-04-26', '15:00', 'VNTX National Stadium',  'scheduled',  NULL, NULL, 'Round 6', 17),
(18, 1, 2,  'Cebu Strikers FC',  13, 'Ayala Phoenix',     '2025-04-26', '18:00', 'Cebu Sports Complex',    'scheduled',  NULL, NULL, 'Round 6', 18),
(19, 3, 9,  'Alabang Kings',     10, 'Ortigas Aces',      '2025-06-05', '10:00', 'Greenfield Tennis Club', 'scheduled',  NULL, NULL, 'Round 1', 19),
(20, 4, 11, 'Eastwood Falcons',  12, 'Rockwell Raptors',  '2025-07-15', '14:00', 'National Indoor Arena',  'scheduled',  NULL, NULL, 'Round 1', 20),
(21, 1, 3,  'Davao Warriors',    14, 'North District FC', '2025-04-05', '15:00', 'Davao Sports Center',    'postponed',  NULL, NULL, 'Round 4', 21),
(22, 5, 5,  'Makati Thunder',    7,  'Taguig Sharks',     '2025-01-10', '19:00', 'City Sports Hall',       'cancelled',  NULL, NULL, 'Group Stage', 22),
(23, 2, 5,  'Makati Thunder',    8,  'BGC Rockets',       '2025-03-15', '19:00', 'Metro Sports Complex',   'completed',  102,  88,   'Round 3', 23),
(24, 1, 4,  'Quezon City Lions', 13, 'Ayala Phoenix',     '2025-03-19', '18:00', 'VNTX National Stadium',  'completed',  0,    0,    'Round 3', 24),
(25, 2, 6,  'Pasig Blazers',     7,  'Taguig Sharks',     '2025-04-01', '19:00', 'Metro Sports Complex',   'completed',  79,   82,   'Round 5', 25);

-- ── Results ────────────────────────────────────────────────────
INSERT INTO results (id, match_id, tournament_id, home_team_name, away_team_name, home_score, away_score, result_date, venue, round_name, highlight, winner_id) VALUES
(1,  1,  1, 'Manila Eagles',     'Cebu Strikers FC',  3,   1,  '2025-03-05', 'VNTX National Stadium',  'Round 1', 'Manila Eagles dominated the first half with two quick goals from Santos and Ramos.', 1),
(2,  2,  1, 'Davao Warriors',    'Quezon City Lions', 2,   2,  '2025-03-05', 'VNTX National Stadium',  'Round 1', 'A thrilling draw with Lions equalizing in the 89th minute through a stunning free kick.', NULL),
(3,  3,  1, 'Ayala Phoenix',     'North District FC', 1,   0,  '2025-03-06', 'VNTX National Stadium',  'Round 1', 'A narrow 1-0 victory for Phoenix secured by a first-half penalty goal.', 13),
(4,  4,  1, 'Manila Eagles',     'Davao Warriors',    2,   0,  '2025-03-12', 'VNTX National Stadium',  'Round 2', 'Manila Eagles continued their strong form with a clean sheet victory over Davao Warriors.', 1),
(5,  5,  1, 'Cebu Strikers FC',  'Quezon City Lions', 3,   2,  '2025-03-12', 'VNTX National Stadium',  'Round 2', 'Cebu came from behind twice to win a pulsating 5-goal thriller.', 2),
(6,  6,  1, 'North District FC', 'South Bay United',  1,   1,  '2025-03-13', 'City Central Stadium',   'Round 2', 'South Bay United rescued a late draw to deny North District their first win.', NULL),
(7,  7,  2, 'Makati Thunder',    'Pasig Blazers',     88,  76, '2025-02-20', 'Metro Sports Complex',   'Round 1', 'Thunder\'s balanced attack powered by Chua\'s 24-point performance overwhelmed the Blazers.', 5),
(8,  8,  2, 'Taguig Sharks',     'BGC Rockets',       72,  69, '2025-02-20', 'Metro Sports Complex',   'Round 1', 'Sharks held on for a nail-biting 3-point victory in a low-scoring defensive battle.', 7),
(9,  9,  2, 'Makati Thunder',    'Taguig Sharks',     95,  87, '2025-03-01', 'Metro Sports Complex',   'Round 2', 'Makati Thunder remain unbeaten after another dominant display, leading by as much as 20 points.', 5),
(10, 10, 2, 'Pasig Blazers',     'BGC Rockets',       81,  74, '2025-03-01', 'Metro Sports Complex',   'Round 2', 'Blazers recover from their opening loss with a solid team performance.', 6),
(11, 23, 2, 'Makati Thunder',    'BGC Rockets',       102, 88, '2025-03-15', 'Metro Sports Complex',   'Round 3', 'Thunder break the 100-point barrier in commanding fashion, with Pascual scoring 30.', 5),
(12, 24, 1, 'Quezon City Lions', 'Ayala Phoenix',     0,   0,  '2025-03-19', 'VNTX National Stadium',  'Round 3', 'A goalless stalemate in a tactical match where both goalkeepers were rarely tested.', NULL),
(13, 25, 2, 'Pasig Blazers',     'Taguig Sharks',     79,  82, '2025-04-01', 'Metro Sports Complex',   'Round 5', 'Taguig stole the win in overtime after Roque hit a clutch three-pointer at the buzzer.', 7);

-- ── Standings ──────────────────────────────────────────────────
INSERT INTO standings (tournament_id, team_id, played, won, lost, drawn, points, goals_for, goals_against, goal_difference, rank_position) VALUES
-- Tournament 1 (Soccer - Champions Cup)
(1, 1,  10, 8, 2, 2, 26, 24, 10, 14,  1),
(1, 2,  10, 7, 3, 2, 23, 20, 12,  8,  2),
(1, 3,  10, 6, 4, 2, 20, 16, 14,  2,  3),
(1, 13, 10, 4, 4, 4, 16, 12, 13, -1,  4),
(1, 4,  10, 5, 5, 2, 17, 14, 16, -2,  5),
(1, 14, 10, 3, 7, 2, 11, 9,  20,-11,  6),
(1, 15, 10, 2, 8, 2,  8, 7,  22,-15,  7),
-- Tournament 2 (Basketball - Metro League)
(2, 5,  16, 12, 4, 0, 24, 0, 0, 0, 1),
(2, 6,  16, 10, 6, 0, 20, 0, 0, 0, 2),
(2, 7,  16,  9, 7, 0, 18, 0, 0, 0, 3),
(2, 8,  16,  7, 9, 0, 14, 0, 0, 0, 4),
-- Tournament 3 (Tennis)
(3, 9,   4,  3, 1, 0, 6, 0, 0, 0, 1),
(3, 10,  4,  2, 2, 0, 4, 0, 0, 0, 2),
-- Tournament 4 (Volleyball)
(4, 11,  2,  2, 0, 0, 6, 0, 0, 0, 1),
(4, 12,  2,  1, 1, 0, 3, 0, 0, 0, 2);

SELECT 'Database vntx_db seeded successfully!' AS status;
