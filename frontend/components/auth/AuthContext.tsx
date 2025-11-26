import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../../types';
import { API_BASE_URL } from '../../constants';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    loginWithGithub: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkSession = async () => {
            const storedUser = localStorage.getItem('trunk_user');

            // Handle OAuth Redirect Callback from GitHub
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');

            if (code) {
                // Clean the URL immediately so the code isn't reusable/visible
                window.history.replaceState({}, document.title, window.location.pathname);

                try {
                    setIsLoading(true);
                    // Call NestJS Backend to exchange code for user info
                    const response = await fetch(`${API_BASE_URL}/auth/github/callback`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code })
                    });

                    if (!response.ok) {
                        throw new Error('GitHub Authentication failed');
                    }

                    const data = await response.json();

                    // Backend should return user object
                    const userData: User = {
                        id: data.id || 'unknown',
                        name: data.name || data.login,
                        email: data.email || 'no-email-public',
                        avatar: data.avatar_url,
                        role: 'developer' // Default role
                    };

                    setUser(userData);
                    localStorage.setItem('trunk_user', JSON.stringify(userData));
                } catch (error) {
                    console.error('OAuth callback failed', error);
                    alert('Failed to login with GitHub. Please try again.');
                }
            } else if (storedUser) {
                // Restore session from local storage
                setUser(JSON.parse(storedUser));
            }

            setIsLoading(false);
        };

        checkSession();
    }, []);

    const loginWithGithub = async () => {
        try {
            // Step 1: Get the GitHub Login URL from Backend (Securely gets Client ID)
            const res = await fetch(`${API_BASE_URL}/auth/github/url`);

            if (!res.ok) {
                throw new Error(`Failed to fetch auth URL: ${res.status}`);
            }

            const json = await res.json();
            console.log('GitHub URL response:', json);
            const url = json?.data?.url || json?.url;

            if (!url) {
                throw new Error('No URL returned from backend');
            }
            const expectedRedirect = window.location.origin; // e.g., http://localhost:5173
            try {
                const parsed = new URL(url);
                const returnedRedirect = parsed.searchParams.get('redirect_uri');

                if (returnedRedirect && returnedRedirect !== expectedRedirect) {
                    console.warn(
                        `redirect_uri mismatch:\n` +
                        `  Returned: "${returnedRedirect}"\n` +
                        `  Expected: "${expectedRedirect}"\n` +
                        `Proceeding anyway, but update GitHub OAuth App callback URL to: ${expectedRedirect}`
                    );
                }
            } catch (e) {
                console.warn('Could not validate redirect_uri', e);
            }

            // Step 2: Redirect user to GitHub
            console.log('Redirecting to GitHub OAuth:', url);
            window.location.href = url;
        } catch (error) {
            console.error("Failed to start GitHub login", error);
            alert("Backend service is not reachable. Check if NestJS is running on port 3456.");
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('trunk_user');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, loginWithGithub, logout }}>
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