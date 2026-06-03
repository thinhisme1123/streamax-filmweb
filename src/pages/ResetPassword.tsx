import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const resetSchema = z.object({
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(6, 'Vui lòng xác nhận mật khẩu'),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Mật khẩu không khớp',
      path: ['confirmPassword'],
    });
  }
});

type ResetFormData = z.infer<typeof resetSchema>;

export const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetFormData) => {
    if (!token) {
      toast.error('Token không hợp lệ hoặc đã hết hạn.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call to /api/auth/reset-password
      console.log('Resetting password with token:', token);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success('Mật khẩu đã được cập nhật thành công!');
      navigate('/auth');
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black">
      {/* Background Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] mx-4">
        <div className="bg-[#0a0a0a]/95 rounded-[1.15rem] p-8 md:p-10 border border-white/10 shadow-2xl backdrop-blur-sm">
          
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 tracking-wider">
              TTFilm
            </h1>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Đặt Lại Mật Khẩu
          </h2>

          {!token ? (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3 text-red-200">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                Đường dẫn không hợp lệ hoặc thiếu mã xác thực. Vui lòng kiểm tra lại email của bạn.
                <div className="mt-4 text-center">
                  <Link to="/auth" className="text-red-400 font-medium hover:text-red-300 hover:underline">
                    Quay lại Đăng nhập
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <input
                  type="password"
                  {...register('password')}
                  placeholder="Mật khẩu mới"
                  className={twMerge(
                    "w-full bg-gray-900 text-white rounded-lg px-4 py-3.5 outline-none focus:ring-2 transition border",
                    errors.password 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                      : "border-gray-700 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1.5">{errors.password.message}</p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="Xác nhận mật khẩu"
                  className={twMerge(
                    "w-full bg-gray-900 text-white rounded-lg px-4 py-3.5 outline-none focus:ring-2 transition border",
                    errors.confirmPassword 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                      : "border-gray-700 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1.5">{errors.confirmPassword.message}</p>
                )}
              </div>

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
                  'Cập nhật mật khẩu'
                )}
              </button>
            </form>
          )}
          
        </div>
      </div>
    </div>
  );
};
