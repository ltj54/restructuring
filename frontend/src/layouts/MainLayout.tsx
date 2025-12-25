import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
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

function useNavSections(
  navLinks: MainNavLink[],
  isAuthenticated: boolean,
  isAdmin: boolean
): NavSection[] {
  const hovedmeny = [
    navLinks.find((l) => l.path === '/'),
    navLinks.find((l) => l.path === '/wizard'),
    navLinks.find((l) => l.path === '/plan'),
    navLinks.find((l) => l.path === '/resources'),
    navLinks.find((l) => l.path === '/journal'),
    navLinks.find((l) => l.path === '/insurance'),
  ].filter(Boolean) as MainNavLink[];

  const system = [
    isAdmin ? navLinks.find((l) => l.path === '/systeminfo') : null,
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

  if (!isAuthenticated && authLinks.length > 0) {
    sections.push({ title: 'KONTO', items: authLinks });
  }

  return sections;
}

/**
 * Konsekvent aktiv-markering:
 * - "/" skal kun være aktiv på nøyaktig "/"
 * - ellers: aktiv hvis pathname === to eller pathname starter med `${to}/`
 */
function isPathActive(pathname: string, to: string): boolean {
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function MainLayout({ navLinks }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logEvent } = useStructuredLogger('MainLayout');
  const { user, isAdmin } = useAuth();

  const isAuthenticated = !!user;
  const navSections = useNavSections(navLinks, isAuthenticated, isAdmin ?? false);

  const displayName = user?.email ?? 'Gjest';

  const initials = useMemo(() => {
    if (!user?.email) return '??';
    return user.email.charAt(0).toUpperCase();
  }, [user]);

  const [menuOpen, setMenuOpen] = useState(false);
  const lastOpenAtRef = useRef(0);

  // Route change = logg + lukk meny
  useEffect(() => {
    logEvent('route_change');
    setMenuOpen(false);
  }, [location.pathname, logEvent]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = 'Det kan hende endringene dine ikke er lagret.';
      return 'Det kan hende endringene dine ikke er lagret.';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* MOBIL TOPPBAR */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-3 bg-white border-b border-slate-200 px-4 h-14">
        <button
          type="button"
          onClick={() => navigate(isAuthenticated ? '/me' : '/login')}
          className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold">
            {isAuthenticated ? initials : '??'}
          </span>
          <span className="max-w-[140px] truncate">
            {isAuthenticated ? displayName : 'Logg inn'}
          </span>
        </button>

        <div className="text-sm font-semibold text-slate-900">Omstilling</div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((prev) => {
              const next = !prev;
              if (next) {
                lastOpenAtRef.current = Date.now();
              }
              return next;
            });
          }}
          aria-label="Åpne meny"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-lg border border-slate-200 text-slate-900"
        >
          <span className="block h-0.5 w-5 bg-slate-900" />
          <span className="block h-0.5 w-5 bg-slate-900" />
          <span className="block h-0.5 w-5 bg-slate-900" />
        </button>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => {
            if (Date.now() - lastOpenAtRef.current < 350) {
              return;
            }
            setMenuOpen(false);
          }}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
          {/* SIDEBAR: desktop = vanlig, mobil = off-canvas */}
          <aside
            className={[
              'rounded-2xl border border-slate-200 bg-white shadow-sm',
              'md:relative md:translate-x-0 md:block',
              'fixed md:static inset-y-0 left-0 z-30 w-[260px] md:z-auto',
              'transform transition-transform duration-200 ease-in-out',
              menuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
            ].join(' ')}
          >
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-semibold">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {displayName}
                </div>
                <div className="text-xs text-slate-500">
                  {isAuthenticated ? (isAdmin ? 'ADMIN' : 'Innlogget') : 'Gjest'}
                </div>
              </div>
            </div>

            <nav className="p-3 space-y-4">
              {navSections.map((section) => (
                <div key={section.title}>
                  <div className="px-2 text-xs font-semibold text-slate-500">
                    {section.title}
                  </div>

                  <div className="mt-2 space-y-1">
                    {section.items.map((l) => {
                      const active = isPathActive(location.pathname, l.path);

                      const className = active
                        ? 'block rounded-xl px-3 py-2 text-sm bg-slate-200 text-slate-900 font-medium'
                        : 'block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900';

                      return (
                        <NavLink
                          key={l.path}
                          to={l.path}
                          className={className}
                          onClick={() => setMenuOpen(false)}
                        >
                          {l.label}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          <main className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Suspense fallback={<div className="p-6">Laster.</div>}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
