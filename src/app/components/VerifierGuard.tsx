import { useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { getCurrentProfile } from '../utils/matchService';
import { Loader2 } from 'lucide-react';
import type { Profile } from '../types/database';
import { useShowBlockingFullPageLoader } from '../hooks/useShowBlockingFullPageLoader';

interface VerifierGuardProps {
  children: ReactNode;
}

export function VerifierGuard({ children }: VerifierGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    async function checkVerifierAccess() {
      setLoading(true);
      try {
        if (!user) {
          navigate('/verifier-login');
          return;
        }

        const currentProfile = await getCurrentProfile();

        if (!currentProfile?.is_verifier) {
          navigate('/');
          return;
        }

        setProfile(currentProfile);
      } catch (err) {
        console.error('Error checking verifier access:', err);
        navigate('/verifier-login');
      } finally {
        setInitialLoadDone(true);
        setLoading(false);
      }
    }

    checkVerifierAccess();
  }, [user, authLoading, navigate]);

  const showBlockingLoader = useShowBlockingFullPageLoader(
    loading || authLoading,
    initialLoadDone
  );

  if (showBlockingLoader || !profile?.is_verifier) {
    return (
      <div className="min-h-screen bg-[#1a3a2a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
          <p className="text-white text-sm">Checking access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default VerifierGuard;
