import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router';
import { Menu, X, Trophy, Home, Calendar, List, ChevronRight, Shield } from 'lucide-react';

const navItems = [
  { path: '/',            label: 'Home',       icon: <Home size={14} /> },
  { path: '/tournaments', label: 'Tournaments', icon: <Trophy size={14} /> },
  { path: '/matches',     label: 'Matches',     icon: <Calendar size={14} /> },
  { path: '/standings',   label: 'Standings',   icon: <List size={14} /> },
];

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '12.5px',
    fontWeight: isActive ? 600 : 400,
    color: isActive ? '#00C8F8' : '#94A3B8',
    background: isActive ? 'rgba(0,200,248,0.08)' : 'transparent',
    border: isActive ? '1px solid rgba(0,200,248,0.18)' : '1px solid transparent',
    transition: 'all 0.15s ease',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#050B1A' }}>
      {/* Skip to main content — accessibility */}
      <a href="#main-content" className="skip-nav">Skip to main content</a>

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: scrolled ? 'rgba(10,22,40,0.95)' : '#0A1628',
        borderBottom: '1px solid #1E3A5C',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'background 0.25s ease, box-shadow 0.25s ease',
        boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.4)' : 'none',
      }}>
        <div className="public-nav-inner">

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ position: 'relative', height: '34px', width: '34px', flexShrink: 0 }}>
              <img src="/images/logo.png" alt="VNTX"
                style={{ height: '100%', width: '100%', objectFit: 'contain', borderRadius: '7px' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const fb = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                  if (fb) fb.style.display = 'flex';
                }}
              />
              <div style={{
                display: 'none', position: 'absolute', inset: 0,
                alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #00C8F8, #0066CC)',
                borderRadius: '7px', color: '#fff', fontWeight: 800, fontSize: '10px',
              }}>VX</div>
            </div>
            <span style={{ color: '#00C8F8', fontWeight: 700, fontSize: '15px', letterSpacing: '0.15em' }}>
              VNTX
            </span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '16px' }} className="hidden md:flex">
            {navItems.map(item => (
              <NavLink key={item.path} to={item.path} end={item.path === '/'}
                style={({ isActive }) => navLinkStyle(isActive)}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Admin CTA */}
          <Link to="/login" className="hidden sm:flex" style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '8px 16px',
            borderRadius: '8px',
            background: '#00C8F8',
            color: '#050B1A',
            fontWeight: 600, fontSize: '12.5px',
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(0,200,248,0.3)',
            transition: 'all 0.15s ease',
          }}>
            <Shield size={13} />
            Admin
          </Link>

          {/* Mobile toggle */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            style={{ padding: '7px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}>
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav aria-label="Mobile navigation" className="md:hidden" style={{ borderTop: '1px solid #1E3A5C', background: '#0A1628', padding: '10px 16px 14px' }}>
            {navItems.map(item => (
              <NavLink key={item.path} to={item.path} end={item.path === '/'}
                style={({ isActive }) => ({
                  ...navLinkStyle(isActive),
                  display: 'flex', justifyContent: 'space-between',
                  marginBottom: '4px',
                })}
                onClick={() => setMobileOpen(false)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{item.icon} {item.label}</span>
                <ChevronRight size={13} style={{ color: '#475569' }} />
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main id="main-content" style={{ flex: 1 }} role="main">
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ background: '#0A1628', borderTop: '1px solid #1E3A5C', padding: '24px 32px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#00C8F8', fontWeight: 700, fontSize: '14px', letterSpacing: '0.15em' }}>VNTX</span>
            <span style={{ color: '#2A4E7A', fontSize: '11px', fontWeight: 500 }}>Sports Tournament Management System</span>
          </div>
          <p style={{ color: '#2A4E7A', fontSize: '11px', fontWeight: 400 }}>© 2025 VNTX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
