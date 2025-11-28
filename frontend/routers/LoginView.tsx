import React, { useState } from 'react';
import { Github, Loader2, AlertCircle, ShieldCheck, Terminal, Cpu, ArrowRight } from 'lucide-react';
import { useAuth } from '../components/auth/AuthContext';

const LoginView: React.FC = () => {
    const { loginWithGithub, loginWithEmail, isLoading } = useAuth();
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleGithubLogin = async () => {
        setLocalLoading(true);
        setError(null);
        try {
            await loginWithGithub();
        } catch (err) {
            setError('Failed to initiate GitHub login.');
            setLocalLoading(false);
        }
    };

    const handleEmailLogin = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError(null);
        if (!email || !password) {
            setError('Please provide both email and password.');
            return;
        }
        setLocalLoading(true);
        try {
            await loginWithEmail(email, password)
            window.location.href = '/home';
        } catch (err: any) {
            setError(err?.message || 'Email login failed');
        } finally {
            setLocalLoading(false);
        }
    };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#09090b] to-[#09090b]"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-sm relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-2xl shadow-indigo-500/20 mb-6 border border-white/10">
                <span className="text-2xl font-bold text-white">T</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">CI/CD</h1>
            <p className="text-slate-400 text-sm">CI/CD Analytics</p>
        </div>

        {/* Main Card */}
        <div className="bg-surface border border-border rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm">
            <div className="p-8">
                <div className="mb-8 text-center">
                    <h2 className="text-base font-semibold text-white">Welcome Back</h2>
                    <p className="text-xs text-slate-500 mt-1">Sign in with GitHub to access your dashboard</p>
                </div>

                                {error && (
                    <div className="flex items-center gap-2 p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs mb-4">
                        <AlertCircle size={14} />
                        {error}
                    </div>
                )}

                                {/* Email / Password form */}
                                <form onSubmit={handleEmailLogin} className="flex flex-col gap-3 mb-4">
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 bg-surface border border-border rounded-md text-white text-sm focus:outline-none"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-3 py-2 bg-surface border border-border rounded-md text-white text-sm focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading || localLoading}
                                        className="w-full h-10 bg-white text-black hover:bg-slate-200 font-semibold text-sm rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {(isLoading || localLoading) ? <Loader2 size={18} className="inline-block animate-spin" /> : 'Sign in'}
                                    </button>
                                </form>

                                <div className="text-center my-2 text-slate-400 text-xs">Or continue with</div>

                                <button 
                                        onClick={handleGithubLogin}
                                        disabled={isLoading || localLoading}
                                        className="w-full h-11 bg-white text-black hover:bg-slate-200 font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2.5 relative group disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-white/5"
                                >
                                        {isLoading || localLoading ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                                <>
                                                        <Github size={18} /> 
                                                        <span>Continue with GitHub</span>
                                                        <ArrowRight size={14} className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                                                </>
                                        )}
                                </button>

                <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex justify-between px-2">
                        <div className="flex flex-col items-center gap-2 group cursor-default">
                            <div className="w-8 h-8 rounded-full bg-surfaceHighlight/50 text-slate-400 flex items-center justify-center group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                                <Terminal size={14} />
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">Logs</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 group cursor-default">
                            <div className="w-8 h-8 rounded-full bg-surfaceHighlight/50 text-slate-400 flex items-center justify-center group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                                <ShieldCheck size={14} />
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">Secure</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 group cursor-default">
                            <div className="w-8 h-8 rounded-full bg-surfaceHighlight/50 text-slate-400 flex items-center justify-center group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-colors">
                                <Cpu size={14} />
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">Analyze</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="px-8 py-3 bg-surfaceHighlight/20 text-center border-t border-border">
                <p className="text-[10px] text-slate-500">
                    Secure access provided by GitHub OAuth 2.0
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;