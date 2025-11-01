import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { UserPlus } from 'lucide-react';

export default function SignupForm({ onToggleForm }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, fullName, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="glass-card p-8 animate-fade-in">
        <div className="flex items-center justify-center mb-6">
          <div className="glass-card p-3 animate-glow">
            <UserPlus className="w-10 h-10 text-gold" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center gold-gradient-text mb-8">Create Your Account</h2>

        {error && (
          <div className="bg-red-900/30 border-2 border-red-500/50 text-red-300 px-4 py-3 rounded-2xl mb-6 animate-slide-up backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-gold mb-2">Full Name</label>
            <input 
              id="fullName" 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              required 
              className="gold-input w-full" 
              placeholder="John Doe" 
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gold mb-2">Email Address</label>
            <input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="gold-input w-full" 
              placeholder="student@example.com" 
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gold mb-2">Password</label>
            <input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength={6} 
              className="gold-input w-full" 
              placeholder="••••••••" 
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-semibold text-gold mb-2">Role</label>
            <select 
              id="role" 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              className="gold-input w-full"
            >
              <option value="student" className="bg-black text-gray-100">Student</option>
              <option value="admin" className="bg-black text-gray-100">Admin</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="gold-button w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Creating account...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <button 
              onClick={onToggleForm} 
              className="text-gold hover:text-gold-200 font-semibold transition-colors hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}


