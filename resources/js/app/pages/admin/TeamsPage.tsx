import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Users, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Input, Select } from '@/app/components/ui/Input';
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

const sportOptionsForm = sportOptions.filter(o => o.value !== '');

function WinRateBar({ wins, losses, draws }: { wins: number; losses: number; draws: number }) {
  const total = wins + losses + draws;
  if (total === 0) return (
    <div className="h-1.5 rounded-full bg-[#1E3A5C] w-full" />
  );
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden w-full bg-[#1E3A5C]">
      <div style={{ width: `${(wins / total) * 100}%`, background: '#10B981' }} />
      <div style={{ width: `${(draws / total) * 100}%`, background: '#F59E0B' }} />
      <div style={{ width: `${(losses / total) * 100}%`, background: '#EF4444' }} />
    </div>
  );
}

// Match the EXACT shape Sequelize returns (camelCase keys)
interface ApiTeam {
  id: number;
  name: string;
  abbreviation: string;
  sport: string;
  coach: string;
  city: string;
  color: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  playerCount: number;
  tournamentId: number | null;
  // Sequelize also gives snake_case duplicates — accept both
  tournament_id?: number | null;
  player_count?: number;
}

interface ApiTournament {
  id: number;
  name: string;
}

const emptyForm = {
  name: '', abbreviation: '', sport: 'Soccer',
  coach: '', city: '', color: '#00C8F8',
  playerCount: '0',
  tournament_id: ''
};

type FormState = typeof emptyForm;

