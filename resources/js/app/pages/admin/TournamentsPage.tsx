import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Trophy, Users, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Input, Select } from '@/app/components/ui/Input';
import { TournamentStatusBadge } from '@/app/components/ui/Badge';
import { Modal } from '@/app/components/ui/Modal';
import { EmptyState, LoadingSpinner } from '@/app/components/ui/StatCard';
import { Pagination, usePagination } from '@/app/components/ui/Pagination';

const API = 'http://localhost:5000/api';

const sportOptions = [
  { value: '', label: 'All Sports' },
  { value: 'Soccer', label: 'Soccer' },
  { value: 'Basketball', label: 'Basketball' },
  { value: 'Tennis', label: 'Tennis' },
  { value: 'Volleyball', label: 'Volleyball' },
  { value: 'Badminton', label: 'Badminton' },
  { value: 'Swimming', label: 'Swimming' },
];

export type TournamentStatus = 'Draft' | 'Upcoming' | 'In Progress' | 'Completed';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Upcoming', label: 'Upcoming' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
];

const statusColors: Record<TournamentStatus, string> = {
  'Draft': '#64748B',
  'Upcoming': '#00C8F8',
  'In Progress': '#10B981',
  'Completed': '#6366F1',
};

// Database enum to UI status mapping
const mapDbToUiStatus = (dbStatus: string): TournamentStatus => {
  switch (dbStatus) {
    case 'draft': return 'Draft';
    case 'upcoming': return 'Upcoming';
    case 'in_progress': return 'In Progress';
    case 'completed': return 'Completed';
    default: return 'Draft';
  }
};

// UI status to Database enum mapping
const mapUiToDbStatus = (uiStatus: TournamentStatus): string => {
  switch (uiStatus) {
    case 'Draft': return 'draft';
    case 'Upcoming': return 'upcoming';
    case 'In Progress': return 'in_progress';
    case 'Completed': return 'completed';
    default: return 'draft';
  }
};

interface ApiTournament {
  id: number;
  name: string;
  sport: string;
  format: string;
  status: string; // db type
  startDate: string;
  endDate: string;
  venue: string;
  description: string;
  teamCount: number;
  maxTeams: number;
  prizePool: string;
  organizer: string;
  // Fallbacks if snake_case is returned
  start_date?: string;
  end_date?: string;
  team_count?: number;
  max_teams?: number;
  prize_pool?: string;
}

