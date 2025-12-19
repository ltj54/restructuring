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

interface NavSection {
  title: string;
  items: MainNavLink[];
}

function useNavSections(navLinks: MainNavLink[], isAuthenticated: boolean): NavSection[] {
  const hovedmeny = [
    navLinks.find((l) => l.path === '/'),
    navLinks.find((l) => l.path === '/wizard'),
    navLinks.find((l) => l.path === '/plan'),
    navLinks.find((l) => l.path === '/resources'),
    navLinks.find((l) => l.path === '/journal'),
    navLinks.find((l) => l.path === '/insurance'),
    navLinks.find((l) => l.path === '/purchase'),
  ].filter(Boolean) as MainNavLink[];

  const system = [
    navLinks.find((l) => l.path === '/systeminfo'),
    navLinks.find((l) => l.path === '/last-ned'),
  ].filter(Boolean) as MainNavLink[];

  const profileLink = navLinks.find((l) => l.path === '/me');
  const authLinks = navLinks.filter((l) => ['/login', '/register'].includes(l.path));

  const sections: NavSection[] = [
    { title: 'HOVEDMENY', items: hovedmeny },
    { title: 'SYSTEM', items: system },
  ];

  if (isAuthenticated && profileLink) {
    sections.push({ title: 'PROFIL', items: [profileLink] });
  }

  if (!isAuthenticated) {
    sections.push({ title: 'AUTENTISERING', items: authLinks });
  }

  return sections;
}

export default function MainLayout({ navLinks }: MainLayoutProps) {
  const location = useLocation();
  const { logEvent } = useStructuredLogger('MainLayout');

  const auth = useAuth();
  const user = auth?.user;
  const isAuthenticated = !!user;

  const navSections = useNavSections(navLinks, isAuthenticated);

  const displayName: string =
    (user && (user.name || user.displayName || user.email)) || 'Ikke pålogget';

  const initials = useMemo(() => {
    if (!user) return '--';
    const source = user.name || user.displayName || user.email || '';
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
    logEvent('navigation_change', { meta: { path: location.pathname } });
  }, [location.pathname, logEvent]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuPanelRef.current?.contains(target) || menuButtonRef.current?.contains(target)) {
        return;
      }
      setMenuOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    auth?.logout?.();
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen text-slate-900 flex flex-col">
      <header className="w-full sticky top-0 z-40 backdrop-blur-lg bg-white/90 border-b border-slate-200 shadow-sm">
        <nav className="relative max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-300 to-sky-300 text-slate-900 flex items-center justify-center rounded-xl font-bold shadow">
              {isAuthenticated ? initials : '--'}
            </div>

            <div className="flex flex-col">
              <span className="font-medium truncate max-w-[160px] text-slate-900">
                {displayName}
              </span>
              <span className="text-xs text-slate-600">
                {isAuthenticated ? 'Pålogget' : 'Utforsk fritt'}
              </span>
            </div>

            <div className="hidden sm:flex flex-col pl-4 border-l border-slate-200 ml-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-emerald-700">
                Omstilling
              </span>
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-sm text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                Logg ut
              </button>
            )}

            <button
              ref={menuButtonRef}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white text-slate-800 hover:bg-emerald-50 transition border border-slate-200"
              aria-expanded={menuOpen}
              aria-label="Åpne meny"
            >
              <span className="text-base">☰</span>
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
                    absolute z-50 rounded-2xl shadow-2xl border border-slate-200
                    menu-panel
                    right-0 top-12 w-[76vw]
                    sm:w-72
                  "
                >
                  <div className="py-4">
                    {navSections.map((section, sectionIdx) => (
                      <div key={section.title} className="mb-4">
                        <div className="px-4 pb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          {section.title}
                        </div>

                        {section.items.map((link) => (
                          <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.path === '/insurance'}
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                              [
                                'flex items-center gap-2 px-4 py-2 text-sm transition rounded-lg',
                                'hover:bg-emerald-50',
                                isActive
                                  ? 'font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200'
                                  : 'text-slate-800',
                              ].join(' ')
                            }
                          >
                            <span>{link.label}</span>
                          </NavLink>
                        ))}

                        {sectionIdx < navSections.length - 1 && (
                          <div className="my-3 mx-4 border-t border-slate-200" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </nav>
      </header>

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
