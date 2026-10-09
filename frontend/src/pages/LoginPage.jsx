import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Show splash screen for 2.5 seconds before showing the login form
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  if (showSplash) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-dark">
        <div className="animate-pulse">
          <img src="/logo.png" alt="Logo" className="w-32 h-32 object-contain" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-dark text-primary">
      <div className="mb-10">
        <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain" />
      </div>

      <div className="bg-panel/50 backdrop-blur-xl border border-border p-8 rounded-2xl w-full max-w-sm">
        {error && <div className="bg-alert/20 text-alert text-sm p-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-secondary uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-dark border border-border rounded px-3 py-2 text-sm outline-none focus:border-tertiary transition-colors"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-secondary uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-dark border border-border rounded px-3 py-2 text-sm outline-none focus:border-tertiary transition-colors"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 bg-tertiary hover:bg-tertiary/90 text-dark font-medium py-2 rounded transition-colors"
          >
            {loading ? '...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
