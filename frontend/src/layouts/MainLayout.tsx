import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useStructuredLogger } from '@/logging/useStructuredLogger';
import { useAuth } from '@/hooks/useAuth';

export interface MainNavLink {
  path: string;
  icon?: string;
  label: string;
}

interface MainLayoutProps {
  navLinks: MainNavLink[];
}

export default function MainLayout({ navLinks }: MainLayoutProps) {
  const location = useLocation();
  const { logEvent } = useStructuredLogger('MainLayout');

  const auth = useAuth();
  const user = auth?.user;
  const isAuthenticated = !!user;

  const displayName: string =
    (user && (user.fullName || user.name || user.displayName || user.email)) ||
    'Ikke pålogget';

  const initials = useMemo(() => {
    if (!user) return '--';
    const source =
      user.fullName || user.name || user.displayName || user.email || '';
    const parts = String(source).split('@')[0].split(' ');
    const letters = parts
      .filter((p: string) => p.trim().length > 0)
      .slice(0, 2)
      .map((p: string) => p.trim().charAt(0).toUpperCase());
    return letters.join('') || '--';
  }, [user]);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    logEvent('navigation_change', {
      meta: { path: location.pathname },
    });
  }, [location.pathname, logEvent]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuPanelRef.current?.contains(target) ||
        menuButtonRef.current?.contains(target)
      ) {
        return;
      }
      setMenuOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  const effectiveNavLinks = navLinks.filter((link) => {
    if (!isAuthenticated) return true;
    if (link.path === '/login' || link.path === '/register') return false;
    return true;
  });

  const handleLogout = () => {
    auth?.logout?.();
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-soft via-white to-slate-50 text-slate-900 flex flex-col">
      {/* HEADER */}
      <header className="w-full sticky top-0 z-40 backdrop-blur-xl bg-white/95 border-b border-slate-200 shadow-sm">
        <nav className="relative max-w-5xl mx-auto flex items-center justify-between px-4 py-3 text-slate-900">
          {/* AVATAR + INFO */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 text-white flex items-center justify-center rounded-md font-bold">
              {isAuthenticated ? initials : '--'}
            </div>
            <div className="flex flex-col">
              <span className="font-medium truncate max-w-[160px]">{displayName}</span>
              <span className="text-xs text-slate-600">
                {isAuthenticated ? 'Pålogget' : 'Ikke pålogget'}
              </span>
            </div>
            <div className="hidden sm:flex flex-col pl-4 border-l border-slate-200 ml-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-emerald-800">
                Restructuring
              </span>
              <span className="text-sm font-semibold text-slate-900">
                Omstillingsveiviser
              </span>
            </div>
          </div>

          {/* LOGG UT + HAMBURGER */}
          <div className="relative flex items-center gap-4">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-sm text-red-700 hover:text-red-800 font-medium"
              >
                Logg ut
              </button>
            )}

            <button
              ref={menuButtonRef}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 hover:text-emerald-800 transition text-slate-900"
              aria-expanded={menuOpen}
              aria-label="Åpne meny"
            >
              <span className="text-lg">☰</span>
              <span className="text-sm">Meny</span>
            </button>

            {menuOpen && (
              <>
                <div
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
                />
                <div
                  ref={menuPanelRef}
                  className="
                    absolute z-50 rounded-xl shadow-xl border border-slate-200
                    bg-white
                    right-3 left-auto top-9 w-[75vw]
                    sm:right-0 sm:left-auto sm:top-10 sm:w-64
                  "
                >
                  <div
                    className="
                      absolute w-4 h-4 rotate-45 border-l border-t
                      bg-white border-slate-200
                      -top-2 right-6
                    "
                  />

                  <div className="py-3">
                    {effectiveNavLinks.map((link) => (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          [
                            'flex items-center gap-2 px-4 py-2 text-sm transition rounded-lg',
                            'hover:bg-slate-100',
                            isActive
                              ? 'font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200'
                              : 'text-slate-800',
                          ].join(' ')
                        }
                      >
                        {link.icon && <span aria-hidden="true">{link.icon}</span>}
                        <span>{link.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* CONTENT */}
      <main className="flex-grow">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-emerald-700">
              Laster inn side ...
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
