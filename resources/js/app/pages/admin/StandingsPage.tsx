import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ChevronDown, ChevronUp, Trophy, Info } from 'lucide-react';
import { Select } from '@/app/components/ui/Input';
import { LoadingSpinner } from '@/app/components/ui/StatCard';
import { Pagination, usePagination } from '@/app/components/ui/Pagination';
import { API_URL as API } from '@/config/api';

type SortKey = 'points' | 'won' | 'goalDifference' | 'goalsFor' | 'played';

interface StandingEntry {
  id: number;
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
}

interface Tournament { id: number; name: string; sport?: string; }

const MEDALS = ['🥇', '🥈', '🥉'];

// Sortable columns
const SORT_COLS: { key: SortKey; label: string; title: string }[] = [
  { key: 'played',         label: 'P',   title: 'Played — total matches' },
  { key: 'won',            label: 'W',   title: 'Won — 3 points each' },
  { key: 'goalDifference', label: 'GD',  title: 'Goal Difference (GF − GA)' },
  { key: 'points',         label: 'PTS', title: 'Points — main ranking (W×3 + D×1)' },
];

export default function StandingsPage() {
  const [tournaments,          setTournaments]    = useState<Tournament[]>([]);
  const [selectedId,           setSelectedId]     = useState('');
  const [standings,            setStandings]      = useState<StandingEntry[]>([]);
  const [loading,              setLoading]        = useState(true);
  const [fetching,             setFetching]       = useState(false);
  const [sortKey,              setSortKey]        = useState<SortKey>('points');
  const [sortAsc,              setSortAsc]        = useState(false);
  const [showLegend,           setShowLegend]     = useState(false);
  const [recalculating,        setRecalculating]  = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchTournaments = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/tournaments`);
      const json = await res.json();
      const data = json.data || [];
      setTournaments(data);
      if (data.length > 0) setSelectedId(String(data[0].id));
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  const fetchStandings = useCallback(async (tid: string) => {
    if (!tid) return;
    setFetching(true);
    try {
      const res  = await fetch(`${API}/standings/tournament/${tid}`);
      const json = await res.json();
      const data = json.data || [];
      setStandings(data.map((s: any) => ({
        id:             s.id,
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
      })));
    } catch { setStandings([]); }
    finally { setFetching(false); }
  }, []);

  const handleRecalculate = async () => {
    if (!selectedId || recalculating) return;
    setRecalculating(true);
    try {
      await fetch(`${API}/standings/recalculate/${selectedId}`, { method: 'POST' });
      await fetchStandings(selectedId);
    } catch { /* silent */ }
    finally { setRecalculating(false); }
  };

  useEffect(() => { fetchTournaments(); }, [fetchTournaments]);
  useEffect(() => { if (selectedId) fetchStandings(selectedId); }, [selectedId, fetchStandings]);

  // ── Sort ─────────────────────────────────────────────────────────────────
  const sorted = [...standings].sort((a, b) => {
    const diff = (b[sortKey] as number) - (a[sortKey] as number);
    return sortAsc ? -diff : diff;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const selectedTour = tournaments.find(t => String(t.id) === selectedId);

  // ── Pagination ── must be before any early returns (Rules of Hooks) ──────
  const { currentPage, totalPages, totalItems, itemsPerPage, paginated: pagedStandings, setPage } = usePagination(sorted, 15);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '96px 0' }}>
      <LoadingSpinner size={28} />
    </div>
  );

  /* ─────────────────────────── RENDER ─────────────────────────────── */

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>Standings</h1>
        <p style={{ color: '#475569', fontSize: '12px', marginTop: '3px' }}>Tournament leaderboards — ranked by points</p>
      </div>

      {/* ── Controls ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Tournament picker */}
        <div style={{ minWidth: '240px', flex: 1, maxWidth: '360px' }}>
          <Select
            options={tournaments.map(t => ({ value: String(t.id), label: t.name }))}
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            fullWidth
          />
        </div>

        {/* Refresh */}
        <button
          onClick={() => fetchStandings(selectedId)}
          disabled={fetching}
          title="Refresh"
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '9px 16px',
            borderRadius: '8px',
            background: 'transparent',
            border: '1px solid #1E3A5C',
            color: '#64748B',
            fontSize: '12px', fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#00C8F8'; e.currentTarget.style.color = '#00C8F8'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E3A5C'; e.currentTarget.style.color = '#64748B'; }}
        >
          <RefreshCw size={13} className={fetching ? 'animate-spin' : ''} />
          Refresh
        </button>

        {/* Recalculate standings */}
        <button
          onClick={handleRecalculate}
          disabled={recalculating || !selectedId}
          title="Force-recalculate standings from completed match scores"
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '9px 16px',
            borderRadius: '8px',
            background: recalculating ? 'rgba(0,200,248,0.1)' : 'rgba(0,200,248,0.06)',
            border: '1px solid rgba(0,200,248,0.3)',
            color: '#00C8F8',
            fontSize: '12px', fontWeight: 600,
            cursor: recalculating ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            fontFamily: 'inherit',
            opacity: recalculating ? 0.7 : 1,
          }}
        >
          <RefreshCw size={13} className={recalculating ? 'animate-spin' : ''} />
          {recalculating ? 'Recalculating…' : 'Recalculate'}
        </button>

        {/* Legend toggle */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '9px 16px',
            borderRadius: '8px',
            background: showLegend ? 'rgba(0,200,248,0.08)' : 'transparent',
            border: showLegend ? '1px solid rgba(0,200,248,0.25)' : '1px solid #1E3A5C',
            color: showLegend ? '#00C8F8' : '#64748B',
            fontSize: '12px', fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            fontFamily: 'inherit',
          }}
        >
          <Info size={13} />
          Column Guide
        </button>
      </div>

      {/* ── Column Legend (collapsible) ─────────────────────────────────── */}
      {showLegend && (
        <div style={{
          background: '#0A1628',
          border: '1px solid #1E3A5C',
          borderRadius: '12px',
          padding: '16px 20px',
        }} className="animate-fade-in">
          <p style={{ color: '#64748B', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
            What each column means
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px 24px' }}>
            {[
              { abbr: 'P',   color: '#94A3B8', full: 'Played',          note: 'Total matches played' },
              { abbr: 'W',   color: '#10B981', full: 'Won',             note: '+3 points per win' },
              { abbr: 'D',   color: '#F59E0B', full: 'Drawn',           note: '+1 point per draw' },
              { abbr: 'L',   color: '#EF4444', full: 'Lost',            note: '+0 points' },
              { abbr: 'GF',  color: '#94A3B8', full: 'Goals For',       note: 'Goals your team scored' },
              { abbr: 'GD',  color: '#94A3B8', full: 'Goal Difference', note: 'GF minus Goals Against' },
              { abbr: 'PTS', color: '#00C8F8', full: 'Points',          note: 'W×3 + D×1 — main stat' },
            ].map(c => (
              <div key={c.abbr} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 700, fontSize: '12px', color: c.color, minWidth: '28px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {c.abbr}
                </span>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  <span style={{ color: '#94A3B8' }}>{c.full}</span>
                  <span style={{ opacity: 0.6 }}> — {c.note}</span>
                </span>
              </div>
            ))}
          </div>
          {/* Formula callout */}
          <div style={{
            marginTop: '12px', padding: '10px 14px',
            background: 'rgba(0,200,248,0.06)',
            border: '1px solid rgba(0,200,248,0.2)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px',
          }}>
            <span style={{ fontSize: '11px', color: '#64748B' }}>📐 Points formula:</span>
            <code style={{ fontSize: '12px', color: '#00C8F8', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.03em' }}>
              PTS = (W × 3) + (D × 1)
            </code>
            <span style={{ fontSize: '11px', color: '#475569' }}>Teams with equal PTS are separated by GD.</span>
          </div>
        </div>
      )}

      {/* ── Stats strip ────────────────────────────────────────────────── */}
      {standings.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
          {[
            { label: 'Teams',      value: standings.length },
            { label: 'Sport',      value: selectedTour?.sport || '—' },
            { label: 'Leader',     value: sorted[0]?.teamName || '—' },
            { label: 'Top Points', value: sorted[0]?.points ?? 0 },
          ].map(s => (
            <div key={s.label} style={{
              background: '#0A1628',
              border: '1px solid #1E3A5C',
              borderRadius: '12px',
              padding: '14px 16px',
            }}>
              <p style={{ color: '#475569', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                {s.label}
              </p>
              <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Table / Empty ───────────────────────────────────────────────── */}
      {fetching ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <LoadingSpinner size={24} />
        </div>
      ) : standings.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '64px 24px', gap: '12px', textAlign: 'center',
          background: '#0A1628', border: '1px solid #1E3A5C', borderRadius: '16px',
        }}>
          <Trophy size={36} style={{ color: '#1E3A5C' }} />
          <p style={{ color: '#94A3B8', fontSize: '14px', fontWeight: 600 }}>No standings yet</p>
          <p style={{ color: '#475569', fontSize: '12px', maxWidth: '280px' }}>
            Complete matches in this tournament to generate the leaderboard.
          </p>
        </div>
      ) : (
        <div style={{
          background: '#0A1628',
          border: '1px solid #1E3A5C',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }} className="standings-table">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>

              {/* ── Head ───────────────────────────────────────────── */}
              <thead>
                <tr style={{ borderBottom: '1px solid #1E3A5C' }}>
                  {/* Rank */}
                  <th style={{
                    padding: '12px 16px', width: '48px', textAlign: 'left',
                    color: '#2A4E7A', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>#</th>

                  {/* Team */}
                  <th style={{
                    padding: '12px 16px', textAlign: 'left',
                    color: '#2A4E7A', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>Team</th>

                  {/* P */}
                  <th className="num" style={thStyle(sortKey === 'played')} onClick={() => handleSort('played')} title="Played">
                    <ThLabel label="P" active={sortKey === 'played'} asc={sortAsc} />
                  </th>

                  {/* W */}
                  <th className="num" style={thStyle(sortKey === 'won')} onClick={() => handleSort('won')} title="Won — 3 pts">
                    <ThLabel label="W" active={sortKey === 'won'} asc={sortAsc} />
                  </th>

                  {/* D */}
                  <th className="num" style={thStyle(false, true)} title="Drawn — 1 pt">
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>D</span>
                  </th>

                  {/* L */}
                  <th className="num" style={thStyle(false, true)} title="Lost — 0 pts">
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>L</span>
                  </th>

                  {/* GF — hidden on mobile */}
                  <th className="num hidden md:table-cell" style={thStyle(false, true)} title="Goals For">
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>GF</span>
                  </th>

                  {/* GD */}
                  <th className="num hidden md:table-cell" style={thStyle(sortKey === 'goalDifference')} onClick={() => handleSort('goalDifference')} title="Goal Difference">
                    <ThLabel label="GD" active={sortKey === 'goalDifference'} asc={sortAsc} />
                  </th>

                  {/* PTS */}
                  <th className="num" style={{ ...thStyle(sortKey === 'points'), borderRight: 'none' }} onClick={() => handleSort('points')} title="Points">
                    <ThLabel label="PTS" active={sortKey === 'points'} asc={sortAsc} />
                  </th>
                </tr>
              </thead>

              {/* ── Body ───────────────────────────────────────────── */}
              <tbody>
                {pagedStandings.map((entry, i) => {
                  const i_global = (currentPage - 1) * itemsPerPage + i;
                  const isFirst = i_global === 0;
                  const gdCol = entry.goalDifference > 0 ? '#10B981' : entry.goalDifference < 0 ? '#EF4444' : '#475569';

                  return (
                    <tr
                      key={entry.teamId}
                      style={{
                        borderBottom: '1px solid rgba(30,58,92,0.6)',
                        background: i_global === 0 ? 'rgba(0,200,248,0.03)' : 'transparent',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#0D1F3C')}
                      onMouseLeave={e => (e.currentTarget.style.background = i_global === 0 ? 'rgba(0,200,248,0.03)' : 'transparent')}
                    >
                      {/* Rank */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ width: '24px', textAlign: 'center', fontSize: '14px' }}>
                          {i < 3 ? MEDALS[i] : (
                            <span style={{ color: '#475569', fontSize: '12px', fontWeight: 500 }}>{i + 1}</span>
                          )}
                        </div>
                      </td>

                      {/* Team */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '3px', height: '22px', borderRadius: '2px',
                            background: entry.teamColor, flexShrink: 0, opacity: 0.85,
                          }} />
                          <span style={{
                            color: isFirst ? '#fff' : '#94A3B8',
                            fontWeight: isFirst ? 600 : 400,
                            fontSize: '13px',
                          }}>
                            {entry.teamName}
                          </span>
                          {isFirst && (
                            <span style={{
                              fontSize: '9px', fontWeight: 600, color: '#00C8F8',
                              background: 'rgba(0,200,248,0.12)', borderRadius: '4px', padding: '1px 6px',
                              textTransform: 'uppercase', letterSpacing: '0.08em',
                            }}>Leader</span>
                          )}
                        </div>
                      </td>

                      {/* P */}
                      <td className="num" style={{ padding: '13px', color: '#94A3B8' }}>{entry.played}</td>

                      {/* W — green */}
                      <td className="num" style={{ padding: '13px', color: '#10B981', fontWeight: 600 }}>{entry.won}</td>

                      {/* D — amber */}
                      <td className="num" style={{ padding: '13px', color: '#F59E0B' }}>{entry.drawn}</td>

                      {/* L — red */}
                      <td className="num" style={{ padding: '13px', color: '#EF4444' }}>{entry.lost}</td>

                      {/* GF */}
                      <td className="num hidden md:table-cell" style={{ padding: '13px', color: '#475569' }}>{entry.goalsFor}</td>

                      {/* GD */}
                      <td className="num hidden md:table-cell" style={{ padding: '13px', color: gdCol, fontWeight: entry.goalDifference !== 0 ? 500 : 400 }}>
                        {entry.goalDifference > 0 ? '+' : ''}{entry.goalDifference}
                      </td>

                      {/* PTS — most prominent */}
                      <td className="num" style={{ padding: '13px' }}>
                        <span style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          color: isFirst ? '#00C8F8' : '#fff',
                          ...(isFirst ? { textShadow: '0 0 12px rgba(0,200,248,0.5)' } : {}),
                        }}>
                          {entry.points}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Bottom: pagination + legend ────────────────────────── */}
          {totalPages > 1 && (
            <div style={{ padding: '4px 20px 0' }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setPage}
              />
            </div>
          )}
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid #1E3A5C',
            display: 'flex', flexWrap: 'wrap', gap: '6px 20px', alignItems: 'center',
          }}>
            {[
              { abbr: 'P', note: 'Played', color: '#475569' },
              { abbr: 'W', note: 'Won (+3pts)', color: '#10B981' },
              { abbr: 'D', note: 'Draw (+1pt)', color: '#F59E0B' },
              { abbr: 'L', note: 'Lost (+0)', color: '#EF4444' },
              { abbr: 'GF', note: 'Goals For', color: '#475569' },
              { abbr: 'GD', note: 'Goal Diff', color: '#475569' },
              { abbr: 'PTS', note: 'Points ← ranking', color: '#00C8F8' },
            ].map(c => (
              <span key={c.abbr} style={{ fontSize: '11px', color: '#2A4E7A', display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ color: c.color, fontWeight: 700 }}>{c.abbr}</span>
                <span style={{ color: '#2A4E7A' }}>= {c.note}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
function thStyle(active: boolean, noSort = false): React.CSSProperties {
  return {
    padding: '12px 13px 12px 0',
    color: active ? '#00C8F8' : '#2A4E7A',
    fontSize: '10px', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    cursor: noSort ? 'default' : 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    transition: 'color 0.15s ease',
  };
}

function ThLabel({ label, active, asc }: { label: string; active: boolean; asc: boolean }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
      {label}
      {active && (
        asc
          ? <ChevronUp size={10} style={{ color: '#00C8F8' }} />
          : <ChevronDown size={10} style={{ color: '#00C8F8' }} />
      )}
    </span>
  );
}
