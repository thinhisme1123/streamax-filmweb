import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      let success = false;
      if (isLogin) {
        success = await login(email, password);
      } else {
        success = await register(email, password);
      }
      
      if (success) {
        navigate('/');
      }
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
          {isLogin ? 'Đăng nhập' : 'Đăng ký'}
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-dark-light/70 text-white rounded px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:bg-dark-light transition"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              className="w-full bg-dark-light/70 text-white rounded px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:bg-dark-light transition"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white font-bold rounded py-3 hover:bg-primary-hover transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
          </button>

          <div className="flex items-center justify-between text-sm text-gray-400 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-gray-500 w-4 h-4" />
              Ghi nhớ tài khoản
            </label>
            <a href="#" className="hover:underline">Bạn cần giúp đỡ?</a>
          </div>
        </form>

        <div className="mt-12 text-gray-400 text-sm">
          {isLogin ? (
            <p>
              Bạn mới biết đến StreaMax?{' '}
              <button onClick={() => { setIsLogin(false); setEmail(''); setPassword(''); }} className="text-white hover:underline font-medium">
                Đăng ký ngay
              </button>.
            </p>
          ) : (
            <p>
              Đã có tài khoản?{' '}
              <button onClick={() => { setIsLogin(true); setEmail(''); setPassword(''); }} className="text-white hover:underline font-medium">
                Đăng nhập ngay
              </button>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
