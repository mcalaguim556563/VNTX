import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Edit2, Trash2, Calendar, MapPin, Clock,
  Zap, RefreshCw, AlertCircle, CheckCircle, Loader2,
} from 'lucide-react';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Input, Select } from '@/app/components/ui/Input';
import { MatchStatusBadge } from '@/app/components/ui/Badge';
import { Modal } from '@/app/components/ui/Modal';
import { EmptyState, LoadingSpinner } from '@/app/components/ui/StatCard';
import { Pagination, usePagination } from '@/app/components/ui/Pagination';

const API = 'http://localhost:5000/api';

interface ApiMatch {
  id: number;
  tournamentId: number;
  homeTeamId: number;
  homeTeamName: string;
  awayTeamId: number;
  awayTeamName: string;
  matchDate: string;
  matchTime: string;
  venue: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  roundName: string;
  matchNumber: number;
}

interface ApiTeam    { id: number; name: string; }
interface ApiTournament { id: number; name: string; }

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'live',      label: 'Live'      },
  { value: 'completed', label: 'Completed' },
  { value: 'postponed', label: 'Postponed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusBorder: Record<string, string> = {
  scheduled: 'border-[#00C8F8]/25',
  live:      'border-emerald-500/40 shadow-emerald-500/10 shadow-md',
  completed: 'border-[#1E3A5C]',
  postponed: 'border-amber-500/25',
  cancelled: 'border-red-500/25',
};

const emptyForm = {
  tournamentId: '',
  homeTeamId:   '',
  awayTeamId:   '',
  matchDate:    '',
  matchTime:    '',
  venue:        '',
  roundName:    '',
  status:       'scheduled',
  homeScore:    '',
  awayScore:    '',
};

