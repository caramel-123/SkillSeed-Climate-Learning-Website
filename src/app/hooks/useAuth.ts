import { useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  region: string;
  userType: 'poster' | 'responder';
}

interface SignInData {
  email: string;
  password: string;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        session,
        user: session?.user ?? null,
        loading: false,
      });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthState({
          session,
          user: session?.user ?? null,
          loading: false,
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (data: SignUpData): Promise<{ error: AuthError | null }> => {
    const { email, password, fullName, region, userType } = data;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          region,
          user_type: userType,
        },
      },
    });

    return { error };
  };

  const signIn = async (data: SignInData): Promise<{ error: AuthError | null }> => {
    const { email, password } = data;
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signInWithGoogle = async (): Promise<{
    error: AuthError | null;
    /** Pop-up window when opened; parent should listen for `skillseed-oauth-success` postMessage */
    oauthPopup: Window | null;
  }> => {
    // Google blocks OAuth screens inside iframes/webviews ("This content is blocked").
    // Use `skipBrowserRedirect` so we can open the provider URL in a real window.
    // `prompt=select_account` forces Google's account picker (no silent reuse of last account).
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        skipBrowserRedirect: true,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error || !data?.url) {
      return { error, oauthPopup: null };
    }

    const url = data.url;

    if (window.self !== window.top) {
      const w = window.open(url, "_blank", "noopener,noreferrer");
      if (!w) window.location.href = url;
      return { error: null, oauthPopup: w };
    }

    // Top-level: tall centered pop-up so Google's sign-in UI reads as a vertical dialog.
    const width = 500;
    const height = 720;
    const left = Math.max(0, (window.screen.width - width) / 2);
    const top = Math.max(0, (window.screen.height - height) / 2);
    const features = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`;
    const popup = window.open(url, "skillseed-google-oauth", features);
    if (!popup) {
      window.location.href = url;
      return { error: null, oauthPopup: null };
    }
    popup.focus();
    return { error: null, oauthPopup: popup };
  };

  const signOut = async (): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };
}
