import { createBrowserRouter } from 'react-router';

import AdminLayout from './components/admin/AdminLayout';
import PublicLayout from './components/public/PublicLayout';

import HomePage from './pages/public/HomePage';
import TournamentsListPage from './pages/public/TournamentsListPage';
import TournamentDetailPage from './pages/public/TournamentDetailPage';
import StandingsPublicPage from './pages/public/StandingsPublicPage';
import MatchesPublicPage from './pages/public/MatchesPublicPage';

import LoginPage from './pages/LoginPage';

import DashboardPage from './pages/admin/DashboardPage';
import TournamentsPage from './pages/admin/TournamentsPage';
import TeamsPage from './pages/admin/TeamsPage';
import MatchesPage from './pages/admin/MatchesPage';
import ResultsPage from './pages/admin/ResultsPage';
import StandingsPage from './pages/admin/StandingsPage';

import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  // ── Public Routes ─────────────────────────────────────
  {
    path: '/',
    Component: PublicLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'tournaments', Component: TournamentsListPage },
      { path: 'tournaments/:id', Component: TournamentDetailPage },
      { path: 'standings', Component: StandingsPublicPage },
      { path: 'matches', Component: MatchesPublicPage },
    ],
  },

  // ── Auth ───────────────────────────────────────────────
  { path: '/login', Component: LoginPage },

  // ── Admin Routes (protected by AdminLayout) ────────────
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'tournaments', Component: TournamentsPage },
      { path: 'teams', Component: TeamsPage },
      { path: 'matches', Component: MatchesPage },
      { path: 'results', Component: ResultsPage },
      { path: 'standings', Component: StandingsPage },
    ],
  },

  // ── 404 ────────────────────────────────────────────────
  { path: '*', Component: NotFoundPage },
]);
