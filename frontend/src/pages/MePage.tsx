import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function MePage() {
  const { user, logout } = useAuth();
  const { profile, isLoading: isProfileLoading } = useUserProfile();

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">...</h1>
        <p className="mt-2 text-slate-600">Du må logge inn for å se denne siden.</p>
      </div>
    );
  }

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
  const hasName = Boolean(fullName);
  const nameText = fullName || (isProfileLoading ? 'Henter...' : 'Ikke registrert');

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Min profil</h1>

      <div className="bg-white rounded-xl shadow p-5 border border-slate-200 space-y-4">
        <div>
          <h2 className="font-semibold text-slate-800">Navn</h2>
          <p className="text-slate-700">{nameText}</p>
          {!hasName && !isProfileLoading && (
            <p className="text-sm text-slate-600 mt-1">
              Legg til navn i{' '}
              <Link className="text-blue-600 hover:underline" to="/insurance">
                profilen din
              </Link>
              .
            </p>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-slate-800">E-post</h2>
          <p className="text-slate-700">{user.email}</p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-800">Status</h2>
          <p className="text-green-700 font-medium">Pålogget</p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-800">Session</h2>
          <p className="text-slate-700">JWT-token er lagret lokalt i nettleseren.</p>
        </div>
      </div>

      <button
        onClick={() => logout({ redirectTo: '/' })}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow font-medium"
      >
        Logg ut
      </button>
    </div>
  );
}
