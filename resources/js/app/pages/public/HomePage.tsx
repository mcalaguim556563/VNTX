import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Trophy, Users, Calendar, ArrowRight, Zap, ChevronRight, Shield } from 'lucide-react';
import { MatchStatusBadge, TournamentStatusBadge } from '@/app/components/ui/Badge';
import { LoadingSpinner } from '@/app/components/ui/StatCard';

const API = 'http://localhost:5000/api';
const gradients = [
  'linear-gradient(135deg, #0066CC 0%, #00C8F8 100%)',
  'linear-gradient(135deg, #10B981 0%, #0066CC 100%)',
  'linear-gradient(135deg, #7C3AED 0%, #0066CC 100%)',
];

export default function HomePage() {
  const [activeTournaments, setActiveTournaments] = useState<any[]>([]);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [featuredTournaments, setFeaturedTournaments] = useState<any[]>([]);
  const [totalTeams, setTotalTeams] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [tourRes, matchesRes, teamsRes] = await Promise.all([
          fetch(`${API}/tournaments`),
          fetch(`${API}/matches`),
          fetch(`${API}/teams`),
        ]);
        const tourData  = await tourRes.json().catch(() => ({ data: [] }));
        const matchData = await matchesRes.json().catch(() => ({ data: [] }));
        const teamData  = await teamsRes.json().catch(() => ({ data: [] }));

        const safeTournaments = Array.isArray(tourData.data)  ? tourData.data  : [];
        const safeMatches     = Array.isArray(matchData.data) ? matchData.data : [];
        const safeTeams       = Array.isArray(teamData.data)  ? teamData.data  : [];

        const mappedTours = safeTournaments.map((t: any) => ({
          ...t,
          status: t.status === 'in_progress' ? 'In Progress'
                : t.status === 'upcoming'    ? 'Upcoming'
                : t.status === 'completed'   ? 'Completed' : 'Draft',
          startDate: t.start_date ?? t.startDate,
          teamCount: Array.isArray(t.teams) ? t.teams.length : (t.team_count ?? t.teamCount ?? 0),
          maxTeams: t.max_teams ?? t.maxTeams,
        }));

        const active = mappedTours.filter((t: any) => t.status === 'In Progress' || t.status === 'Upcoming');
        setActiveTournaments(active);
        setFeaturedTournaments(active.slice(0, 3));
        setTotalTeams(safeTeams.length);
        setTotalMatches(safeMatches.length);

        setLiveMatches(safeMatches.filter((m: any) => m.status === 'live').map((m: any) => ({ ...m, status: 'Live' })));
        setUpcomingMatches(
          safeMatches.filter((m: any) => m.status === 'scheduled')
            .map((m: any) => ({
              ...m,
              status: 'Scheduled',
              matchDate: m.matchDate ?? m.match_date ?? '',
              matchTime: m.matchTime ?? m.match_time ?? '',
              homeTeamName: m.homeTeamName ?? m.home_team_name ?? 'TBD',
              awayTeamName: m.awayTeamName ?? m.away_team_name ?? 'TBD',
              roundName: m.roundName ?? m.round_name ?? '',
              venue: m.venue ?? '',
            }))
            .sort((a: any, b: any) => {
              const da = a.matchDate ? new Date(a.matchDate).getTime() : 0;
              const db = b.matchDate ? new Date(b.matchDate).getTime() : 0;
              return da - db;
            })
            .slice(0, 5)
        );
      } catch (e) {
        console.error('Failed to fetch public api data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-900)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner size={40} />
    </div>
  );

  return (
    <div style={{ background: 'var(--navy-900)', minHeight: '100vh' }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section aria-label="Hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,102,204,0.18) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 40% at 85% 20%, rgba(0,200,248,0.08) 0%, transparent 60%)' }} />
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.025 }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-grid" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#00C8F8" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>

        <div className="hero-content" style={{ position: 'relative' }}>
          {liveMatches.length > 0 && (
            <div role="status" aria-live="polite" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', borderRadius: '999px', marginBottom: '24px',
              border: '1px solid rgba(0,200,248,0.3)', background: 'rgba(0,200,248,0.06)',
            }}>
              <span aria-hidden="true" style={{ height: '8px', width: '8px', borderRadius: '50%', background: '#10B981', flexShrink: 0, animation: 'pulseAccent 2s infinite' }} />
              <span style={{ color: '#00C8F8', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {liveMatches.length} Live {liveMatches.length === 1 ? 'Match' : 'Matches'}
              </span>
            </div>
          )}

          <h1 className="hero-title">
            The Future of <span className="gradient-text">Sports</span>
            <br />Tournament Management
          </h1>

          <div className="cta-row">
            <Link to="/tournaments" className="vntx-btn-primary"
              style={{ padding: '0 28px', fontSize: '14px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,200,248,0.3)' }}
              aria-label="Browse all tournaments">
              <Trophy size={16} aria-hidden="true" /> View Tournaments
            </Link>
            <Link to="/matches" className="vntx-btn-ghost"
              style={{ padding: '0 28px', fontSize: '14px', borderRadius: '12px' }}
              aria-label="See match schedule">
              <Calendar size={16} aria-hidden="true" /> Match Schedule
            </Link>
          </div>

          <div className="stat-row" role="region" aria-label="Platform statistics">
            {[
              { label: 'Active Tournaments', value: activeTournaments.length, icon: <Trophy size={16} />,  color: '#00C8F8' },
              { label: 'Registered Teams',   value: totalTeams,               icon: <Users size={16} />,   color: '#00C8F8' },
              { label: 'Total Matches',      value: totalMatches,             icon: <Calendar size={16} />, color: '#00C8F8' },
              { label: 'Live Now',           value: liveMatches.length,       icon: <Zap size={16} />,      color: '#10B981' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40px', width: '40px', borderRadius: '10px', flexShrink: 0, background: `${s.color}18`, color: s.color }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '3px', fontWeight: 500 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE MATCHES ─────────────────────────────────────────── */}
      {liveMatches.length > 0 && (
        <section aria-label="Live matches" style={{ borderTop: '1px solid #1E3A5C', padding: 'var(--sp-20) 0' }}>
          <div className="section-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
              <span aria-hidden="true" style={{ height: '10px', width: '10px', borderRadius: '50%', background: '#10B981', animation: 'pulseAccent 2s infinite' }} />
              <h2 className="section-title">Live Now</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {liveMatches.map(match => (
                <article key={match.id} aria-label={`Live: ${match.homeTeamName} vs ${match.awayTeamName}`}
                  style={{ borderRadius: '14px', padding: '20px', background: 'var(--navy-800)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <MatchStatusBadge status={match.status} />
                    <span style={{ fontSize: '11px', color: '#64748B' }}>{match.roundName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', flex: 1, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.homeTeamName}</p>
                    <div style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 800, color: '#00C8F8', padding: '0 12px', flexShrink: 0 }}>{match.homeScore} – {match.awayScore}</div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.awayTeamName}</p>
                  </div>
                  {match.venue && <p style={{ fontSize: '11px', textAlign: 'center', color: '#64748B', marginTop: '12px' }}>{match.venue}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED TOURNAMENTS ─────────────────────────────────── */}
      <section aria-label="Featured tournaments" style={{ borderTop: '1px solid #1E3A5C', padding: 'var(--sp-20) 0' }}>
        <div className="section-inner">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h2 className="section-title">Featured Tournaments</h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>Active and upcoming championships</p>
            </div>
            <Link to="/tournaments" aria-label="See all tournaments"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#00C8F8', fontWeight: 600, textDecoration: 'none', minHeight: '32px' }}>
              See all <ChevronRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {featuredTournaments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 20px', borderRadius: '16px', border: '1px solid #1E3A5C', background: '#0A1628' }}>
              <Trophy size={36} aria-hidden="true" style={{ color: '#1E3A5C', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: '14px', color: '#64748B' }}>No active tournaments yet</p>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '12px', color: '#00C8F8', fontWeight: 600, textDecoration: 'none' }}>
                <Shield size={12} aria-hidden="true" /> Admin Login
              </Link>
            </div>
          ) : (
            <div className="grid-auto-lg">
              {featuredTournaments.map((t, i) => (
                <Link key={t.id} to={`/tournaments/${t.id}`} aria-label={`${t.name} — ${t.status}`}
                  style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #1E3A5C', background: '#0A1628', textDecoration: 'none', display: 'block', transition: 'box-shadow 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,200,248,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                >
                  <div style={{ height: '80px', background: gradients[i % gradients.length], position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <Trophy size={44} aria-hidden="true" style={{ opacity: 0.1, color: '#fff' }} />
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}><TournamentStatusBadge status={t.status} /></div>
                    <div style={{ position: 'absolute', bottom: '8px', left: '12px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)' }}>{t.sport}</div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '14px', lineHeight: 1.3, marginBottom: '6px' }}>{t.name}</h3>
                    <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>{t.format}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}>
                        <Users size={11} aria-hidden="true" />
                        <strong style={{ color: '#94A3B8' }}>{t.teamCount}</strong>/{t.maxTeams} teams
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00C8F8', fontWeight: 600 }}>
                        View <ArrowRight size={11} aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── UPCOMING MATCHES ─────────────────────────────────────── */}
      <section aria-label="Upcoming matches" style={{ borderTop: '1px solid #1E3A5C', padding: 'var(--sp-20) 0' }}>
        <div className="section-inner">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h2 className="section-title">Upcoming Matches</h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>Next scheduled fixtures</p>
            </div>
            <Link to="/matches" aria-label="View full match schedule"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#00C8F8', fontWeight: 600, textDecoration: 'none', minHeight: '32px' }}>
              Full schedule <ChevronRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {upcomingMatches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 20px', borderRadius: '16px', border: '1px solid #1E3A5C', background: '#0A1628' }}>
              <Calendar size={36} aria-hidden="true" style={{ color: '#1E3A5C', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: '14px', color: '#64748B' }}>No upcoming matches scheduled yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingMatches.map(match => {
                const parts = (match.matchDate || '').split('-');
                const day   = parts[2] || '—';
                const month = match.matchDate ? new Date(match.matchDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' }) : '';
                return (
                  <article key={match.id} className="match-row"
                    aria-label={`${match.homeTeamName} vs ${match.awayTeamName}${match.matchDate ? ' on ' + match.matchDate : ''}`}>
                    <div style={{ textAlign: 'center', flexShrink: 0, minWidth: '40px' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{day}</div>
                      <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px', fontWeight: 600, textTransform: 'uppercase' }}>{month}</div>
                    </div>
                    <div style={{ width: '1px', height: '36px', background: '#1E3A5C', flexShrink: 0 }} aria-hidden="true" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {match.homeTeamName}<span style={{ color: '#475569', fontWeight: 400, margin: '0 6px' }}>vs</span>{match.awayTeamName}
                      </p>
                      <p style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {[match.venue, match.roundName].filter(Boolean).join(' · ') || 'Schedule pending'}
                      </p>
                    </div>
                    <MatchStatusBadge status={match.status} />
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
