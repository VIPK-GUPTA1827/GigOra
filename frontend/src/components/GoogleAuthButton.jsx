import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function GoogleAuthButton({ role = 'client', isSignup = false, text = 'Continue with Google', onError }) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const roleRef = useRef(role);
  const isSignupRef = useRef(isSignup);
  useEffect(() => {
    roleRef.current = role;
    isSignupRef.current = isSignup;
  }, [role, isSignup]);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1068585775331-0s0s8hr2es1bjkac6ki7pb15t54l91rg.apps.googleusercontent.com';

  const handleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      if (onError) onError('Google login was cancelled or failed');
      return;
    }

    try {
      setLoading(true);
      const user = await loginWithGoogle(response.credential, roleRef.current, isSignupRef.current);
      // Navigate to respective dashboard based on role
      if (user.role === 'client') {
        navigate('/client/dashboard');
      } else {
        navigate('/freelancer/dashboard');
      }
    } catch (err) {
      console.error('Google Auth Error:', err);
      if (onError) {
        onError(err.message || 'Google authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    const initializeGoogleButton = () => {
      if (window.google?.accounts?.id) {
        setScriptLoaded(true);
        try {
          // Keep active component's callback synced globally
          window.__gigoraGsiCallback = handleCredentialResponse;

          // Prevent multiple initializations that trigger GSI warning
          if (!window.__gigoraGsiInitialized) {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: (response) => {
                if (typeof window.__gigoraGsiCallback === 'function') {
                  window.__gigoraGsiCallback(response);
                }
              },
              auto_select: false
            });
            window.__gigoraGsiInitialized = true;
          }

          if (buttonRef.current) {
            buttonRef.current.innerHTML = '';
            const containerWidth = buttonRef.current.clientWidth || buttonRef.current.offsetWidth || 388;
            window.google.accounts.id.renderButton(buttonRef.current, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              shape: 'rectangular',
              text: 'continue_with',
              logo_alignment: 'left',
              width: Math.min(containerWidth, 400)
            });
          }
        } catch (e) {
          console.warn('Google button initialization notice:', e.message);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogleButton();
    } else {
      interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initializeGoogleButton();
        }
      }, 200);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [clientId]);

  const handleCustomClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else if (onError) {
      onError('Google Identity services is still loading. Please check your internet connection.');
    }
  };

  return (
    <div className="w-full relative">
      {loading && (
        <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center rounded-xl backdrop-blur-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#593CFF]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Connecting Google account...</span>
          </div>
        </div>
      )}

      {/* Render container for official Google button */}
      <div 
        ref={buttonRef} 
        className="w-full flex justify-center items-center [&>div]:mx-auto"
      />

      {/* Fallback button if script is loading */}
      {!scriptLoaded && (
        <button
          type="button"
          onClick={handleCustomClick}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl border border-stone-200/90 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{text}</span>
        </button>
      )}
    </div>
  );
}
