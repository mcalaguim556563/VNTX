import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import {
  Trophy, Users, Calendar, BarChart3, TrendingUp,
  ArrowRight, Zap, RefreshCw, AlertCircle, MapPin,
  Activity, Star, Clock,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import { MatchStatusBadge, TournamentStatusBadge } from '@/app/components/ui/Badge';
import { API_URL as API } from '@/config/api';

// ── Custom Chart Tooltip ──────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0D1F3C', border: '1px solid rgba(0,200,248,0.3)', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,200,248,0.1)' }}>
      <p style={{ fontSize: '11px', color: '#64748B', marginBottom: '6px', fontWeight: 600 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ fontSize: '13px', fontWeight: 700, color: p.color }}>
          {p.value} {p.name}
        </p>
      ))}
    </div>
  );
};

// ── Stat Card — Icon left, label centre, number right ────────────────────────
function HeroStatCard({
  title, subtitle, value, icon, accent, to,
}: {
  title: string; subtitle: string; value: number | string;
  icon: React.ReactNode; accent: string; to: string;
}) {
  return (
    <Link
      to={to}
      className="group relative flex items-center gap-4 p-5 rounded-2xl border border-[#1E3A5C]
        bg-gradient-to-br from-[#0A1628] to-[#050B1A]
        hover:border-opacity-60 hover:shadow-lg transition-all duration-300 overflow-hidden"
      style={{ '--accent': accent } as any}
    >
      {/* Glow blob */}
      <div
        className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20"
        style={{ background: accent }}
      />

      {/* Icon */}
      <div
        className="shrink-0 h-12 w-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${accent}20`, color: accent, boxShadow: `0 0 0 1px ${accent}30` }}
      >
        {icon}
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#64748B] uppercase tracking-widest leading-none mb-1">{title}</p>
        <p className="text-[11px] text-[#475569] truncate">{subtitle}</p>
      </div>

      {/* Value — right-aligned, large */}
      <div className="shrink-0 text-right">
        <span
          className="text-4xl font-black leading-none tabular-nums"
          style={{ color: accent, textShadow: `0 0 30px ${accent}60` }}
        >
          {value}
        </span>
      </div>

      {/* Bottom accent bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />
    </Link>
  );
}

// ── Mini stat row ─────────────────────────────────────────────────────────────
function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#1E3A5C]/40 last:border-0">
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: color }} />
        <span className="text-xs text-[#94A3B8]">{label}</span>
      </div>
      <span className="text-sm font-bold text-white tabular-nums">{value}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats]       = useState<any>(null);
  const [recent, setRecent]     = useState<any>(null);
  const [chartData, setChart]   = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError]       = useState('');

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setFetching(true);
    setError('');
    try {
      const [sRes, rRes, cRes, aRes] = await Promise.all([
        fetch(`${API}/dashboard/stats`),
        fetch(`${API}/dashboard/recent`),
        fetch(`${API}/dashboard/results-distribution`),
        fetch(`${API}/dashboard/analytics`),
      ]);

      if (!sRes.ok || !rRes.ok) throw new Error('API error');

      const [sData, rData, cData, aData] = await Promise.all([
        sRes.json(),
        rRes.json(),
        cRes.ok ? cRes.json() : [],
        aRes.ok ? aRes.json() : null,
      ]);

      setStats(sData);
      setRecent(rData);
      setChart(Array.isArray(cData) ? cData : []);
      setAnalytics(aData);
    } catch {
      setError('Cannot reach backend. Make sure the server is running on port 5000.');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="relative">
        <div className="h-14 w-14 rounded-full border-2 border-[#1E3A5C] border-t-[#00C8F8] animate-spin" />
        <Trophy size={20} className="absolute inset-0 m-auto text-[#00C8F8]" />
      </div>
      <p className="text-sm text-[#64748B] tracking-wider uppercase">Loading Dashboard…</p>
    </div>
  );

  // ── Derived values safely ──────────────────────────────────────────────────
  const s = stats ?? {};
  const heroCards = [
    {
      title: 'Active Tournaments',
      subtitle: `${s.totalTournaments ?? 0} total created`,
      value: s.activeTournaments ?? 0,
      icon: <Trophy size={22} />,
      accent: '#00C8F8',
      to: '/admin/tournaments',
    },
    {
      title: 'Live Matches',
      subtitle: `${s.completedMatches ?? 0} completed`,
      value: s.liveMatches ?? 0,
      icon: <Zap size={22} />,
      accent: '#10B981',
      to: '/admin/matches',
    },
    {
      title: 'Total Teams',
      subtitle: 'Registered in system',
      value: s.totalTeams ?? 0,
      icon: <Users size={22} />,
      accent: '#6366F1',
      to: '/admin/teams',
    },
    {
      title: 'Upcoming Matches',
      subtitle: `${s.totalMatches ?? 0} total scheduled`,
      value: s.upcomingMatches ?? 0,
      icon: <Calendar size={22} />,
      accent: '#F59E0B',
      to: '/admin/matches',
    },
  ];

  // Chart is non-empty if ANY month has results OR completed matches
  const allEmpty = chartData.every(d => (d.results ?? d.count ?? 0) === 0 && (d.matches ?? 0) === 0);
  // Normalize old {count} format to new {results, matches} format
  const normalizedChart = chartData.map(d => ({
    month:   d.month,
    results: d.results ?? d.count ?? 0,
    matches: d.matches ?? 0,
  }));

  return (
    <div className="page-container animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity size={20} className="text-[#00C8F8]" />
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={fetching}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#64748B]
              border border-[#1E3A5C] hover:text-white hover:border-[#00C8F8]/40 transition-all"
            title="Refresh data"
          >
            <RefreshCw size={15} className={fetching ? 'animate-spin text-[#00C8F8]' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            to="/admin/matches"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold
              bg-[#00C8F8] text-[#050B1A] hover:bg-[#00AADD] transition-colors shadow-lg shadow-[#00C8F8]/20"
          >
            <Zap size={15} />
            Schedule Match
          </Link>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => fetchData()} className="underline text-xs opacity-75 hover:opacity-100 shrink-0">Retry</button>
        </div>
      )}

      {/* ── Stat cards ─────────────────────────────────────────── */}
      <div className="grid-auto-md" role="region" aria-label="Key statistics">
        {heroCards.map(card => (
          <HeroStatCard key={card.title} {...card} />
        ))}
      </div>

      {/* ── Chart + System Summary ──────────────────────────── */}
      <div className="dash-chart-grid">

        {/* Area Chart — Result Activity */}
        <div style={{ borderRadius: '16px', border: '1px solid #1E3A5C', background: 'linear-gradient(135deg, #0A1628 0%, #050B1A 100%)', padding: '24px' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 size={16} className="text-[#00C8F8]" />
                Result Activity
              </h3>
              <p className="text-xs text-[#475569] mt-0.5">Match results recorded — past 6 months</p>
            </div>
            <span className="text-xs font-bold text-[#00C8F8] px-2.5 py-1 rounded-lg bg-[#00C8F8]/10 border border-[#00C8F8]/20">
              {s.totalResults ?? 0} total
            </span>
          </div>

          {allEmpty ? (
            <div style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', textAlign: 'center' }}>
              <div style={{ height: '56px', width: '56px', borderRadius: '14px', background: '#0D1F3C', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #1E3A5C' }}>
                <BarChart3 size={26} style={{ color: '#1E3A5C' }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>No activity recorded yet</p>
                <p style={{ fontSize: '11px', color: '#2A3A4C', marginTop: '4px' }}>Record match results to see the chart fill up</p>
              </div>
              <Link to="/admin/results" style={{ fontSize: '12px', color: '#00C8F8', fontWeight: 600, textDecoration: 'none' }}>Record a result →</Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={normalizedChart} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradResults" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#00C8F8" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#00C8F8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradMatches" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#0D1F3C" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
                  formatter={(value) => <span style={{ color: '#94A3B8' }}>{value}</span>}
                />
                <Area
                  type="monotone" dataKey="matches" name="Completed Matches"
                  stroke="#10B981" strokeWidth={2} fill="url(#gradMatches)"
                  dot={{ fill: '#10B981', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#fff', stroke: '#10B981' }}
                />
                <Area
                  type="monotone" dataKey="results" name="Results Recorded"
                  stroke="#00C8F8" strokeWidth={2.5} fill="url(#gradResults)"
                  dot={{ fill: '#00C8F8', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#fff', stroke: '#00C8F8' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* System Summary */}
        <div className="rounded-2xl border border-[#1E3A5C] bg-gradient-to-br from-[#0A1628] to-[#050B1A] p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-[#6366F1]" />
              System Summary
            </h3>
          </div>
          <div className="space-y-1">
            <MiniStat label="Total Tournaments" value={s.totalTournaments ?? 0}  color="#00C8F8" />
            <MiniStat label="In Progress"        value={s.activeTournaments ?? 0} color="#10B981" />
            <MiniStat label="Total Teams"         value={s.totalTeams ?? 0}        color="#6366F1" />
            <MiniStat label="Total Matches"       value={s.totalMatches ?? 0}      color="#F59E0B" />
            <MiniStat label="Completed Matches"   value={s.completedMatches ?? 0}  color="#94A3B8" />
            <MiniStat label="Results Recorded"    value={s.totalResults ?? 0}      color="#EC4899" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Link
              to="/admin/standings"
              className="text-center text-xs py-2.5 rounded-xl border border-[#1E3A5C] text-[#64748B]
                hover:text-white hover:border-[#00C8F8]/40 hover:bg-[#0D1F3C] transition-all font-medium"
            >
              Standings
            </Link>
            <Link
              to="/admin/results"
              className="text-center text-xs py-2.5 rounded-xl border border-[#1E3A5C] text-[#64748B]
                hover:text-white hover:border-[#00C8F8]/40 hover:bg-[#0D1F3C] transition-all font-medium"
            >
              Results
            </Link>
          </div>
        </div>
      </div>

      {/* ── Recent Matches + Teams ───────────────────────────── */}
      {/* ── Tournament Distribution Bar Chart ─────────────────── */}
      {analytics?.tournamentDist?.length > 0 && (
        <div style={{ borderRadius: '16px', border: '1px solid #1E3A5C', background: 'linear-gradient(135deg, #0A1628 0%, #050B1A 100%)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 size={16} className="text-[#F59E0B]" />
                Tournament Activity
              </h3>
              <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>Matches per tournament</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={analytics.tournamentDist} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0D1F3C" vertical={false} />
              <XAxis
                dataKey="tournament"
                tick={{ fill: '#475569', fontSize: 10 }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => v.length > 12 ? v.slice(0, 12) + '…' : v}
              />
              <YAxis allowDecimals={false} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(0,200,248,0.05)' }}
                content={<ChartTooltip />}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(value) => <span style={{ color: '#94A3B8' }}>{value}</span>}
              />
              <Bar dataKey="match_count" name="Total Matches" fill="#1E3A5C" radius={[4, 4, 0, 0]}>
                {analytics.tournamentDist.map((_: any, i: number) => (
                  <Cell key={i} fill={['#00C8F8', '#10B981', '#6366F1', '#F59E0B', '#EC4899', '#3A6A9E'][i % 6]} />
                ))}
              </Bar>
              <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="dash-recent-grid">

        {/* Recent Matches — 3/5 */}
        <div style={{ borderRadius: '16px', border: '1px solid #1E3A5C', background: 'linear-gradient(135deg, #0A1628 0%, #050B1A 100%)', padding: '24px' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock size={16} className="text-[#F59E0B]" />
              Recent Matches
            </h3>
            <Link to="/admin/matches" className="flex items-center gap-1 text-xs text-[#00C8F8] hover:underline font-medium">
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {!recent?.matches?.length ? (
            <div className="py-12 flex flex-col items-center gap-3 text-center">
              <div className="h-14 w-14 rounded-2xl bg-[#0D1F3C] flex items-center justify-center border border-[#1E3A5C]">
                <Calendar size={24} className="text-[#1E3A5C]" />
              </div>
              <p className="text-sm text-[#475569] font-medium">No matches yet</p>
              <Link to="/admin/matches" className="text-xs text-[#00C8F8] hover:underline">
                Schedule your first match →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.matches.map((match: any) => {
                const hScore = match.result?.homeScore ?? match.homeScore;
                const aScore = match.result?.awayScore ?? match.awayScore;
                const hasScore = hScore !== null && hScore !== undefined;
                const homeName = match.homeTeamName || match.homeTeam?.name || '—';
                const awayName = match.awayTeamName || match.awayTeam?.name || '—';
                const homeColor = match.homeTeam?.color || '#00C8F8';
                const awayColor = match.awayTeam?.color || '#6366F1';

                return (
                  <div
                    key={match.id}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0D1F3C]/60 border border-[#1E3A5C]/50
                      hover:border-[#00C8F8]/25 hover:bg-[#0D1F3C] transition-all duration-200"
                  >
                    {/* Status */}
                    <MatchStatusBadge status={match.status} />

                    {/* Teams + Score */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
                          <div className="h-2 w-2 rounded-full shrink-0" style={{ background: homeColor }} />
                          <span className="text-sm font-bold text-white truncate">{homeName}</span>
                        </div>
                        <div className="shrink-0 px-2 py-0.5 rounded-lg bg-[#050B1A] border border-[#1E3A5C] min-w-[56px] text-center">
                          {hasScore ? (
                            <span className="text-sm font-black text-[#00C8F8] tabular-nums">{hScore}–{aScore}</span>
                          ) : (
                            <span className="text-xs text-[#475569] font-medium">vs</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="text-sm font-bold text-white truncate">{awayName}</span>
                          <div className="h-2 w-2 rounded-full shrink-0" style={{ background: awayColor }} />
                        </div>
                      </div>
                      {(match.venue || match.matchDate) && (
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-[#475569]">
                          {match.venue && <span className="flex items-center gap-1"><MapPin size={9} />{match.venue}</span>}
                          {match.matchDate && <span className="flex items-center gap-1"><Clock size={9} />{match.matchDate}</span>}
                          {match.roundName && <span>· {match.roundName}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Teams + Tournaments — 2/5 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Teams */}
          <div className="rounded-2xl border border-[#1E3A5C] bg-gradient-to-br from-[#0A1628] to-[#050B1A] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={14} className="text-[#6366F1]" />
                Recent Teams
              </h3>
              <Link to="/admin/teams" className="text-[11px] text-[#00C8F8] hover:underline font-medium flex items-center gap-1">
                All <ArrowRight size={10} />
              </Link>
            </div>
            {!recent?.teams?.length ? (
              <p className="text-xs text-[#475569] text-center py-6">No teams yet</p>
            ) : (
              <div className="space-y-2">
                {recent.teams.map((team: any) => (
                  <div key={team.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#0D1F3C] transition-colors">
                    <div
                      className="h-9 w-9 rounded-xl shrink-0 flex items-center justify-center text-[10px] font-black"
                      style={{ background: `${team.color || '#00C8F8'}20`, color: team.color || '#00C8F8', border: `1.5px solid ${team.color || '#00C8F8'}35` }}
                    >
                      {(team.abbreviation || team.name?.slice(0, 3) || '?').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{team.name}</p>
                      <p className="text-[10px] text-[#475569] truncate">{team.sport}</p>
                    </div>
                    <div className="flex gap-1 text-[10px] font-bold shrink-0">
                      <span className="text-emerald-400">{team.wins ?? 0}W</span>
                      <span className="text-[#475569]">{team.draws ?? 0}D</span>
                      <span className="text-red-400">{team.losses ?? 0}L</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tournaments */}
          <div className="rounded-2xl border border-[#1E3A5C] bg-gradient-to-br from-[#0A1628] to-[#050B1A] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Trophy size={14} className="text-[#00C8F8]" />
                Tournaments
              </h3>
              <Link to="/admin/tournaments" className="text-[11px] text-[#00C8F8] hover:underline font-medium flex items-center gap-1">
                All <ArrowRight size={10} />
              </Link>
            </div>
            {!recent?.tournaments?.length ? (
              <p className="text-xs text-[#475569] text-center py-6">No tournaments yet</p>
            ) : (
              <div className="space-y-2">
                {recent.tournaments.map((t: any) => {
                  const statusLabel =
                    t.status === 'in_progress' ? 'In Progress' :
                    t.status === 'upcoming'    ? 'Upcoming'    :
                    t.status === 'completed'   ? 'Completed'   : 'Draft';
                  return (
                    <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#0D1F3C] transition-colors gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Star size={12} className="text-[#F59E0B] shrink-0" />
                        <p className="text-xs font-medium text-white truncate">{t.name}</p>
                      </div>
                      <TournamentStatusBadge status={statusLabel} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