const emptyForm = {
  name: '', sport: 'Soccer', format: 'Round Robin', status: 'Draft' as TournamentStatus,
  startDate: '', endDate: '', venue: '', description: '', maxTeams: '8', prizePool: '', organizer: '',
};

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<ApiTournament[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [error, setError]             = useState('');
  
  const [search, setSearch]           = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen]     = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<ApiTournament | null>(null);
  const [viewMode, setViewMode]       = useState<'grid' | 'list'>('grid');

  const [form, setForm]               = useState(emptyForm);

  // ── Fetch Tournaments ──────────────────────────────────────────────────────
  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/tournaments`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      setTournaments(Array.isArray(json.data) ? json.data : []);
    } catch (e: any) {
      setError(e.message ?? 'Could not connect to backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTournaments(); }, [fetchTournaments]);

  // ── Apply filters ──────────────────────────────────────────────────────────
  const filtered = tournaments.filter(t => {
    const uiStatus = mapDbToUiStatus(t.status);
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.sport.toLowerCase().includes(search.toLowerCase());
    const matchSport = !sportFilter || t.sport === sportFilter;
    const matchStatus = !statusFilter || uiStatus === statusFilter;
    return matchSearch && matchSport && matchStatus;
  });

  const { currentPage, totalPages, totalItems, itemsPerPage, paginated: pagedTournaments, setPage } = usePagination(filtered, 9);

  const openAdd = () => {
    setSelectedTournament(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (t: ApiTournament) => {
    setSelectedTournament(t);
    setForm({ 
      name: t.name ?? '', 
      sport: t.sport ?? 'Soccer', 
      format: t.format ?? 'Round Robin', 
      status: mapDbToUiStatus(t.status), 
      startDate: t.startDate ?? t.start_date ?? '', 
      endDate: t.endDate ?? t.end_date ?? '', 
      venue: t.venue ?? '', 
      description: t.description ?? '', 
      maxTeams: String(t.maxTeams ?? t.max_teams ?? 8), 
      prizePool: t.prizePool ?? t.prize_pool ?? '', 
      organizer: t.organizer ?? '' 
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert('Tournament name is required.');
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: form.name,
        sport: form.sport,
        format: form.format,
        status: mapUiToDbStatus(form.status),
        startDate: form.startDate,
        endDate: form.endDate,
        venue: form.venue,
        description: form.description,
        maxTeams: parseInt(form.maxTeams) || 8,
        teamCount: selectedTournament ? (selectedTournament.teamCount ?? selectedTournament.team_count ?? 0) : 0,
        prizePool: form.prizePool,
        organizer: form.organizer
      };

      const url = selectedTournament ? `${API}/tournaments/${selectedTournament.id}` : `${API}/tournaments`;
      const method = selectedTournament ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || `Failed: ${res.status}`);
      }

      setModalOpen(false);
      await fetchTournaments();
    } catch (error: any) {
      alert(`Save failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTournament) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/tournaments/${selectedTournament.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || 'Delete failed');
      }
      setDeleteModalOpen(false);
      setSelectedTournament(null);
      await fetchTournaments();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <LoadingSpinner size={32} />
      <p className="text-sm text-[#64748B]">Loading tournaments...</p>
    </div>
  );

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Tournaments</h1>
          <p className="text-sm text-[#64748B]">{tournaments.length} tournaments total</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTournaments}
            className="p-2 rounded-lg text-[#64748B] hover:text-white hover:bg-[#0D1F3C] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <Button icon={<Plus size={15} />} onClick={openAdd} id="add-tournament-btn">
            New Tournament
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={fetchTournaments} className="underline text-xs shrink-0">Retry</button>
        </div>
      )}

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search tournaments..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search size={15} />}
              fullWidth
            />
          </div>
          <div className="w-36">
            <Select options={sportOptions} value={sportFilter} onChange={e => setSportFilter(e.target.value)} placeholder="Sport" />
          </div>
          <div className="w-40">
            <Select options={statusOptions} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} placeholder="Status" />
          </div>
          <div className="flex border border-[#1E3A5C] rounded-lg overflow-hidden">
            <button
              className={`px-3 py-2 text-xs font-medium transition-colors ${viewMode === 'grid' ? 'bg-[#1E3A5C] text-white' : 'text-[#64748B] hover:text-white'}`}
              onClick={() => setViewMode('grid')}
            >Grid</button>
            <button
              className={`px-3 py-2 text-xs font-medium transition-colors ${viewMode === 'list' ? 'bg-[#1E3A5C] text-white' : 'text-[#64748B] hover:text-white'}`}
              onClick={() => setViewMode('list')}
            >List</button>
          </div>
        </div>
      </Card>

      <p className="text-xs text-[#64748B]">Showing {filtered.length} of {tournaments.length} tournaments</p>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  icon={<Trophy size={40} />}
                  title="No tournaments found"
                  description="Try adjusting your filters or add a new tournament"
                  action={<Button size="sm" icon={<Plus size={14} />} onClick={openAdd}>Add Tournament</Button>}
                />
              </div>
            ) : (
              pagedTournaments.map(t => {
              const uiStatus = mapDbToUiStatus(t.status);
              const maxT = t.maxTeams ?? t.max_teams ?? 8;
              const pPool = t.prizePool ?? t.prize_pool ?? '';
              const startDay = t.startDate ?? t.start_date ?? '';
              const tCount = Array.isArray(t.teams) ? t.teams.length : (t.team_count ?? t.teamCount ?? 0);
              return (
                <div
                  key={t.id}
                  className="rounded-xl border border-[#1E3A5C] bg-[#0A1628] overflow-hidden
                    hover:border-[#00C8F8]/40 transition-all duration-200 group"
                >
                  <div
                    className="h-1 w-full"
                    style={{ background: `linear-gradient(90deg, ${statusColors[uiStatus]}, transparent)` }}
                  />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2 group-hover:text-[#00C8F8] transition-colors" title={t.name}>
                          {t.name}
                        </h3>
                        <p className="text-xs text-[#64748B] mt-0.5">{t.sport} · {t.format}</p>
                      </div>
                      <TournamentStatusBadge status={uiStatus} />
                    </div>

                    <p className="text-xs text-[#94A3B8] line-clamp-2 mb-4 h-8">{t.description || "No description provided."}</p>

                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                      <div className="flex items-center gap-1.5 text-[#64748B]">
                        <Calendar size={12} className="text-[#00C8F8]" />
                        <span>{startDay || "TBD"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#64748B]">
                        <Users size={12} className="text-[#00C8F8]" />
                        <span>{tCount}/{maxT} teams</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#64748B] col-span-2">
                        <Trophy size={12} className="text-[#00C8F8]" />
                        <span>{pPool ? `${pPool} prize pool` : "No prize pool info"}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-[#64748B] mb-1">
                        <span>Teams filled</span>
                        <span>{Math.round((tCount / (maxT || 1)) * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-[#1E3A5C] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(tCount / (maxT || 1)) * 100}%`,
                            background: `linear-gradient(90deg, ${statusColors[uiStatus]}, ${statusColors[uiStatus]}99)`
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-[#1E3A5C]">
                      <Button variant="secondary" size="sm" icon={<Edit2 size={13} />} onClick={() => openEdit(t)} className="flex-1" disabled={saving || deleting}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost" size="sm" icon={<Trash2 size={13} />}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => { setSelectedTournament(t); setDeleteModalOpen(true); }}
                        disabled={saving || deleting}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          </div>
          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setPage} />
          )}
        </>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E3A5C]">
                  {['Tournament', 'Sport', 'Format', 'Dates', 'Teams', 'Prize Pool', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedTournaments.map((t, i) => {
                  const uiStatus = mapDbToUiStatus(t.status);
                  const tCount = Array.isArray(t.teams) ? t.teams.length : (t.team_count ?? t.teamCount ?? 0);
                  const maxT = t.maxTeams ?? t.max_teams ?? 8;
                  const pPool = t.prizePool ?? t.prize_pool ?? '';
                  const startD = t.startDate ?? t.start_date ?? '';
                  const endD = t.endDate ?? t.end_date ?? '';
                  
                  return (
                    <tr key={t.id} className={`border-b border-[#1E3A5C]/50 hover:bg-[#0D1F3C]/50 transition-colors ${i % 2 === 0 ? '' : 'bg-[#0D1F3C]/20'}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">{t.name}</p>
                          <p className="text-xs text-[#64748B]">{t.organizer || '—'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#94A3B8]">{t.sport}</td>
                      <td className="px-4 py-3 text-[#94A3B8]">{t.format}</td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">{startD} → {endD}</td>
                      <td className="px-4 py-3 text-[#94A3B8]">{tCount}/{maxT}</td>
                      <td className="px-4 py-3 text-[#94A3B8]">{pPool || '—'}</td>
                      <td className="px-4 py-3"><TournamentStatusBadge status={uiStatus} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(t)} className="p-1.5 rounded text-[#64748B] hover:text-[#00C8F8] hover:bg-[#0D1F3C] transition-colors" disabled={saving || deleting}>
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => { setSelectedTournament(t); setDeleteModalOpen(true); }}
                            className="p-1.5 rounded text-[#64748B] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            disabled={saving || deleting}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <EmptyState icon={<Trophy size={32} />} title="No tournaments found" description="Try adjusting your filters" />
            )}
          </div>
          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setPage} />
          )}
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={selectedTournament ? 'Edit Tournament' : 'New Tournament'}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : selectedTournament ? 'Update' : 'Create'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Tournament Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Champions Cup 2025" fullWidth required />
          <Select label="Sport" options={sportOptions.filter(o => o.value)} value={form.sport} onChange={e => setForm(f => ({ ...f, sport: e.target.value }))} fullWidth />
          <Select label="Format" options={[
            { value: 'Round Robin', label: 'Round Robin' },
            { value: 'Single Elimination', label: 'Single Elimination' },
            { value: 'Double Elimination', label: 'Double Elimination' },
            { value: 'Swiss System', label: 'Swiss System' },
          ]} value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))} fullWidth />
          <Select label="Status" options={statusOptions.filter(o => o.value)} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as TournamentStatus }))} fullWidth />
          <Input label="Start Date" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} fullWidth />
          <Input label="End Date" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} fullWidth />
          <Input label="Venue" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} placeholder="e.g. National Stadium" fullWidth />
          <Input label="Max Teams" type="number" min="2" value={form.maxTeams} onChange={e => setForm(f => ({ ...f, maxTeams: e.target.value }))} placeholder="e.g. 8" fullWidth />
          <Input label="Prize Pool" value={form.prizePool} onChange={e => setForm(f => ({ ...f, prizePool: e.target.value }))} placeholder="e.g. ₱500,000" fullWidth />
          <Input label="Organizer" value={form.organizer} onChange={e => setForm(f => ({ ...f, organizer: e.target.value }))} placeholder="e.g. VNTX Sports" fullWidth />
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-[#94A3B8] block mb-1.5">Description</label>
            <textarea
              className="w-full rounded-lg border border-[#1E3A5C] bg-[#0D1F3C] px-3 py-2.5 text-sm text-white
                placeholder:text-[#64748B] focus:outline-none focus:border-[#00C8F8] focus:ring-1 focus:ring-[#00C8F8]/30 resize-none"
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of the tournament..."
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title="Delete Tournament"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
          </>
        }
      >
        <p className="text-sm text-[#94A3B8]">
          Are you sure you want to permanently delete <span className="text-white font-semibold">"{selectedTournament?.name}"</span>?
          This action cannot be undone and will affect associated teams and matches.
        </p>
      </Modal>
    </div>
  );
}
