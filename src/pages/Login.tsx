import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const mode = searchParams.get('mode');
    const roleParam = searchParams.get('role');

    if (mode === 'signup') {
      setIsSignUp(true);
    }

    if (roleParam === 'seller') {
      setRole('seller');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, role, name);
        navigate('/');
      } else {
        await signIn(email, password);

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/chef-panel');
          }
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ett fel uppstod';

      if (errorMessage.includes('already registered')) {
        setError('Denna e-postadress är redan registrerad');
      } else if (errorMessage.includes('Invalid login credentials')) {
        setError('Felaktig e-postadress eller lösenord');
      } else if (errorMessage.includes('Password should be at least')) {
        setError('Lösenordet måste vara minst 6 tecken långt');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#a1c798' }}>
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg" style={{ backgroundColor: '#f6f2e0' }}>
        <h1 className="font-lobster text-3xl text-center mb-8 text-gray-800">
          {isSignUp ? 'Skapa Konto' : 'Logga In'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">E-post</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#56c5c5' } as any}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lösenord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#56c5c5' } as any}
              required
            />
          </div>

          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Namn</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#56c5c5' } as any}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jag är en...</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'buyer' | 'seller')}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#56c5c5' } as any}
                >
                  <option value="buyer">Köpare</option>
                  <option value="seller">Säljare / Kock</option>
                </select>
              </div>
            </>
          )}

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#56c5c5' }}
          >
            {loading ? 'Läser in...' : isSignUp ? 'Skapa Konto' : 'Logga In'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-4 text-sm text-gray-600 hover:text-gray-900"
        >
          {isSignUp ? 'Har du redan ett konto? Logga in' : 'Behöver du ett konto? Skapa ett'}
        </button>
      </div>
    </div>
  );
};
