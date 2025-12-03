import React from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function MePage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Min profil</h1>

      <div className="bg-white rounded-xl shadow p-5 border border-slate-200 space-y-4">
        <div>
          <h2 className="font-semibold text-slate-800">Navn</h2>
          <p className="text-slate-700">{user.fullName || user.email}</p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-800">E-post</h2>
          <p className="text-slate-700">{user.email}</p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-800">Status</h2>
          <p className="text-green-700 font-medium">Pålogget</p>
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
