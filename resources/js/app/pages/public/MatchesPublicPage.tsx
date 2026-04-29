import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { Calendar, MapPin, Clock, Zap, Search, RefreshCw } from 'lucide-react';
import { MatchStatusBadge } from '@/app/components/ui/Badge';
import { Input, Select } from '@/app/components/ui/Input';
import { EmptyState, LoadingSpinner } from '@/app/components/ui/StatCard';

const API = 'http://localhost:5000/api';

interface ApiMatch {
  id: number;
  tournamentId: number;
  homeTeamName: string;
  awayTeamName: string;
  matchDate: string;
  matchTime: string;
  venue: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  roundName: string;
}

interface Tournament {
  id: number;
  name: string;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'live', label: 'Live' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'postponed', label: 'Postponed' },
];

export default function MatchesPublicPage() {
  const [matchesList, setMatchesList] = useState<ApiMatch[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tournamentFilter, setTournamentFilter] = useState('');

  const fetchData = useCallback(async () => {
    setFetching(true);
    try {
      const [mRes, tRes] = await Promise.all([
        fetch(`${API}/matches`),
        fetch(`${API}/tournaments`),
      ]);
      const mJson = await mRes.json();
      const tJson = await tRes.json();
      setMatchesList(mJson.data || []);
      setTournaments(tJson.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = matchesList.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      m.homeTeamName.toLowerCase().includes(q) ||
      m.awayTeamName.toLowerCase().includes(q) ||
      m.venue.toLowerCase().includes(q);
    const matchStatus = !statusFilter || m.status === statusFilter;
    const matchTournament = !tournamentFilter || String(m.tournamentId) === tournamentFilter;
    return matchSearch && matchStatus && matchTournament;
  });

  const liveMatches = filtered.filter(m => m.status === 'live');
  const scheduledMatches = filtered.filter(m => m.status === 'scheduled');
  const completedMatches = filtered.filter(m => m.status === 'completed');
  const otherMatches = filtered.filter(m => ['postponed', 'cancelled'].includes(m.status));

  const groupedByDate = scheduledMatches.reduce<Record<string, ApiMatch[]>>((acc, m) => {
    if (!acc[m.matchDate]) acc[m.matchDate] = [];
    acc[m.matchDate].push(m);
    return acc;
  }, {});

  const MatchCard = ({ match }: { match: ApiMatch }) => {
    const isLive = match.status === 'live';
    return (
      <div className={`
        rounded-xl border bg-[#0A1628] p-4
        ${isLive ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/5' : 'border-[#1E3A5C]'}
        hover:border-[#00C8F8]/30 transition-all
      `}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[90px]">
            <MatchStatusBadge status={match.status as any} />
            <p className="text-[10px] text-[#64748B] mt-1">{match.roundName}</p>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-white">{match.homeTeamName}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                {match.homeScore !== null ? (
                  <>
                    <span className={`text-2xl font-black ${isLive ? 'text-[#00C8F8]' : 'text-white'}`}>{match.homeScore}</span>
                    <span className="text-[#64748B]">–</span>
                    <span className={`text-2xl font-black ${isLive ? 'text-[#00C8F8]' : 'text-white'}`}>{match.awayScore}</span>
                    {isLive && <Zap size={14} className="text-emerald-400 animate-pulse" />}
                  </>
                ) : (
                  <span className="text-[#64748B] text-sm font-medium">vs</span>
                )}
              </div>
              <span className="text-sm font-semibold text-white">{match.awayTeamName}</span>
            </div>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-[#64748B]">
              <span className="flex items-center gap-1"><MapPin size={10} />{match.venue}</span>
              <span className="flex items-center gap-1"><Calendar size={10} />{match.matchDate}</span>
              <span className="flex items-center gap-1"><Clock size={10} />{match.matchTime}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050B1A] flex items-center justify-center">
      <LoadingSpinner size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050B1A]">
      <div className="border-b border-[#1E3A5C] bg-[#0A1628] py-10">
        <div className="w-full px-10 sm:px-16 lg:px-24">
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-3">
            <Link to="/" className="hover:text-[#00C8F8] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#94A3B8]">Matches</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Match Schedule</h1>
          <p className="text-[#94A3B8]">Live, upcoming, and past matches across all tournaments</p>
        </div>
      </div>

      <div className="w-full px-10 sm:px-16 lg:px-24 py-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Live', value: matchesList.filter(m => m.status === 'live').length, color: '#10B981' },
              { label: 'Scheduled', value: matchesList.filter(m => m.status === 'scheduled').length, color: '#00C8F8' },
              { label: 'Completed', value: matchesList.filter(m => m.status === 'completed').length, color: '#6366F1' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A1628] border border-[#1E3A5C] text-xs">
                <div className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                <span className="text-white font-semibold">{s.value}</span>
                <span className="text-[#64748B]">{s.label}</span>
              </div>
            ))}
          </div>
          <button onClick={fetchData} className="p-2 rounded-lg text-[#64748B] hover:text-white transition-colors">
            <RefreshCw size={18} className={fetching ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input placeholder="Search teams or venues..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search size={15} />} fullWidth />
          </div>
          <div className="w-40">
            <Select options={statusOptions} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} />
          </div>
          <div className="w-60">
            <Select options={[{ value: '', label: 'All Tournaments' }, ...tournaments.map(t => ({ value: String(t.id), label: t.name }))]} value={tournamentFilter} onChange={e => setTournamentFilter(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Calendar size={40} />} title="No matches found" description="Try adjusting your filters" />
        ) : (
          <>
            {liveMatches.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
                  <h2 className="text-base font-bold text-white">Live Now</h2>
                </div>
                <div className="space-y-3">
                  {liveMatches.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              </div>
            )}

            {Object.keys(groupedByDate).length > 0 && (
              <div>
                <h2 className="text-base font-bold text-white mb-4">Upcoming</h2>
                {Object.entries(groupedByDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, dayMatches]) => (
                  <div key={date} className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar size={14} className="text-[#00C8F8]" />
                      <span className="text-sm font-semibold text-[#94A3B8]">
                        {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {dayMatches.map(m => <MatchCard key={m.id} match={m} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {completedMatches.length > 0 && (
              <div>
                <h2 className="text-base font-bold text-white mb-3">Completed</h2>
                <div className="space-y-3">
                  {completedMatches.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              </div>
            )}

            {otherMatches.length > 0 && (
              <div>
                <h2 className="text-base font-bold text-white mb-3">Other</h2>
                <div className="space-y-3">
                  {otherMatches.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
