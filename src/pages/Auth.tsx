import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      login(email);
      navigate('/');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-dark">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1574267432553-4b4628081524?q=80&w=1632&auto=format&fit=crop"
          alt="Background"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-black/80 rounded-lg shadow-2xl border border-white/10 mx-4">
        <h2 className="text-3xl font-bold text-white mb-8">
          {isLogin ? 'Sign In' : 'Sign Up'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or phone number"
              className="w-full bg-dark-light/70 text-white rounded px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:bg-dark-light transition"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-dark-light/70 text-white rounded px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:bg-dark-light transition"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white font-bold rounded py-3 hover:bg-primary-hover transition mt-6"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>

          <div className="flex items-center justify-between text-sm text-gray-400 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-gray-500 w-4 h-4" />
              Remember me
            </label>
            <a href="#" className="hover:underline">Need help?</a>
          </div>
        </form>

        <div className="mt-12 text-gray-400 text-sm">
          {isLogin ? (
            <p>
              New to StreaMax?{' '}
              <button onClick={() => setIsLogin(false)} className="text-white hover:underline font-medium">
                Sign up now
              </button>.
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => setIsLogin(true)} className="text-white hover:underline font-medium">
                Sign in now
              </button>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
