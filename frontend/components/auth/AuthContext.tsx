
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../../types';
import { authService } from '../../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithGithub: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkSession = async () => {
       const storedUser = localStorage.getItem('trunk_user');
       const urlUser = authService.getUserFromUrl();
       
       if (urlUser) {
          setUser(urlUser);
          localStorage.setItem('trunk_user', JSON.stringify(urlUser));
       } else if (storedUser) {
         // Fallback to local storage
         setUser(JSON.parse(storedUser));
       } else {
         // Try fetching current user from backend (useful when backend set HttpOnly cookie/session)
         try {
           const current = await authService.fetchCurrentUser();
           if (current) {
             setUser(current);
             localStorage.setItem('trunk_user', JSON.stringify(current));
           }
         } catch (err) {
           console.warn('fetchCurrentUser failed', err);
         }
       }
       
       setIsLoading(false);
    };

    checkSession();
  }, []);

  const loginWithGithub = async () => {
    setIsLoading(true);
    try {
      const res = await authService.loginWithGithub();

      // backend may return { data: { url: '...' } } or { url: '...' }
      const target = res?.data?.url ?? res?.url;
      if (target) {
        window.location.href = target;
      } else {
        console.error('No redirect URL returned from auth endpoint', res);
        alert('Login failed: no redirect URL returned');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to start GitHub login', error);
      alert('Failed to initiate login.');
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
  const res = await authService.loginWithEmail(email, password);
  // normalize nested response shapes: { success, data: { ... } } or direct payload
  const body = res?.data ?? res;
  const payload = body?.data ?? body;
  const possibleUser = payload?.user ?? payload;
  if (payload?.accessToken) {
        try {
          localStorage.setItem('accessToken', payload.accessToken);
          if (payload.refreshToken) localStorage.setItem('refreshToken', payload.refreshToken);

          // decode JWT payload without extra dependency
          const parseJwt = (token: string) => {
            try {
              const payload = token.split('.')[1];
              const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
              return JSON.parse(decodeURIComponent(escape(json)));
            } catch (e) {
              console.warn('Failed to parse JWT', e);
              return null;
            }
          };

          const payloadFromToken = parseJwt(payload.accessToken);
          const derivedUser = payloadFromToken
            ? {
                id: payloadFromToken.id ?? payloadFromToken.sub,
                name: payloadFromToken.name ?? payloadFromToken.username ?? payloadFromToken.sub,
                email: payloadFromToken.email,
                avatar: payloadFromToken.avatar ?? '',
                role: payloadFromToken.role ?? 'developer',
              }
            : null;

          if (derivedUser) {
            setUser(derivedUser as User);
            localStorage.setItem('trunk_user', JSON.stringify(derivedUser));
          } else {
            // fallback: if backend also provides a user object inside res
            const returnedUser = payload?.user ?? null;
            if (returnedUser) {
              setUser(returnedUser);
              localStorage.setItem('trunk_user', JSON.stringify(returnedUser));
            } else {
              // If we only got tokens (no user in token payload and no user object),
              // attempt to fetch the current user from the backend using the stored token.
              try {
                const fetched = await authService.fetchCurrentUser();
                if (fetched) {
                  setUser(fetched);
                  localStorage.setItem('trunk_user', JSON.stringify(fetched));
                }
              } catch (e) {
                console.warn('Failed to fetch user after token login', e);
              }
            }
          }
        } catch (err) {
          console.error('Failed to handle token response', err);
        }
      } else if (possibleUser && (possibleUser.id || possibleUser.email)) {
        // Received user object directly
        setUser(possibleUser as User);
        localStorage.setItem('trunk_user', JSON.stringify(possibleUser));
      } else {
        console.error('No user returned from email login', res);
        alert('Login failed: no user returned');
      }
    } catch (err) {
      console.error('Email login failed', err);
      alert('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('trunk_user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithGithub, loginWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
