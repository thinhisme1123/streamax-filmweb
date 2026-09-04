import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const baseSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Địa chỉ email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().optional(),
});

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register: apiRegister, isLoading } = useAuth();
  const navigate = useNavigate();

  const authSchema = baseSchema.superRefine((data, ctx) => {
    if (!isLogin && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mật khẩu không khớp',
        path: ['confirmPassword'],
      });
    }
  });

  type AuthFormData = z.infer<typeof authSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
    mode: 'onSubmit',
  });

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    reset();
    clearErrors();
  };

  const onSubmit = async (data: AuthFormData) => {
    let success = false;

    if (isLogin) {
      success = await login(data.email, data.password);
    } else {
      success = await apiRegister(data.email, data.password);
    }

    if (success) {
      toast.success(isLogin ? 'Đăng nhập thành công!' : 'Đăng ký thành công!');
      navigate('/');
    } else {
      const errorMessage = useAuthStore.getState().error;
      toast.error(errorMessage || (isLogin ? 'Đăng nhập thất bại' : 'Đăng ký thất bại'));
    }
  };

  return (
    <>
      <style>{`
        .video-background {
          position: fixed;
          top: 50%;
          left: 50%;
          min-width: 100%;
          min-height: 100%;
          width: auto;
          height: auto;
          z-index: -2;
          transform: translateX(-50%) translateY(-50%);
          object-fit: cover;
        }

        .neon-wrapper {
          position: relative;
          padding: 3px;
          border-radius: 1.25rem;
          overflow: hidden;
          box-shadow: 0 0 40px rgba(239, 68, 68, 0.2), inset 0 0 20px rgba(249, 115, 22, 0.1);
        }
        
        .neon-wrapper::before,
        .neon-wrapper::after {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          z-index: -1;
          filter: blur(2px);
        }
        
        .neon-wrapper::before {
          background: conic-gradient(from 0deg, transparent 70%, #ef4444 80%, #f97316 100%);
          animation: rotateNeon 4s linear infinite;
        }
        
        .neon-wrapper::after {
          background: conic-gradient(from 180deg, transparent 70%, #ef4444 80%, #f97316 100%);
          animation: rotateNeon 4s linear infinite;
        }

        .neon-inner {
          background: rgba(10, 10, 10, 0.95);
          border-radius: 1.15rem;
          position: relative;
          z-index: 10;
          backdrop-filter: blur(10px);
          width: 100%;
          height: 100%;
        }

        @keyframes rotateNeon {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div className="relative min-h-screen flex items-center justify-center text-white overflow-hidden selection:bg-red-500/30">
        <video className="video-background" autoPlay loop muted playsInline>
          <source src="/login-background/marvel-intro-placeholder.mp4.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 z-[-1] bg-black/80 backdrop-blur-[2px]" />

        <div className="relative z-10 w-full max-w-[420px] mx-4 neon-wrapper">
          <div className="neon-inner p-8 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 tracking-wider">
                TTFilm
              </h1>
            </div>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="Email"
                  className={twMerge(
                    "w-full bg-dark-light/70 text-white rounded px-4 py-3 outline-none focus:ring-2 focus:bg-dark-light transition border",
                    errors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-transparent focus:ring-primary"
                  )}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1.5">{errors.email.message}</p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  {...register('password')}
                  placeholder="Mật khẩu"
                  className={twMerge(
                    "w-full bg-dark-light/70 text-white rounded px-4 py-3 outline-none focus:ring-2 focus:bg-dark-light transition border",
                    errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-transparent focus:ring-primary"
                  )}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1.5">{errors.password.message}</p>
                )}
              </div>

              {!isLogin && (
                <div>
                  <input
                    type="password"
                    {...register('confirmPassword')}
                    placeholder="Xác nhận mật khẩu"
                    className={twMerge(
                      "w-full bg-dark-light/70 text-white rounded px-4 py-3 outline-none focus:ring-2 focus:bg-dark-light transition border",
                      errors.confirmPassword
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-transparent focus:ring-primary"
                    )}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1.5">{errors.confirmPassword.message}</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold py-3.5 rounded-lg mt-6 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  isLogin ? 'Đăng nhập' : 'Đăng ký'
                )}
              </button>

              <div className="flex items-center justify-between text-sm text-gray-400 mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-gray-500 w-4 h-4" />
                  Ghi nhớ tài khoản
                </label>
                <Link to="/forgot-password" className="hover:underline">Quên mật khẩu?</Link>
              </div>
            </form>

            <div className="mt-12 text-gray-400 text-sm">
              {isLogin ? (
                <p>
                  Bạn mới biết đến TTfilm?{' '}
                  <button
                    type="button"
                    onClick={handleToggleMode}
                    className="text-white hover:underline font-medium"
                  >
                    Đăng ký ngay
                  </button>.
                </p>
              ) : (
                <p>
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={handleToggleMode}
                    className="text-white hover:underline font-medium"
                  >
                    Đăng nhập ngay
                  </button>.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
