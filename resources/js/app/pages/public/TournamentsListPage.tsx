import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Trophy, Users, Calendar, Search, ArrowRight, Filter } from 'lucide-react';
import { TournamentStatusBadge } from '@/app/components/ui/Badge';
import { Input, Select } from '@/app/components/ui/Input';
import { EmptyState, LoadingSpinner } from '@/app/components/ui/StatCard';

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

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'Upcoming', label: 'Upcoming' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
];

const gradients = [
  'from-[#0066CC] to-[#00C8F8]',
  'from-[#10B981] to-[#0066CC]',
  'from-[#7C3AED] to-[#0066CC]',
  'from-[#F59E0B] to-[#EF4444]',
  'from-[#EC4899] to-[#7C3AED]',
  'from-[#06B6D4] to-[#10B981]',
];

export default function TournamentsListPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${API}/tournaments`);
        const json = await res.json();
        const safeData = Array.isArray(json.data) ? json.data : [];
        const mapped = safeData.map((t: any) => ({
          ...t,
          status: t.status === 'in_progress' ? 'In Progress' : (t.status === 'upcoming' ? 'Upcoming' : (t.status === 'completed' ? 'Completed' : 'Draft')),
          startDate: t.start_date ?? t.startDate,
          teamCount: Array.isArray(t.teams)
            ? t.teams.length
            : (t.team_count ?? t.teamCount ?? 0),
          maxTeams: t.max_teams ?? t.maxTeams,
        }));
        // Filter out Draft status from public view
        setTournaments(mapped.filter((t: any) => t.status !== 'Draft'));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = tournaments.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.sport.toLowerCase().includes(search.toLowerCase());
    const matchSport = !sportFilter || t.sport === sportFilter;
    const matchStatus = !statusFilter || t.status === statusFilter;
    return matchSearch && matchSport && matchStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050B1A] flex items-center justify-center">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050B1A]">
      {/* Page Header */}
      <div className="border-b border-[#1E3A5C] bg-[#0A1628] py-10">
        <div className="w-full px-10 sm:px-16 lg:px-24">
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-3">
            <Link to="/" className="hover:text-[#00C8F8] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#94A3B8]">Tournaments</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Tournaments</h1>
          <p className="text-[#94A3B8]">Browse all active, upcoming, and completed tournaments</p>
        </div>
      </div>

      <div className="w-full px-10 sm:px-16 lg:px-24 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex-1 min-w-[220px]">
            <Input
              placeholder="Search tournaments..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search size={15} />}
              fullWidth
            />
          </div>
          <div className="w-36">
            <Select options={sportOptions} value={sportFilter} onChange={e => setSportFilter(e.target.value)} />
          </div>
          <div className="w-40">
            <Select options={statusOptions} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} />
          </div>
        </div>

        <p className="text-xs text-[#64748B] mb-4">
          Showing {filtered.length} of {tournaments.length} tournaments
        </p>

        {/* Tournament Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Trophy size={40} />}
            title="No tournaments found"
            description="Try adjusting your search or filters"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((t, i) => (
              <Link
                key={t.id}
                to={`/tournaments/${t.id}`}
                className="group rounded-xl border border-[#1E3A5C] bg-[#0A1628] overflow-hidden hover:border-[#00C8F8]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C8F8]/10"
              >
                {/* Gradient Banner */}
                <div className={`h-20 bg-gradient-to-r ${gradients[i % gradients.length]} relative overflow-hidden`}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Trophy size={80} />
                  </div>
                  <div className="absolute inset-0 bg-[#050B1A]/20" />
                  <div className="absolute top-3 left-3">
                    <TournamentStatusBadge status={t.status} />
                  </div>
                  <div className="absolute bottom-2 right-3 text-white/60 text-xs font-bold tracking-widest uppercase">
                    {t.sport}
                  </div>
                </div>

                <div className="p-5">
                  <h2 className="font-bold text-white group-hover:text-[#00C8F8] transition-colors leading-tight mb-1">
                    {t.name}
                  </h2>
                  <p className="text-xs text-[#64748B] mb-3">{t.format} · {t.venue}</p>
                  <p className="text-sm text-[#94A3B8] line-clamp-2 mb-5">{t.description}</p>

                  <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-y border-[#1E3A5C]">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{t.teamCount}</div>
                      <div className="text-[10px] text-[#64748B]">Teams</div>
                    </div>
                    <div className="text-center border-x border-[#1E3A5C]">
                      <div className="text-sm font-bold text-white truncate">{t.prizePool}</div>
                      <div className="text-[10px] text-[#64748B]">Prize</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-[#00C8F8] truncate">{t.organizer.split(' ')[0]}</div>
                      <div className="text-[10px] text-[#64748B]">Organizer</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex gap-2 text-[#64748B]">
                      <span className="flex items-center gap-1"><Calendar size={10} />{t.startDate}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[#00C8F8] font-medium">
                      View Details <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
