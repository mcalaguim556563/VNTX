import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, Navigate } from 'react-router';
import { Trophy, Users, Calendar, MapPin, Crown, Medal, ChevronRight, RefreshCw } from 'lucide-react';
import { TournamentStatusBadge, MatchStatusBadge } from '@/app/components/ui/Badge';
import { EmptyState, LoadingSpinner } from '@/app/components/ui/StatCard';
import { API_URL as API } from '@/config/api';

type Tab = 'overview' | 'matches' | 'standings';

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const [tournament, setTournament] = useState<any>(null);
  const [tournamentTeams, setTournamentTeams] = useState<any[]>([]);
  const [tournamentMatches, setTournamentMatches] = useState<any[]>([]);
  const [tournamentStandings, setTournamentStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setFetchingData(true);
    try {
      const [tourRes, teamsRes, matchesRes, standingsRes] = await Promise.all([
        fetch(`${API}/tournaments/${id}`),
        fetch(`${API}/teams`),
        fetch(`${API}/matches`),
        fetch(`${API}/standings/tournament/${id}`)  // fixed: was /standings/:id
      ]);

      if (tourRes.status === 404) {
        setNotFound(true);
        return;
      }

      const tData = await tourRes.json();
      const teamsData = await teamsRes.json().catch(() => ({ data: [] }));
      const matchesData = await matchesRes.json().catch(() => ({ data: [] }));
      const standingsData = await standingsRes.json().catch(() => ({ data: [] }));

      const safeTeams = Array.isArray(teamsData.data) ? teamsData.data : [];
      const safeMatches = Array.isArray(matchesData.data) ? matchesData.data : [];
      const rawStandings = Array.isArray(standingsData.data) ? standingsData.data : [];

      // Normalize standings: handle both camelCase and snake_case from Sequelize
      const safeStandings = rawStandings
        .map((s: any) => ({
          id:             s.id,
          teamId:         s.teamId         ?? s.team_id,
          rankPosition:   s.rankPosition   ?? s.rank_position   ?? 0,
          played:         s.played         ?? 0,
          won:            s.won            ?? 0,
          drawn:          s.drawn          ?? 0,
          lost:           s.lost           ?? 0,
          points:         s.points         ?? 0,
          goalsFor:       s.goalsFor       ?? s.goals_for       ?? 0,
          goalsAgainst:   s.goalsAgainst   ?? s.goals_against   ?? 0,
          goalDifference: s.goalDifference ?? s.goal_difference ?? 0,
          teamName:       s.team?.name     || 'Unknown',
          teamColor:      s.team?.color    || '#00C8F8',
          teamAbbr:       s.team?.abbreviation || '',
        }))
        .sort((a: any, b: any) => a.rankPosition - b.rankPosition);

      const t = tData.data;
      t.status = t.status === 'in_progress' ? 'In Progress' : (t.status === 'upcoming' ? 'Upcoming' : (t.status === 'completed' ? 'Completed' : 'Draft'));
      t.startDate = t.start_date ?? t.startDate;
      t.endDate = t.end_date ?? t.endDate;
      // Prefer joined teams array length for accuracy
      const teamsInTournament = safeTeams.filter((team: any) => String(team.tournamentId || team.tournament_id) === String(id));
      t.teamCount = teamsInTournament.length || t.team_count || t.teamCount || 0;
      t.maxTeams = t.max_teams ?? t.maxTeams;
      t.prizePool = t.prize_pool ?? t.prizePool;
      setTournament(t);

      setTournamentTeams(teamsInTournament);
      setTournamentMatches(safeMatches.filter((match: any) => String(match.tournamentId || match.tournament_id) === String(id)));
      setTournamentStandings(safeStandings);
      
    } catch (err) {
      console.error("Fetch details error:", err);
      if (loading) setNotFound(true);
    } finally {
      setLoading(false);
      setFetchingData(false);
    }
  }, [id, loading]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050B1A] flex items-center justify-center">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (notFound || !tournament) return <Navigate to="/tournaments" replace />;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'matches', label: `Matches (${tournamentMatches.length})` },
    { key: 'standings', label: 'Standings' },
  ];

  return (
    <div className="min-h-screen bg-[#050B1A]">
      <div className="border-b border-[#1E3A5C] bg-[#0A1628]">
        <div className="w-full px-10 sm:px-16 lg:px-24 py-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Link to="/" className="hover:text-[#00C8F8] transition-colors">Home</Link>
              <ChevronRight size={12} />
              <Link to="/tournaments" className="hover:text-[#00C8F8] transition-colors">Tournaments</Link>
              <ChevronRight size={12} />
              <span className="text-[#94A3B8] truncate">{tournament.name}</span>
            </div>
            <button onClick={fetchData} className="p-2 rounded-lg text-[#64748B] hover:text-white transition-colors">
              <RefreshCw size={16} className={fetchingData ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="flex flex-wrap items-start gap-5">
            <div
              className="h-16 w-16 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #0066CC30, #00C8F830)', border: '1px solid #00C8F830' }}
            >
              <Trophy size={28} className="text-[#00C8F8]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white">{tournament.name}</h1>
                <TournamentStatusBadge status={tournament.status} />
              </div>
              <p className="text-[#94A3B8] text-sm mb-2">{tournament.description}</p>
              <div className="flex flex-wrap gap-4 text-xs text-[#64748B]">
                <span className="flex items-center gap-1"><Trophy size={12} />{tournament.sport} · {tournament.format}</span>
                <span className="flex items-center gap-1"><MapPin size={12} />{tournament.venue}</span>
                <span className="flex items-center gap-1"><Calendar size={12} />{tournament.startDate} – {tournament.endDate}</span>
                <span className="flex items-center gap-1"><Users size={12} />{tournament.teamCount}/{tournament.maxTeams} teams</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-[#64748B] mb-0.5">Prize Pool</div>
              <div className="text-xl font-black text-[#00C8F8]">{tournament.prizePool}</div>
              <div className="text-xs text-[#64748B] mt-1">{tournament.organizer}</div>
            </div>
          </div>
        </div>

        <div className="w-full px-10 sm:px-16 lg:px-24">
          <div className="flex gap-0">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-[#00C8F8] text-[#00C8F8]'
                    : 'border-transparent text-[#64748B] hover:text-[#94A3B8]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Teams Registered', value: tournament.teamCount, sub: `of ${tournament.maxTeams} max` },
                { label: 'Total Matches', value: tournamentMatches.length, sub: `${tournamentMatches.filter(m => m.status === 'completed').length} completed` },
                { label: 'Prize Pool', value: tournament.prizePool, sub: 'for winners' },
              ].map(s => (
                <div key={s.label} className="rounded-xl bg-[#0A1628] border border-[#1E3A5C] p-4">
                  <div className="text-xl font-black text-[#00C8F8]">{s.value}</div>
                  <div className="text-xs text-white font-medium mt-0.5">{s.label}</div>
                  <div className="text-xs text-[#64748B]">{s.sub}</div>
                </div>
              ))}

              <div className="sm:col-span-3">
                <h3 className="text-sm font-semibold text-[#94A3B8] mb-3">Participating Teams</h3>
                {tournamentTeams.length === 0 ? (
                  <EmptyState icon={<Users size={28} />} title="No teams registered" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tournamentTeams.map(team => (
                      <div key={team.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#0A1628] border border-[#1E3A5C]">
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: `${team.color}20`, color: team.color, border: `1px solid ${team.color}30` }}
                        >
                          {team.abbreviation || team.name.slice(0, 3).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{team.name}</p>
                          <p className="text-xs text-[#64748B]">Coach: {team.coach || '—'}</p>
                        </div>
                        <div className="text-xs text-[#64748B]">{team.wins}W - {team.losses}L</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-[#0A1628] border border-[#1E3A5C] p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Tournament Info</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Format', value: tournament.format },
                    { label: 'Sport', value: tournament.sport },
                    { label: 'Organizer', value: tournament.organizer },
                    { label: 'Venue', value: tournament.venue },
                    { label: 'Start Date', value: tournament.startDate },
                    { label: 'End Date', value: tournament.endDate },
                    { label: 'Status', value: tournament.status },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between gap-3">
                      <span className="text-[#64748B] shrink-0">{item.label}</span>
                      <span className="text-[#94A3B8] text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-3">
            {tournamentMatches.length === 0 ? (
              <EmptyState icon={<Calendar size={40} />} title="No matches scheduled" />
            ) : (
              tournamentMatches.map(match => (
                <div key={match.id} className="flex items-center gap-4 p-4 rounded-xl border border-[#1E3A5C] bg-[#0A1628] hover:border-[#00C8F8]/30 transition-all">
                  <MatchStatusBadge status={match.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">{match.homeTeamName}</span>
                      {match.homeScore !== null ? (
                        <span className="text-lg font-black text-[#00C8F8]">{match.homeScore} – {match.awayScore}</span>
                      ) : (
                        <span className="text-[#64748B] text-sm">vs</span>
                      )}
                      <span className="text-sm font-semibold text-white">{match.awayTeamName}</span>
                    </div>
                    <p className="text-xs text-[#64748B]">{match.matchDate} · {match.matchTime} · {match.venue} · {match.roundName}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="rounded-xl border border-[#1E3A5C] bg-[#0A1628] overflow-hidden">
            {tournamentStandings.length === 0 ? (
              <EmptyState icon={<Trophy size={40} />} title="No standings available" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1E3A5C] bg-[#0D1F3C]">
                      {['Rank', 'Team', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'PTS'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tournamentStandings.map((entry: any, i: number) => (
                      <tr key={entry.teamId} className={`border-b border-[#1E3A5C]/50 hover:bg-[#0D1F3C]/50 transition-colors ${i % 2 === 0 ? '' : 'bg-[#0D1F3C]/20'}`}>
                        <td className="px-4 py-3 font-bold text-white text-center w-12">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full shrink-0" style={{ background: entry.teamColor }} />
                            <span className="font-medium text-white">{entry.teamName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#94A3B8]">{entry.played}</td>
                        <td className="px-4 py-3 text-emerald-400 font-medium">{entry.won}</td>
                        <td className="px-4 py-3 text-amber-400">{entry.drawn}</td>
                        <td className="px-4 py-3 text-red-400">{entry.lost}</td>
                        <td className="px-4 py-3 text-[#94A3B8]">{entry.goalsFor}</td>
                        <td className="px-4 py-3 text-[#94A3B8]">{entry.goalsAgainst}</td>
                        <td className={`px-4 py-3 font-medium ${entry.goalDifference > 0 ? 'text-emerald-400' : entry.goalDifference < 0 ? 'text-red-400' : 'text-[#64748B]'}`}>
                          {entry.goalDifference > 0 ? '+' : ''}{entry.goalDifference}
                        </td>
                        <td className="px-4 py-3"><span className={`font-black ${i === 0 ? 'text-[#00C8F8]' : 'text-white'}`}>{entry.points}</span></td>
                      </tr>
                    ))}
                   </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
