import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, RefreshCw, AlertCircle, BarChart3 } from 'lucide-react';
import { Card } from '@/app/components/ui/Card';
import { Input, Select } from '@/app/components/ui/Input';
import { EmptyState, LoadingSpinner } from '@/app/components/ui/StatCard';
import { Modal } from '@/app/components/ui/Modal';
import { Button } from '@/app/components/ui/Button';
import { Pagination, usePagination } from '@/app/components/ui/Pagination';

const API = 'http://localhost:5000/api';

interface ApiResult {
  id: number;
  matchId: number;
  homeScore: number;
  awayScore: number;
  winnerId: number | null;
  highlights: string | null;
  match?: {
    tournamentId: number;
    roundName: string;
    matchDate: string;
    venue: string;
    homeTeam: { name: string };
    awayTeam: { name: string };
  };
}

interface Tournament { id: number; name: string; }

export default function ResultsPage() {
  const [resultsList, setResultsList] = useState<ApiResult[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tournamentFilter, setTournamentFilter] = useState('');
  const [selectedResult, setSelectedResult] = useState<ApiResult | null>(null);

  const fetchData = useCallback(async () => {
    setFetching(true);
    setError('');
    try {
      const [rRes, tRes] = await Promise.all([
        fetch(`${API}/results`),
        fetch(`${API}/tournaments`),
      ]);
      const rJson = await rRes.json();
      const tJson = await tRes.json();
      setResultsList(rJson.data || []);
      setTournaments(tJson.data || []);
    } catch {
      setError('Failed to load results from backend');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const tournamentOptions = [
    { value: '', label: 'All Tournaments' },
    ...tournaments.map(t => ({ value: String(t.id), label: t.name })),
  ];

  const filtered = resultsList.filter(r => {
    const hName = r.match?.homeTeam?.name || '';
    const aName = r.match?.awayTeam?.name || '';
    const matchSearch = !search ||
      hName.toLowerCase().includes(search.toLowerCase()) ||
      aName.toLowerCase().includes(search.toLowerCase());
    const matchTournament = !tournamentFilter || String(r.match?.tournamentId) === tournamentFilter;
    return matchSearch && matchTournament;
  });

  const { currentPage, totalPages, totalItems, itemsPerPage, paginated: pagedResults, setPage } = usePagination(filtered, 10);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <LoadingSpinner size={32} />
      <p className="text-sm text-[#64748B]">Loading results...</p>
    </div>
  );

  return (
    <div className="page-container animate-fade-in">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Results</h1>
          <p className="text-sm text-[#64748B]">{resultsList.length} completed match results</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-lg text-[#64748B] hover:text-white hover:bg-[#0D1F3C] transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} className={fetching ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={fetchData} className="underline text-xs shrink-0">Retry</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Results', value: resultsList.length,                                          color: '#00C8F8' },
          { label: 'Home Wins',     value: resultsList.filter(r => r.homeScore > r.awayScore).length,   color: '#10B981' },
          { label: 'Draws',         value: resultsList.filter(r => r.homeScore === r.awayScore).length, color: '#F59E0B' },
          { label: 'Away Wins',     value: resultsList.filter(r => r.homeScore < r.awayScore).length,   color: '#6366F1' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-[#0A1628] border border-[#1E3A5C] p-5 text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-[#64748B] font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input placeholder="Search teams..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search size={15} />} fullWidth />
          </div>
          <div className="w-52">
            <Select options={tournamentOptions} value={tournamentFilter} onChange={e => setTournamentFilter(e.target.value)} />
          </div>
        </div>
      </Card>

      <p className="text-xs text-[#64748B]">Showing {filtered.length} of {resultsList.length} results</p>

      {filtered.length === 0 ? (
        <EmptyState icon={<BarChart3 size={40} />} title="No results found" description="No completed matches match your filters" />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {pagedResults.map(result => {
              const hName = result.match?.homeTeam?.name || 'Home';
              const aName = result.match?.awayTeam?.name || 'Away';
              const isHomeWin = result.homeScore > result.awayScore;
              const isAwayWin = result.homeScore < result.awayScore;
              const isDraw   = result.homeScore === result.awayScore;

              return (
                <div
                  key={result.id}
                  className="rounded-xl border border-[#1E3A5C] bg-[#0A1628] p-5 hover:border-[#00C8F8]/40 transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedResult(result)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-[#64748B]">{result.match?.roundName} · {result.match?.matchDate}</span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isDraw ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>
                      {isDraw ? 'Draw' : isHomeWin ? `${hName} Win` : `${aName} Win`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 text-right">
                      <p className={`text-sm font-semibold truncate ${isHomeWin ? 'text-white' : 'text-[#64748B]'}`}>{hName}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-3xl font-black ${isHomeWin ? 'text-[#00C8F8]' : 'text-[#64748B]'}`}>{result.homeScore}</span>
                      <span className="text-[#64748B] text-sm">–</span>
                      <span className={`text-3xl font-black ${isAwayWin ? 'text-[#00C8F8]' : 'text-[#64748B]'}`}>{result.awayScore}</span>
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold truncate ${isAwayWin ? 'text-white' : 'text-[#64748B]'}`}>{aName}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1E3A5C] flex items-center gap-1.5 text-xs text-[#64748B]">
                    <MapPin size={10} />
                    <span className="truncate">{result.match?.venue || '—'}</span>
                  </div>

                  {result.highlights && (
                    <p className="mt-2 text-xs text-[#64748B] italic line-clamp-1">"{result.highlights}"</p>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedResult}
        onClose={() => setSelectedResult(null)}
        title="Match Result Details"
        size="md"
        footer={<Button variant="secondary" onClick={() => setSelectedResult(null)}>Close</Button>}
      >
        {selectedResult && (
          <div className="space-y-5">
            <div className="text-center py-6 rounded-xl bg-[#0D1F3C]">
              <p className="text-xs text-[#64748B] mb-2">{selectedResult.match?.roundName} · {selectedResult.match?.matchDate}</p>
              <div className="flex items-center justify-center gap-6">
                <div className="text-right flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{selectedResult.match?.homeTeam?.name}</p>
                  <p className="text-xs text-[#64748B]">Home</p>
                </div>
                <div className="text-center shrink-0">
                  <div className="text-4xl font-black text-[#00C8F8]">{selectedResult.homeScore} – {selectedResult.awayScore}</div>
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{selectedResult.match?.awayTeam?.name}</p>
                  <p className="text-xs text-[#64748B]">Away</p>
                </div>
              </div>
            </div>

            {selectedResult.highlights && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Match Highlights</h4>
                <p className="text-sm text-[#94A3B8] italic bg-[#0D1F3C] p-4 rounded-lg border-l-2 border-[#00C8F8]">
                  "{selectedResult.highlights}"
                </p>
              </div>
            )}

            <div className="p-4 rounded-xl border border-[#1E3A5C] bg-[#0A1628]/50">
              <div className="flex items-center gap-2 text-[#64748B] text-xs">
                <MapPin size={12} />
                <span>Venue: {selectedResult.match?.venue || '—'}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
