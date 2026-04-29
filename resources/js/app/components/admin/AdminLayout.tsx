import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router';
import {
  LayoutDashboard, Trophy, Users, Calendar, BarChart3,
  List, Menu, X, ChevronRight, Shield, LogOut
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

/** Returns true when viewport width >= 1024px (Tailwind's 'lg' breakpoint) */
function useIsLargeScreen() {
  const [isLg, setIsLg] = useState(() => window.innerWidth >= 1024);
  useEffect(() => {
    const handler = () => setIsLg(window.innerWidth >= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isLg;
}

interface NavItem { path: string; label: string; icon: React.ReactNode; }

const navItems: NavItem[] = [
  { path: '/admin',             label: 'Dashboard',   icon: <LayoutDashboard size={16} /> },
  { path: '/admin/tournaments', label: 'Tournaments',  icon: <Trophy size={16} /> },
  { path: '/admin/teams',       label: 'Teams',        icon: <Users size={16} /> },
  { path: '/admin/matches',     label: 'Matches',      icon: <Calendar size={16} /> },
  { path: '/admin/results',     label: 'Results',      icon: <BarChart3 size={16} /> },
  { path: '/admin/standings',   label: 'Standings',    icon: <List size={16} /> },
];

// ── Sidebar (standalone component so it never remounts on parent state change) ─
interface SidebarProps {
  sidebarOpen: boolean;
  onNavigate: () => void;
  onGoPublic: () => void;
  onLogout: () => void;
  user: { name?: string; email?: string; initials?: string } | null;
}

function Sidebar({ sidebarOpen, onNavigate, onGoPublic, onLogout, user }: SidebarProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Brand ─────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '18px 16px 16px',
        borderBottom: '1px solid #1E3A5C',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ position: 'relative', flexShrink: 0, height: '34px', width: '34px' }}>
          <img
            src="/images/logo.png"
            alt="VNTX Logo"
            style={{ height: '100%', width: '100%', objectFit: 'contain', borderRadius: '7px', display: 'block' }}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              const fb = img.nextElementSibling as HTMLElement | null;
              if (fb) fb.style.display = 'flex';
            }}
          />
          {/* Fallback gradient badge */}
          <div style={{
            display: 'none',
            position: 'absolute', inset: 0,
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #00C8F8 0%, #0066CC 100%)',
            borderRadius: '7px', color: '#fff', fontWeight: 800, fontSize: '10px',
          }}>
            VX
          </div>
        </div>

        {sidebarOpen && (
          <div style={{ lineHeight: 1 }}>
            <div style={{
              color: '#00C8F8', fontWeight: 700, fontSize: '14px',
              letterSpacing: '0.16em',
            }}>
              VNTX
            </div>
            <div style={{
              color: '#2A4E7A', fontWeight: 500, fontSize: '9px',
              letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px',
            }}>
              Admin Panel
            </div>
          </div>
        )}
      </div>

      {/* ── Nav items ──────────────────────────────────────────────────── */}
      <nav style={{
        flex: 1, overflowY: 'auto',
        padding: '14px 8px',
        display: 'flex', flexDirection: 'column', gap: '2px',
      }}>
        {sidebarOpen && (
          <p style={{
            padding: '0 8px 8px',
            fontSize: '9px', fontWeight: 600,
            color: '#2A4E7A',
            textTransform: 'uppercase', letterSpacing: '0.12em',
          }}>Navigation</p>
        )}

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            onClick={onNavigate}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: sidebarOpen ? '9px 10px' : '10px 12px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '12.5px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#00C8F8' : '#64748B',
              background: isActive ? 'rgba(0,200,248,0.08)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(0,200,248,0.2)' : 'transparent'}`,
              transition: 'all 0.15s ease',
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{
                  color: isActive ? '#00C8F8' : '#475569',
                  flexShrink: 0, display: 'flex', alignItems: 'center',
                }}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <>
                    <span style={{ flex: 1, color: isActive ? '#00C8F8' : '#94A3B8' }}>{item.label}</span>
                    {isActive && <ChevronRight size={11} style={{ color: '#00C8F8', flexShrink: 0 }} />}
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom section ─────────────────────────────────────────────── */}
      <div style={{
        padding: '10px 8px 14px',
        borderTop: '1px solid #1E3A5C',
        display: 'flex', flexDirection: 'column', gap: '4px',
        flexShrink: 0,
      }}>
        {/* Public site button */}
        <button
          onClick={onGoPublic}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: sidebarOpen ? '8px 10px' : '8px 12px',
            borderRadius: '8px',
            background: 'transparent', border: '1px solid transparent',
            cursor: 'pointer', color: '#475569',
            fontSize: '12px', fontWeight: 400,
            transition: 'all 0.15s ease', width: '100%',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = '#0D1F3C'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}
        >
          <Shield size={14} style={{ flexShrink: 0 }} />
          {sidebarOpen && <span>Public Site</span>}
        </button>

        {/* User row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px',
          borderRadius: '10px',
          background: '#0D1F3C',
          border: '1px solid #1E3A5C',
        }}>
          {/* Avatar */}
          <div style={{
            height: '30px', width: '30px', flexShrink: 0,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00C8F8 0%, #0066CC 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '10px',
          }}>
            {(user?.initials ?? user?.name?.[0] ?? 'A').toUpperCase()}
          </div>

          {sidebarOpen && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                color: '#fff', fontWeight: 600, fontSize: '12px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user?.name ?? 'Admin User'}
              </p>
              <p style={{
                color: '#475569', fontSize: '10px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user?.email ?? 'admin@vntx.com'}
              </p>
            </div>
          )}

          <button
            id="logout-btn"
            onClick={onLogout}
            title="Sign out"
            style={{
              padding: '4px', borderRadius: '6px',
              background: 'transparent', border: 'none',
              cursor: 'pointer', color: '#475569', flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Live clock ────────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = () => setTime(
      new Date().toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    );
    fmt();
    const id = setInterval(fmt, 30000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ color: '#475569', fontSize: '11px', fontWeight: 500 }}
      className="hidden sm:inline">
      {time}
    </span>
  );
}

// ── Single smart hamburger button ────────────────────────────────────────────
interface HamburgerBtnProps {
  isLg: boolean;
  sidebarOpen: boolean;
  onDesktopClick: () => void;
  onMobileClick: () => void;
}
function HamburgerBtn({ isLg, sidebarOpen, onDesktopClick, onMobileClick }: HamburgerBtnProps) {
  const icon = isLg && sidebarOpen ? <X size={16} /> : <Menu size={16} />;
  const handleClick = isLg ? onDesktopClick : onMobileClick;
  return (
    <button
      id="hamburger-btn"
      aria-label={isLg ? 'Toggle sidebar' : 'Open menu'}
      onClick={handleClick}
      style={{
        padding: '7px',
        borderRadius: '8px',
        background: 'transparent',
        border: '1px solid #1E3A5C',
        cursor: 'pointer',
        color: '#64748B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#00C8F8';
        e.currentTarget.style.color = '#00C8F8';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#1E3A5C';
        e.currentTarget.style.color = '#64748B';
      }}
    >
      {icon}
    </button>
  );
}

// ── Main AdminLayout ──────────────────────────────────────────────────────────
export default function AdminLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const [sidebarOpen,       setSidebarOpen]       = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const isLg = useIsLargeScreen();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleLogout  = () => { logout(); navigate('/login', { replace: true }); };
  const handlePublic  = () => navigate('/');
  const closeDrawer   = () => setMobileSidebarOpen(false);

  const sidebarProps: SidebarProps = {
    sidebarOpen,
    onNavigate: closeDrawer,
    onGoPublic: handlePublic,
    onLogout:   handleLogout,
    user,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#050B1A' }}>

      {/* ══ Desktop sidebar — always present on lg+ ═══════════════════════ */}
      <aside
        style={{
          width: sidebarOpen ? '220px' : '58px',
          minWidth: sidebarOpen ? '220px' : '58px',
          transition: 'width 0.22s ease, min-width 0.22s ease',
          background: '#0A1628',
          borderRight: '1px solid #1E3A5C',
          flexShrink: 0,
          overflow: 'hidden',
        }}
        className="hidden lg:block"
      >
        <Sidebar {...sidebarProps} />
      </aside>

      {/* ══ Mobile drawer overlay ═════════════════════════════════════════ */}
      {mobileSidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex',
          }}
          className="lg:hidden"
        >
          {/* Backdrop */}
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(5,11,26,0.80)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={closeDrawer}
          />
          {/* Drawer */}
          <aside style={{
            position: 'relative', zIndex: 10,
            width: '228px',
            background: '#0A1628',
            borderRight: '1px solid #1E3A5C',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Close button inside drawer */}
            <button
              onClick={closeDrawer}
              style={{
                position: 'absolute', top: '14px', right: '12px', zIndex: 11,
                padding: '4px', borderRadius: '6px',
                background: 'transparent', border: 'none',
                cursor: 'pointer', color: '#64748B',
              }}
            >
              <X size={16} />
            </button>
            <Sidebar {...sidebarProps} sidebarOpen={true} />
          </aside>
        </div>
      )}

      {/* ══ Main content area ════════════════════════════════════════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>

        {/* Top bar */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '0 20px', height: '52px', flexShrink: 0,
          background: '#0A1628', borderBottom: '1px solid #1E3A5C',
        }}>

          {/* ── Single hamburger — smart: collapses sidebar on desktop, opens drawer on mobile */}
          <HamburgerBtn
            isLg={isLg}
            sidebarOpen={sidebarOpen}
            onDesktopClick={() => setSidebarOpen(v => !v)}
            onMobileClick={() => setMobileSidebarOpen(true)}
          />

          {/* Right side */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LiveClock />
          </div>
        </header>

        <main
          id="main-content"
          className="admin-main"
          aria-label="Main content"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
