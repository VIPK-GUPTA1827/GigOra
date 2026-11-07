import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, Eye, ArrowRightLeft } from 'lucide-react';
import Avatar from '../ui/Avatar';

// Sets the browser tab title per page (fixes "Create Account — GigOra" on dashboards).
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · GigOra` : 'GigOra';
  }, [title]);
}

function NavItem({ item, variant }) {
  const Icon = item.icon;
  const base = variant === 'side'
    ? 'flex items-center gap-3 w-full min-h-11 px-3 rounded-lg text-sm font-medium transition'
    : 'flex flex-col items-center justify-center gap-0.5 flex-1 min-h-11 text-[11px] font-medium';
  const state = item.active
    ? (variant === 'side' ? 'bg-white/10 text-white' : 'text-accent-text')
    : (variant === 'side' ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-muted');
  const content = (
    <>
      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{item.label}</span>
    </>
  );
  const cls = `${base} ${state}`;
  const aria = item.active ? { 'aria-current': 'page' } : {};
  if (item.to) {
    return <Link to={item.to} className={cls} {...aria}>{content}</Link>;
  }
  return (
    <button type="button" onClick={item.onClick} className={`${cls} cursor-pointer`} {...aria}>
      {content}
    </button>
  );
}

export default function DashboardLayout({
  title,
  role,
  user,
  nav = [],
  onSwitchRole,
  switching = false,
  onLogout,
  headerRight,
  sidebarFooter,
  children,
}) {
  usePageTitle(title);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the user menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const displayName = user?.companyName || user?.name || user?.username || 'Account';
  const otherView = role === 'client' ? 'Freelancer view' : 'Client view';
  const roleLabel = role === 'client' ? 'Client workspace' : 'Freelancer studio';

  return (
    <div className="min-h-screen bg-page text-ink font-sans">
      {/* Desktop sidebar (navy). Hidden on mobile. */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col bg-navy text-white p-4 z-40">
        <Link to="/" className="flex items-center gap-2 px-2 py-2 min-h-11">
          <span className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-sm">G</span>
          <span className="font-semibold tracking-tight">GigOra</span>
        </Link>
        <p className="px-2 mt-1 mb-4 text-xs text-slate-400">{roleLabel}</p>
        <nav aria-label="Main" className="flex flex-col gap-1">
          {nav.map((item) => <NavItem key={item.key} item={item} variant="side" />)}
        </nav>
        {sidebarFooter && (
          <div className="mt-auto pt-4 border-t border-white/10 text-xs text-slate-300">
            {sidebarFooter}
          </div>
        )}
      </aside>

      <div className="md:pl-60 flex flex-col min-h-screen">
        {/* Slim top header: title, bell, one user menu. */}
        <header className="sticky top-0 z-30 bg-surface border-b border-border">
          <div className="h-14 px-4 sm:px-6 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink md:hidden">GigOra</p>
            <p className="hidden md:block text-sm text-muted">{title}</p>
            <div className="flex items-center gap-2">
              {headerRight}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="flex items-center gap-2 min-h-11 pl-1 pr-2 rounded-lg hover:bg-page cursor-pointer"
                >
                  <Avatar src={user?.avatar} name={displayName} size={32} />
                  <span className="hidden sm:inline text-sm font-medium text-ink max-w-[10rem] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted" aria-hidden="true" />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-1 w-56 bg-surface border border-border rounded-lg p-1 animate-fade-up shadow-md"
                  >
                    <button
                      role="menuitem"
                      type="button"
                      disabled={switching}
                      onClick={() => { setMenuOpen(false); if (onSwitchRole) onSwitchRole(); }}
                      className="flex items-center gap-2 w-full min-h-11 px-3 rounded-lg text-sm text-ink hover:bg-page disabled:opacity-50 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-4 h-4 text-muted" aria-hidden="true" />
                      {switching ? 'Switching...' : `Switch to ${otherView}`}
                    </button>
                    <Link
                      role="menuitem"
                      to="/profile/me"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 w-full min-h-11 px-3 rounded-lg text-sm text-ink hover:bg-page"
                    >
                      <Eye className="w-4 h-4 text-muted" aria-hidden="true" />
                      View public profile
                    </Link>
                    <div className="my-1 border-t border-border" />
                    <button
                      role="menuitem"
                      type="button"
                      onClick={() => { setMenuOpen(false); if (onLogout) onLogout(); }}
                      className="flex items-center gap-2 w-full min-h-11 px-3 rounded-lg text-sm text-rose-700 hover:bg-rose-50 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-10 space-y-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar (replaces the sidebar under md). */}
      <nav aria-label="Main" className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border flex">
        {nav.slice(0, 5).map((item) => (
          <NavItem key={item.key} item={item} variant="bottom" />
        ))}
      </nav>
    </div>
  );
}
