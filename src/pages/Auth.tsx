import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
            className="w-full flex items-center justify-center bg-primary text-white font-bold rounded py-3 hover:bg-primary-hover transition mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
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
            <a href="#" className="hover:underline">Bạn cần giúp đỡ?</a>
          </div>
        </form>

        <div className="mt-12 text-gray-400 text-sm">
          {isLogin ? (
            <p>
              Bạn mới biết đến StreaMax?{' '}
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
  );
};