export default function TeamsPage() {
  const [teams, setTeams]             = useState<ApiTeam[]>([]);
  const [tournaments, setTournaments] = useState<ApiTournament[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);
  const [modalOpen, setModalOpen]     = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<ApiTeam | null>(null);
  const [form, setForm]               = useState<FormState>(emptyForm);

  // ── Fetch all teams from backend ───────────────────────────────────────────
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [teamsRes, tourRes] = await Promise.all([
        fetch(`${API}/teams`),
        fetch(`${API}/tournaments`)
      ]);
      if (!teamsRes.ok) throw new Error(`Server error ${teamsRes.status}`);
      const teamsJson = await teamsRes.json();
      const tourJson = await tourRes.json();
      setTeams(Array.isArray(teamsJson.data) ? teamsJson.data : []);
      setTournaments(Array.isArray(tourJson.data) ? tourJson.data.map((t: any) => ({ id: t.id, name: t.name })) : []);
    } catch (e: any) {
      setError(e.message ?? 'Could not connect to backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const tournamentOptions = [
    { value: '', label: 'None (Unassigned)' },
    ...tournaments.map(t => ({ value: String(t.id), label: t.name }))
  ];

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = teams.filter(t => {
    const q = search.toLowerCase();
    const matchQ = !q || [t.name, t.coach, t.city].some(v => (v ?? '').toLowerCase().includes(q));
    const matchS = !sportFilter || t.sport === sportFilter;
    return matchQ && matchS;
  });

  const { currentPage, totalPages, totalItems, itemsPerPage, paginated: pagedTeams, setPage } = usePagination(filtered, 9);

  // ── Open modals ───────────────────────────────────────────────────────────
  const openAdd = () => {
    setSelectedTeam(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (t: ApiTeam) => {
    setSelectedTeam(t);
    setForm({
      name:         t.name         ?? '',
      abbreviation: t.abbreviation ?? '',
      sport:        t.sport        ?? 'Soccer',
      coach:        t.coach        ?? '',
      city:         t.city         ?? '',
      color:        t.color        ?? '#00C8F8',
      playerCount:  String(t.playerCount ?? t.player_count ?? 0),
      tournament_id: t.tournamentId ? String(t.tournamentId) : (t.tournament_id ? String(t.tournament_id) : ''),
    });
    setModalOpen(true);
  };

  const openDelete = (t: ApiTeam) => {
    setSelectedTeam(t);
    setDeleteModal(true);
  };

  // ── Create / Update ───────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) {
      alert('Team name is required.');
      return;
    }
    setSaving(true);
    try {
      const url    = selectedTeam ? `${API}/teams/${selectedTeam.id}` : `${API}/teams`;
      const method = selectedTeam ? 'PUT' : 'POST';
      const body = {
        name:         form.name,
        abbreviation: form.abbreviation,
        sport:        form.sport,
        coach:        form.coach,
        city:         form.city,
        color:        form.color,
        playerCount:  parseInt(form.playerCount) || 0,
        tournamentId: form.tournament_id ? parseInt(form.tournament_id) : null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || `Failed: ${res.status}`);

      setModalOpen(false);
      await fetchTeams();
    } catch (e: any) {
      alert(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selectedTeam) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/teams/${selectedTeam.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || `Delete failed: ${res.status}`);
      }
      setDeleteModal(false);
      setSelectedTeam(null);
      await fetchTeams(); // Re-fetch from DB
    } catch (e: any) {
      alert(`Delete failed: ${e.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <LoadingSpinner size={32} />
      <p className="text-sm text-[#64748B]">Loading teams...</p>
    </div>
  );

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Teams</h1>
          <p className="text-sm text-[#64748B]">{teams.length} teams registered</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTeams}
            className="p-2 rounded-lg text-[#64748B] hover:text-white hover:bg-[#0D1F3C] transition-colors"
            title="Refresh list"
          >
            <RefreshCw size={16} />
          </button>
          <Button icon={<Plus size={15} />} onClick={openAdd} id="add-team-btn">New Team</Button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={fetchTeams} className="underline text-xs shrink-0">Retry</button>
        </div>
      )}

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by name, coach, or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search size={15} />}
              fullWidth
            />
          </div>
          <div className="w-40">
            <Select
              options={sportOptions}
              value={sportFilter}
              onChange={e => setSportFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <p className="text-xs text-[#64748B]">Showing {filtered.length} of {teams.length} teams</p>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {pagedTeams.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={<Users size={40} />}
              title="No teams found"
              description="Try adjusting your filters or add a new team"
              action={<Button size="sm" icon={<Plus size={14} />} onClick={openAdd}>Add Team</Button>}
            />
          </div>
        ) : (
          pagedTeams.map(team => (
            <div
              key={team.id}
              className="rounded-xl border border-[#1E3A5C] bg-[#0A1628] overflow-hidden hover:border-[#00C8F8]/40 transition-all duration-200"
            >
              {/* Color accent bar */}
              <div className="h-1.5 w-full" style={{ background: team.color || '#00C8F8' }} />

              <div className="p-5 flex flex-col gap-4">
                {/* Team header */}
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-base font-black shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${team.color || '#00C8F8'}30, ${team.color || '#00C8F8'}10)`,
                      border: `1px solid ${team.color || '#00C8F8'}40`,
                      color: team.color || '#00C8F8',
                    }}
                  >
                    {team.abbreviation || team.name.slice(0, 3).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">{team.name}</h3>
                    <p className="text-xs text-[#64748B] truncate">Coach: {team.coach || '—'}</p>
                    <p className="text-xs text-[#64748B]">{team.city || '—'} · {team.sport}</p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'W',   value: team.wins,   color: '#10B981' },
                    { label: 'D',   value: team.draws,  color: '#F59E0B' },
                    { label: 'L',   value: team.losses, color: '#EF4444' },
                    { label: 'PTS', value: team.points, color: '#00C8F8' },
                  ].map(s => (
                    <div key={s.label} className="text-center py-2 rounded-lg bg-[#0D1F3C]">
                      <div className="text-lg font-bold leading-none" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-[10px] text-[#64748B] font-medium mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Win rate */}
                <div>
                  <div className="flex justify-between text-xs text-[#64748B] mb-1.5">
                    <span>Win Rate</span>
                    <span>
                      {team.wins + team.losses + team.draws > 0
                        ? Math.round((team.wins / (team.wins + team.losses + team.draws)) * 100)
                        : 0}%
                    </span>
                  </div>
                  <WinRateBar wins={team.wins} losses={team.losses} draws={team.draws} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#1E3A5C]">
                  <Button
                    variant="secondary" size="sm"
                    icon={<Edit2 size={13} />}
                    onClick={() => openEdit(team)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <button
                    onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[#64748B] hover:text-white hover:bg-[#0D1F3C] transition-colors"
                  >
                    <Users size={12} />
                    {team.playerCount ?? team.player_count ?? 0}
                    {expandedTeam === team.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  <button
                    onClick={() => openDelete(team)}
                    className="p-1.5 rounded-lg text-[#64748B] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete team"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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

      {/* ── Add / Edit Modal ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={selectedTeam ? `Edit: ${selectedTeam.name}` : 'New Team'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : selectedTeam ? 'Save Changes' : 'Create Team'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Team Name *"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Manila Eagles"
                fullWidth
              />
            </div>
            <Input
              label="Abbreviation"
              value={form.abbreviation}
              onChange={e => setForm(f => ({ ...f, abbreviation: e.target.value }))}
              placeholder="e.g. MEA"
              fullWidth
            />
            <Select
              label="Sport"
              options={sportOptionsForm}
              value={form.sport}
              onChange={e => setForm(f => ({ ...f, sport: e.target.value }))}
              fullWidth
            />
            <Input
              label="Head Coach"
              value={form.coach}
              onChange={e => setForm(f => ({ ...f, coach: e.target.value }))}
              placeholder="Coach name"
              fullWidth
            />
            <Input
              label="City"
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              placeholder="e.g. Manila"
              fullWidth
            />
            <div className="col-span-2">
              <Select
                label="Tournament Allocation"
                options={tournamentOptions}
                value={form.tournament_id}
                onChange={e => setForm(f => ({ ...f, tournament_id: e.target.value }))}
                fullWidth
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Total Players"
                type="number"
                value={form.playerCount}
                onChange={e => setForm(f => ({ ...f, playerCount: e.target.value }))}
                placeholder="e.g. 11"
                fullWidth
              />
            </div>
          </div>

          {/* Team Color */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#94A3B8]">Team Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.color}
                onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                className="h-10 w-16 rounded-lg border border-[#1E3A5C] bg-transparent cursor-pointer"
              />
              <span className="text-sm text-[#64748B] font-mono">{form.color}</span>
              <div className="h-8 w-8 rounded-lg shrink-0" style={{ background: form.color }} />
            </div>
          </div>

          {/* Live Stats (read-only — auto-calculated from match results) */}
          {selectedTeam && (
            <div className="pt-4 border-t border-[#1E3A5C]">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Live Statistics <span className="normal-case font-normal text-[#475569]">(auto-updated from match results)</span></p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'W',   value: selectedTeam.wins,   color: '#10B981' },
                  { label: 'D',   value: selectedTeam.draws,  color: '#F59E0B' },
                  { label: 'L',   value: selectedTeam.losses, color: '#EF4444' },
                  { label: 'PTS', value: selectedTeam.points, color: '#00C8F8' },
                ].map(s => (
                  <div key={s.label} className="text-center py-2 rounded-lg bg-[#0D1F3C] border border-[#1E3A5C]">
                    <div className="text-lg font-bold leading-none" style={{ color: s.color }}>{s.value ?? 0}</div>
                    <div className="text-[10px] text-[#64748B] font-medium mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0D1F3C] border border-[#1E3A5C]">
                  <span className="text-xs text-[#64748B]">Goals For</span>
                  <span className="text-sm font-bold text-emerald-400">{selectedTeam.goalsFor ?? 0}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0D1F3C] border border-[#1E3A5C]">
                  <span className="text-xs text-[#64748B]">Goals Against</span>
                  <span className="text-sm font-bold text-red-400">{selectedTeam.goalsAgainst ?? 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={deleteModal}
        onClose={() => !deleting && setDeleteModal(false)}
        title="Delete Team"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModal(false)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-[#94A3B8]">
            Are you sure you want to permanently delete{' '}
            <span className="text-white font-semibold">"{selectedTeam?.name}"</span>?
          </p>
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
             This will permanently remove the team. This cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
