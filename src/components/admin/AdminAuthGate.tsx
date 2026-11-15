'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import type { Session } from '@supabase/supabase-js';
import { Lock, LogOut, Loader2, ShieldAlert } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { btn, inputClass } from './ui';

interface AdminAuth {
  email: string | null;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuth>({ email: null, signOut: async () => {} });
export const useAdminAuth = () => useContext(AdminAuthContext);

type Access = 'checking' | 'staff' | 'not-staff';

/**
 * Protects every /admin page.
 * - Supabase configured: staff must sign in (email + password) and be listed in the « staff » table.
 * - No Supabase (local demo mode): pages stay open, as before.
 */
export const AdminAuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [access, setAccess] = useState<Access>('checking');

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  // Is this account part of the staff?
  useEffect(() => {
    if (!supabase || !session) return;
    setAccess('checking');
    supabase
      .from('staff')
      .select('email')
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          // The security script has not been run yet: any signed-in account is accepted for now.
          const missingTable = error.code === '42P01' || error.code === 'PGRST205' || /does not exist|could not find the table/i.test(error.message);
          setAccess(missingTable ? 'staff' : 'not-staff');
          if (!missingTable) console.error('Vérification du personnel impossible', error);
          return;
        }
        setAccess(data && data.length > 0 ? 'staff' : 'not-staff');
      });
  }, [session]);

  const signOut = async () => {
    await supabase?.auth.signOut();
  };

  if (!isSupabaseConfigured) {
    return <AdminAuthContext.Provider value={{ email: null, signOut }}>{children}</AdminAuthContext.Provider>;
  }

  if (!ready || (session && access === 'checking')) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F5F6F8] text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin" aria-label="Chargement" />
      </div>
    );
  }

  if (!session) return <LoginScreen />;

  if (access === 'not-staff') {
    return (
      <AuthShell>
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-slate-900 text-center">Accès non autorisé</h1>
        <p className="mt-2 text-sm text-slate-500 text-center">
          Le compte <strong className="text-slate-700">{session.user.email}</strong> n’est pas dans la liste du personnel.
          Demandez au responsable de l’ajouter.
        </p>
        <button onClick={signOut} className={`${btn.secondary} w-full mt-6`}>
          <LogOut className="w-4 h-4" />
          Changer de compte
        </button>
      </AuthShell>
    );
  }

  return (
    <AdminAuthContext.Provider value={{ email: session.user.email ?? null, signOut }}>{children}</AdminAuthContext.Provider>
  );
};

const AuthShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="admin-theme min-h-screen w-full overflow-y-auto bg-[#F5F6F8] flex flex-col items-center justify-center px-4 py-10 select-text">
    <div className="w-full max-w-sm">
      <div className="flex justify-center mb-6">
        <div className="rounded-2xl bg-[#14171F] px-6 py-4">
          <div className="relative h-10 w-44">
            <Image src="/logo.png" alt="Mat House Restaurant" fill className="object-contain" priority />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">{children}</div>
    </div>
  </div>
);

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (err) {
      if (/invalid login credentials/i.test(err.message)) setError('Email ou mot de passe incorrect.');
      else if (/email not confirmed/i.test(err.message)) setError('Ce compte n’est pas encore confirmé dans Supabase.');
      else setError('Connexion impossible. Vérifiez la connexion internet et réessayez.');
    }
  };

  return (
    <AuthShell>
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
        <Lock className="w-5 h-5" />
      </div>
      <h1 className="mt-4 text-xl font-semibold text-slate-900 text-center">Espace personnel</h1>
      <p className="mt-1 text-sm text-slate-500 text-center">Connectez-vous pour accéder aux commandes et à l’administration.</p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1.5">
            Mot de passe
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className={`${btn.primary} w-full`}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Se connecter
        </button>
      </form>

      <p className="mt-5 text-xs text-slate-400 text-center">
        Les comptes du personnel sont créés par le responsable du restaurant.
      </p>
    </AuthShell>
  );
};
