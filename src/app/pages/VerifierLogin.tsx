import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { supabase } from '../utils/supabase';
import { Loader2 } from 'lucide-react';

export function VerifierLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth
        .signInWithPassword({ email, password });

      if (authError) throw authError;

      // Check if user has verifier access
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, is_verifier')
        .eq('user_id', authData.user.id)
        .single();

      if (!profile?.is_verifier) {
        await supabase.auth.signOut();
        setError('This account does not have verifier access.');
        return;
      }

      navigate('/verifier');

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[#1a3a2a] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <img src="/logo.png" className="w-8 h-8" alt="SkillSeed" />
          <span className="font-bold text-gray-900">SkillSeed</span>
          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full ml-1">
            Verifier Portal
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Verifier Login
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          Restricted to accredited SkillSeed verifiers only.
        </p>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
            {error}
          </div>
        )}

        {/* Email field */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            placeholder="verifier@organisation.org"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
          />
        </div>

        {/* Password field */}
        <div className="mb-6">
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            placeholder="••••••••"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
          />
        </div>

        {/* Submit button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#1a3a2a] text-white py-3 rounded-xl text-sm font-medium hover:bg-green-900 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking access...
            </>
          ) : (
            'Login to Verifier Portal →'
          )}
        </button>

        {/* Back link */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Not a verifier?{' '}
          <Link to="/" className="text-green-600 hover:underline">
            Back to SkillSeed
          </Link>
        </p>
      </div>
    </div>
  );
}

export default VerifierLogin;
