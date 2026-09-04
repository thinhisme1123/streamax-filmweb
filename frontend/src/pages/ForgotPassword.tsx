import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const step1Schema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Địa chỉ email không hợp lệ'),
});

const step2Schema = z.object({
  otp: z.string().length(6, 'Mã OTP phải có đúng 6 chữ số').regex(/^\d+$/, 'Mã OTP chỉ bao gồm chữ số'),
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

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

export const ForgotPassword = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const navigate = useNavigate();

  const formStep1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { email: '' },
  });

  const formStep2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { otp: '', password: '', confirmPassword: '' },
  });

  const onSubmitStep1 = async (data: Step1Data) => {
    setIsLoading(true);
    try {
      // Simulate API call to /api/auth/send-otp
      console.log('Sending OTP to:', data.email);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setEmailValue(data.email);
      toast.success('Mã OTP đã được gửi đến email');
      setStep(2);
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitStep2 = async (_data: Step2Data) => {
    setIsLoading(true);
    try {
      // Simulate API call to /api/auth/verify-otp-reset
      console.log('Verifying OTP and resetting password for:', emailValue);
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
        <div className="bg-[#0a0a0a]/95 rounded-[1.15rem] p-8 md:p-10 border border-white/10 shadow-2xl backdrop-blur-sm transition-all duration-300">
          
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 tracking-wider">
              TTFilm
            </h1>
          </div>
          
          {step === 1 ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-2 text-center">
                Quên Mật Khẩu?
              </h2>
              <p className="text-gray-400 text-sm text-center mb-8">
                Nhập email của bạn và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
              </p>

              <form onSubmit={formStep1.handleSubmit(onSubmitStep1)} className="space-y-6">
                <div>
                  <input
                    type="email"
                    {...formStep1.register('email')}
                    placeholder="Email của bạn"
                    className={twMerge(
                      "w-full bg-gray-900 text-white rounded-lg px-4 py-3.5 outline-none focus:ring-2 transition border",
                      formStep1.formState.errors.email 
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                        : "border-gray-700 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  {formStep1.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1.5">{formStep1.formState.errors.email.message}</p>
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
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi mã OTP'
                  )}
                </button>

                <div className="text-center mt-6">
                  <Link to="/auth" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Quay lại Đăng nhập
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-2 text-center">
                Nhập Mã Xác Nhận
              </h2>
              <p className="text-gray-400 text-sm text-center mb-6">
                Mã OTP 6 số đã được gửi đến <br/>
                <span className="text-white font-medium">{emailValue}</span>
              </p>

              <form onSubmit={formStep2.handleSubmit(onSubmitStep2)} className="space-y-5">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    {...formStep2.register('otp')}
                    placeholder="000000"
                    className={twMerge(
                      "w-full bg-gray-900 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 transition border text-center text-2xl tracking-[0.5em] font-mono",
                      formStep2.formState.errors.otp 
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                        : "border-gray-700 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  {formStep2.formState.errors.otp && (
                    <p className="text-red-500 text-sm mt-1.5 text-center">{formStep2.formState.errors.otp.message}</p>
                  )}
                </div>

                <div>
                  <input
                    type="password"
                    {...formStep2.register('password')}
                    placeholder="Mật khẩu mới"
                    className={twMerge(
                      "w-full bg-gray-900 text-white rounded-lg px-4 py-3.5 outline-none focus:ring-2 transition border",
                      formStep2.formState.errors.password 
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                        : "border-gray-700 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  {formStep2.formState.errors.password && (
                    <p className="text-red-500 text-sm mt-1.5">{formStep2.formState.errors.password.message}</p>
                  )}
                </div>

                <div>
                  <input
                    type="password"
                    {...formStep2.register('confirmPassword')}
                    placeholder="Xác nhận mật khẩu mới"
                    className={twMerge(
                      "w-full bg-gray-900 text-white rounded-lg px-4 py-3.5 outline-none focus:ring-2 transition border",
                      formStep2.formState.errors.confirmPassword 
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                        : "border-gray-700 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  {formStep2.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1.5">{formStep2.formState.errors.confirmPassword.message}</p>
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
                    'Xác nhận và Đổi mật khẩu'
                  )}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Quay lại
                  </button>
                </div>
              </form>
            </>
          )}
          
        </div>
      </div>
    </div>
  );
};