export default function MatchesPage() {
  const [matchList,    setMatchList]    = useState<ApiMatch[]>([]);
  const [teams,        setTeams]        = useState<ApiTeam[]>([]);
  const [tournaments,  setTournaments]  = useState<ApiTournament[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [pageError,    setPageError]    = useState('');
  const [formError,    setFormError]    = useState('');
  const [successMsg,   setSuccessMsg]   = useState('');

  const [search,          setSearch]          = useState('');
  const [statusFilter,    setStatusFilter]    = useState('');
  const [tournamentFilter,setTournamentFilter]= useState('');
  const [modalOpen,       setModalOpen]       = useState(false);
  const [deleteModal,     setDeleteModal]     = useState(false);
  const [selectedMatch,   setSelectedMatch]   = useState<ApiMatch | null>(null);
  const [form,            setForm]            = useState({ ...emptyForm });

  // ── Fetch all data ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setPageError('');
    try {
      const [mRes, tRes, trRes] = await Promise.all([
        fetch(`${API}/matches`),
        fetch(`${API}/teams`),
        fetch(`${API}/tournaments`),
      ]);
      const [mJ, tJ, trJ] = await Promise.all([mRes.json(), tRes.json(), trRes.json()]);
      setMatchList(mJ.data   ?? []);
      setTeams(tJ.data       ?? []);
      setTournaments(trJ.data ?? []);
    } catch {
      setPageError('Failed to connect to backend. Is the server running on port 5000?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Clear success message after 3 s
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(''), 3000);
    return () => clearTimeout(t);
  }, [successMsg]);

  // ── Filter & sort ──────────────────────────────────────────────────────────
  const filtered = matchList.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (m.homeTeamName || '').toLowerCase().includes(q) ||
      (m.awayTeamName || '').toLowerCase().includes(q) ||
      (m.venue        || '').toLowerCase().includes(q);
    const matchStatus     = !statusFilter     || m.status === statusFilter;
    const matchTournament = !tournamentFilter || String(m.tournamentId) === tournamentFilter;
    return matchSearch && matchStatus && matchTournament;
  });

  const ordered = [
    ...filtered.filter(m => m.status === 'live'),
    ...filtered.filter(m => m.status === 'scheduled'),
    ...filtered.filter(m => m.status === 'completed'),
    ...filtered.filter(m => ['postponed', 'cancelled'].includes(m.status)),
  ];

  const { currentPage, totalPages, totalItems, itemsPerPage, paginated: pagedMatches, setPage } = usePagination(ordered, 10);

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setSelectedMatch(null);
    setForm({ ...emptyForm });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (m: ApiMatch) => {
    setSelectedMatch(m);
    setForm({
      tournamentId: String(m.tournamentId ?? ''),
      homeTeamId:   String(m.homeTeamId   ?? ''),
      awayTeamId:   String(m.awayTeamId   ?? ''),
      matchDate:    m.matchDate  ?? '',
      matchTime:    m.matchTime  ?? '',
      venue:        m.venue      ?? '',
      roundName:    m.roundName  ?? '',
      status:       m.status     ?? 'scheduled',
      homeScore:    m.homeScore !== null && m.homeScore !== undefined ? String(m.homeScore) : '',
      awayScore:    m.awayScore !== null && m.awayScore !== undefined ? String(m.awayScore) : '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setFormError('');
  };

  // ── Save (Create / Update) ─────────────────────────────────────────────────
  const handleSave = async () => {
    setFormError('');

    // Client-side validation
    if (!form.tournamentId) return setFormError('Please select a tournament.');
    if (!form.homeTeamId)   return setFormError('Please select a home team.');
    if (!form.awayTeamId)   return setFormError('Please select an away team.');
    if (form.homeTeamId === form.awayTeamId) return setFormError('Home and away teams must be different.');
    if (!form.matchDate)    return setFormError('Please enter a match date.');

    setSaving(true);
    try {
      const isEdit = !!selectedMatch;
      const url    = isEdit ? `${API}/matches/${selectedMatch!.id}` : `${API}/matches`;
      const method = isEdit ? 'PUT' : 'POST';

      const body: any = {
        tournamentId: parseInt(form.tournamentId),
        homeTeamId:   parseInt(form.homeTeamId),
        awayTeamId:   parseInt(form.awayTeamId),
        matchDate:    form.matchDate,
        matchTime:    form.matchTime  || null,
        venue:        form.venue      || null,
        roundName:    form.roundName  || null,
        status:       form.status,
        homeScore:    form.homeScore !== '' ? parseInt(form.homeScore) : null,
        awayScore:    form.awayScore !== '' ? parseInt(form.awayScore) : null,
      };

      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!res.ok) {
        setFormError(json.message || json.error || `Server error ${res.status}`);
        return;
      }

      setModalOpen(false);
      setSuccessMsg(isEdit ? 'Match updated successfully.' : 'Match scheduled successfully.');
      await fetchData(true);
    } catch (e: any) {
      setFormError(`Network error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selectedMatch) return;
    setDeleting(true);
    try {
      const res  = await fetch(`${API}/matches/${selectedMatch.id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || `Delete failed: ${res.status}`);
      setDeleteModal(false);
      setSelectedMatch(null);
      setSuccessMsg('Match deleted.');
      await fetchData(true);
    } catch (e: any) {
      setPageError(`Failed to delete match: ${e.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // ── Derived options ────────────────────────────────────────────────────────
  const tournamentOptions = [
    { value: '', label: 'All Tournaments' },
    ...tournaments.map(t => ({ value: String(t.id), label: t.name })),
  ];
  const teamOptions = teams.map(t => ({ value: String(t.id), label: t.name }));

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <LoadingSpinner size={32} />
      <p className="text-sm text-[#64748B]">Loading matches…</p>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page-container animate-fade-in">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Matches</h1>
          <p className="text-sm text-[#64748B]">
            {matchList.length} total ·{' '}
            <span className="text-emerald-400">{matchList.filter(m => m.status === 'live').length} live</span> ·{' '}
            <span className="text-[#00C8F8]">{matchList.filter(m => m.status === 'scheduled').length} scheduled</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            className="p-2 rounded-lg text-[#64748B] hover:text-white hover:bg-[#0D1F3C] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <Button icon={<Plus size={15} />} onClick={openAdd}>Schedule Match</Button>
        </div>
      </div>

      {/* Page-level messages */}
      {pageError && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span className="flex-1">{pageError}</span>
          <button onClick={() => setPageError('')} className="text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
          <CheckCircle size={16} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <Input
              placeholder="Search teams or venues…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search size={15} />}
              fullWidth
            />
          </div>
          <div className="w-36">
            <Select
              options={[{ value: '', label: 'All Statuses' }, ...STATUS_OPTIONS]}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Select
              options={tournamentOptions}
              value={tournamentFilter}
              onChange={e => setTournamentFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Matches List */}
      {ordered.length === 0 ? (
        <EmptyState
          icon={<Calendar size={40} />}
          title="No matches found"
          description={search || statusFilter || tournamentFilter
            ? 'Try adjusting your filters'
            : 'Schedule the first match to get started'}
          action={<Button size="sm" icon={<Plus size={14} />} onClick={openAdd}>Schedule Match</Button>}
        />
      ) : (
        <div className="space-y-4">
          {pagedMatches.map(match => (
            <div
              key={match.id}
              className={`rounded-xl border bg-[#0A1628] p-5 sm:p-6 transition-all duration-200 hover:border-[#00C8F8]/40 ${statusBorder[match.status] ?? 'border-[#1E3A5C]'}`}
            >
              <div className="flex flex-wrap items-center gap-4">
                {/* Status + Round */}
                <div className="flex flex-col gap-1 min-w-[90px]">
                  <MatchStatusBadge status={match.status} />
                  {match.roundName && <span className="text-[10px] text-[#64748B]">{match.roundName}</span>}
                </div>

                {/* Teams + Score */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white truncate flex-1 text-right">{match.homeTeamName}</span>
                    <div className="shrink-0 min-w-[52px] text-center">
                      {match.homeScore !== null && match.homeScore !== undefined ? (
                        <span className="text-xl font-black text-[#00C8F8] tabular-nums">
                          {match.homeScore}–{match.awayScore}
                        </span>
                      ) : (
                        <span className="text-[#64748B] text-sm font-medium">vs</span>
                      )}
                      {match.status === 'live' && <Zap size={12} className="inline ml-1 text-emerald-400 animate-pulse" />}
                    </div>
                    <span className="text-sm font-bold text-white truncate flex-1">{match.awayTeamName}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-[#64748B]">
                    {match.venue    && <span className="flex items-center gap-1"><MapPin  size={10} />{match.venue}</span>}
                    {match.matchDate && <span className="flex items-center gap-1"><Calendar size={10} />{match.matchDate}</span>}
                    {match.matchTime && <span className="flex items-center gap-1"><Clock    size={10} />{match.matchTime}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(match)}
                    className="p-1.5 rounded text-[#64748B] hover:text-[#00C8F8] hover:bg-[#0D1F3C] transition-colors"
                    title="Edit match"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => { setSelectedMatch(match); setDeleteModal(true); }}
                    className="p-1.5 rounded text-[#64748B] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete match"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
        />
      )}
      {/* ── Schedule / Edit Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={selectedMatch ? 'Edit Match' : 'Schedule Match'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" />Saving…</span>
              ) : selectedMatch ? 'Update Match' : 'Schedule Match'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Inline form error */}
          {formError && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle size={14} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Tournament */}
          <Select
            label="Tournament *"
            options={[
              { value: '', label: '— Select tournament —' },
              ...tournaments.map(t => ({ value: String(t.id), label: t.name })),
            ]}
            value={form.tournamentId}
            onChange={e => { setForm(f => ({ ...f, tournamentId: e.target.value })); setFormError(''); }}
            fullWidth
          />

          {/* Teams side by side */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Home Team *"
              options={[
                { value: '', label: '— Home team —' },
                ...teamOptions,
              ]}
              value={form.homeTeamId}
              onChange={e => { setForm(f => ({ ...f, homeTeamId: e.target.value })); setFormError(''); }}
              fullWidth
            />
            <Select
              label="Away Team *"
              options={[
                { value: '', label: '— Away team —' },
                ...teamOptions,
              ]}
              value={form.awayTeamId}
              onChange={e => { setForm(f => ({ ...f, awayTeamId: e.target.value })); setFormError(''); }}
              fullWidth
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date *"
              type="date"
              value={form.matchDate}
              onChange={e => { setForm(f => ({ ...f, matchDate: e.target.value })); setFormError(''); }}
              fullWidth
            />
            <Input
              label="Time"
              type="time"
              value={form.matchTime}
              onChange={e => setForm(f => ({ ...f, matchTime: e.target.value }))}
              fullWidth
            />
          </div>

          {/* Venue + Round */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Venue"
              value={form.venue}
              onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
              placeholder="e.g. National Stadium"
              fullWidth
            />
            <Input
              label="Round"
              value={form.roundName}
              onChange={e => setForm(f => ({ ...f, roundName: e.target.value }))}
              placeholder="e.g. Round 1, Final"
              fullWidth
            />
          </div>

          {/* Status */}
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            fullWidth
          />

          {/* Score fields — shown for live or completed matches */}
          {(form.status === 'completed' || form.status === 'live') && (
            <div>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Score</p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Home Score"
                  type="number"
                  min="0"
                  value={form.homeScore}
                  onChange={e => setForm(f => ({ ...f, homeScore: e.target.value }))}
                  placeholder="0"
                  fullWidth
                />
                <Input
                  label="Away Score"
                  type="number"
                  min="0"
                  value={form.awayScore}
                  onChange={e => setForm(f => ({ ...f, awayScore: e.target.value }))}
                  placeholder="0"
                  fullWidth
                />
              </div>
              <p className="text-[10px] text-[#00C8F8] mt-1.5">Scores auto-update Results and Standings.</p>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={deleteModal}
        onClose={() => !deleting && setDeleteModal(false)}
        title="Delete Match"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModal(false)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" />Deleting…</span> : 'Yes, Delete'}
            </Button>
          </>
        }
      >
        <div className="text-sm text-[#94A3B8] space-y-3">
          <p>Are you sure you want to delete this match?</p>
          {selectedMatch && (
            <div className="px-4 py-3 rounded-xl bg-[#0D1F3C] border border-[#1E3A5C] text-center">
              <p className="text-white font-bold">
                {selectedMatch.homeTeamName}
                <span className="text-[#64748B] font-normal mx-2">vs</span>
                {selectedMatch.awayTeamName}
              </p>
              {selectedMatch.matchDate && (
                <p className="text-xs text-[#64748B] mt-1">{selectedMatch.matchDate} · {selectedMatch.roundName}</p>
              )}
            </div>
          )}
          <p className="text-xs text-red-400/80">This action cannot be undone and will remove any associated results.</p>
        </div>
      </Modal>
    </div>
  );
}
