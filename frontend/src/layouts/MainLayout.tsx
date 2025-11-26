import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useStructuredLogger } from '../logging/useStructuredLogger';
import { useAuth } from '../hooks/useAuth';

export interface MainNavLink {
  path: string;
  icon: string;
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
    (user && (user.fullName || user.name || user.displayName || user.email)) || 'Ikke pålogget';

  const initials = useMemo(() => {
    if (!user) return '--';
    const source = user.fullName || user.name || user.displayName || user.email || '';
    const parts = String(source).split('@')[0].split(' ');
    const letters = parts
      .filter((p: string) => p.trim().length > 0)
      .slice(0, 2)
      .map((p: string) => p.trim().charAt(0).toUpperCase());
    return letters.join('') || '--';
  }, [user]);

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    logEvent('navigation_change', {
      meta: {
        path: location.pathname,
      },
    });
  }, [location.pathname, logEvent]);

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
    <div className="min-h-screen bg-gradient-to-b from-brand-soft via-white to-slate-50 text-slate-900 flex flex-col dark:from-darkbg dark:via-slate-950 dark:to-darkbg dark:text-gray-100">
      <header className="w-full bg-transparent shadow-none sticky top-0 z-40 backdrop-blur-sm">
        <nav className="relative max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          {/* AVATAR + INFO */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 text-white flex items-center justify-center rounded-md font-bold dark:bg-slate-700">
              {isAuthenticated ? initials : '--'}
            </div>

            <div className="flex flex-col">
              <span className="font-medium truncate max-w-[160px]">{displayName}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isAuthenticated ? 'Pålogget' : 'Ikke pålogget'}
              </span>
            </div>

            <div className="hidden sm:flex flex-col pl-4 border-l border-slate-200 dark:border-slate-700 ml-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-brand-dark/80 dark:text-brand-soft/80">
                Restructuring
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Omstillingsveiviser
              </span>
            </div>
          </div>

          {/* HAMBURGER + ANCHOR */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 hover:text-brand-dark transition text-slate-900 dark:text-gray-100"
            >
              <span className="text-lg" aria-hidden>
                ☰
              </span>
              <span className="text-sm">Meny</span>
            </button>

            {/* DROPDOWN MENU */}
            {menuOpen && (
              <>
                {/* Bakgrunn for modal */}
                <div
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
                />

                {/* Selve menyboksen - én versjon, responsivt posisjonert */}
                <div
                  className="
                    absolute z-50 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700
                    bg-white dark:bg-slate-900
                    animate-[fadeInScale_0.18s_ease-out]

                    right-3 left-auto top-9 w-[75vw]

                    sm:right-0 sm:left-auto sm:top-10 sm:w-64
                  "
                >
                  {/* CARET / PIL */}
                  <div
                    className="
                      absolute w-4 h-4 rotate-45 border-l border-t
                      bg-white dark:bg-slate-900
                      border-gray-200 dark:border-slate-700
                      -top-2 right-6
                      sm:right-6
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
                            'hover:bg-slate-100 dark:hover:bg-slate-800',
                            isActive
                              ? 'font-semibold text-brand bg-brand-soft dark:text-brand-soft dark:bg-slate-800'
                              : 'text-slate-800 dark:text-gray-100',
                          ].join(' ')
                        }
                      >
                        <span aria-hidden>{link.icon}</span>
                        <span>{link.label}</span>
                      </NavLink>
                    ))}

                    {isAuthenticated && (
                      <>
                        <div className="mt-2 border-t border-gray-200 dark:border-slate-700 mx-4" />
                        <button
                          onClick={handleLogout}
                          className="mt-2 mx-4 w-[calc(100%-2rem)] flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
                        >
                          <span>⇦ Logg ut</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* SIDEINNHOLD */}
      <main className="flex-grow">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-brand dark:text-brand-soft">
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

/*
Legg denne i globals.css hvis den ikke eksisterer:

@keyframes fadeInScale {
  0%   { opacity: 0; transform: scale(0.94); }
  100% { opacity: 1; transform: scale(1); }
}
*/
