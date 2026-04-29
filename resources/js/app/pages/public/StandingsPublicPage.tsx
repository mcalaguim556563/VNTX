import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { Trophy, Crown, Medal, RefreshCw } from 'lucide-react';
import { Select } from '@/app/components/ui/Input';
import { LoadingSpinner } from '@/app/components/ui/StatCard';

const API = 'http://localhost:5000/api';

interface StandingEntry {
  teamId: number;
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
  rankPosition: number;
}

interface Tournament {
  id: number;
  name: string;
}

export default function StandingsPublicPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingStandings, setFetchingStandings] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API}/tournaments`);
      const json = await res.json();
      const data = json.data || [];
      setTournaments(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(String(data[0].id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  const fetchStandings = useCallback(async (tid: string) => {
    if (!tid) return;
    setFetchingStandings(true);
    try {
      // Correct endpoint: /standings/tournament/:tournamentId
      const res = await fetch(`${API}/standings/tournament/${tid}`);
      const json = await res.json();
      const data = json.data || [];
      const mapped = data.map((s: any) => ({
        teamId:         s.teamId         ?? s.team_id,
        teamName:       s.team?.name     || 'Unknown',
        teamColor:      s.team?.color    || '#00C8F8',
        played:         s.played         ?? 0,
        won:            s.won            ?? 0,
        drawn:          s.drawn          ?? 0,
        lost:           s.lost           ?? 0,
        goalsFor:       s.goalsFor       ?? s.goals_for       ?? 0,
        goalsAgainst:   s.goalsAgainst   ?? s.goals_against   ?? 0,
        goalDifference: s.goalDifference ?? s.goal_difference ?? 0,
        points:         s.points         ?? 0,
        rankPosition:   s.rankPosition   ?? s.rank_position   ?? 0,
      }));
      // Sort by rankPosition so order is always correct
      mapped.sort((a: StandingEntry, b: StandingEntry) => a.rankPosition - b.rankPosition);
      setStandings(mapped);
    } catch (e) {
      console.error('Failed to fetch standings:', e);
    } finally {
      setFetchingStandings(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (selectedId) fetchStandings(selectedId); }, [selectedId, fetchStandings]);

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
            <span className="text-[#94A3B8]">Standings</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Standings</h1>
          <p className="text-[#94A3B8]">Current tournament leaderboards and rankings</p>
        </div>
      </div>

      <div className="w-full px-10 sm:px-16 lg:px-24 py-8">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <Trophy size={16} className="text-[#00C8F8]" />
            <span>Tournament:</span>
          </div>
          <div className="w-72">
            <Select
              options={tournaments.map(t => ({ value: String(t.id), label: t.name }))}
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              fullWidth
            />
          </div>
          <button onClick={() => fetchStandings(selectedId)} className="p-2 rounded-lg text-[#64748B] hover:text-white transition-colors">
            <RefreshCw size={16} className={fetchingStandings ? 'animate-spin' : ''} />
          </button>
        </div>

        {fetchingStandings ? (
          <div className="py-20 flex justify-center"><LoadingSpinner /></div>
        ) : standings.length === 0 ? (
          <div className="py-20 text-center text-[#64748B]">No standings available for this tournament.</div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-[#64748B] uppercase tracking-wide mb-4">Top 3</h2>
              <div className="grid grid-cols-3 gap-3">
                {standings.slice(0, 3).map((entry, i) => {
                  const podiumConfig = [
                    { border: 'border-amber-500/40', bg: 'bg-amber-500/5', icon: <Crown size={20} className="text-amber-400" />, pts: 'text-amber-400' },
                    { border: 'border-slate-400/40', bg: 'bg-slate-500/5', icon: <Medal size={20} className="text-slate-400" />, pts: 'text-slate-400' },
                    { border: 'border-amber-700/40', bg: 'bg-amber-700/5', icon: <Medal size={20} className="text-amber-700" />, pts: 'text-amber-700' },
                  ][i];

                  return (
                    <div key={entry.teamId} className={`rounded-xl border ${podiumConfig.border} ${podiumConfig.bg} p-4 text-center`}>
                      <div className="flex justify-center mb-2">{podiumConfig.icon}</div>
                      <div className="h-10 w-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-xs font-bold" style={{ background: `${entry.teamColor}20`, border: `2px solid ${entry.teamColor}40`, color: entry.teamColor }}>
                        {entry.teamName.split(' ').map(w => w[0]).join('').slice(0, 3)}
                      </div>
                      <p className="text-sm font-bold text-white leading-tight">{entry.teamName}</p>
                      <p className={`text-2xl font-black mt-1 ${podiumConfig.pts}`}>{entry.points}</p>
                      <p className="text-xs text-[#64748B]">points</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-[#1E3A5C] bg-[#0A1628] overflow-hidden">
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
                    {standings.map((entry, i) => (
                      <tr key={entry.teamId} className={`border-b border-[#1E3A5C]/50 hover:bg-[#0D1F3C]/60 transition-colors ${i % 2 === 0 ? 'bg-[#0A1628]' : 'bg-[#050B1A]'}`}>
                        <td className="px-4 py-3 w-12 text-center font-bold text-white">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-6 w-6 rounded-full shrink-0" style={{ background: entry.teamColor, opacity: 0.8 }} />
                            <span className="font-semibold text-white">{entry.teamName}</span>
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
                        <td className="px-4 py-3">
                          <span className={`text-base font-black ${i === 0 ? 'text-[#00C8F8]' : 'text-white'}`}>{entry.points}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-[#1E3A5C] flex flex-wrap gap-4 text-xs text-[#64748B]">
                <span>P=Played</span><span>W=Won</span><span>D=Draw</span><span>L=Lost</span>
                <span>GF=Goals For</span><span>GA=Goals Against</span><span>GD=Goal Diff</span><span>PTS=Points</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
