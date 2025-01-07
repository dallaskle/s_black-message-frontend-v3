import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../../api/auth';
import { Button } from '../../components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await authApi.login(data);
      localStorage.setItem('accessToken', response.session?.access_token || '');
      localStorage.setItem('refreshToken', response.session?.refresh_token || '');
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-background-secondary p-8 rounded-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary">Welcome back</h2>
          <p className="mt-2 text-text-secondary">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-accent-error/10 text-accent-error p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="mt-1 block w-full rounded-lg bg-background-primary border border-text-secondary/20 px-3 py-2 text-text-primary"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-accent-error">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                className="mt-1 block w-full rounded-lg bg-background-primary border border-text-secondary/20 px-3 py-2 text-text-primary"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-accent-error">{errors.password.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Sign in
          </Button>

          <p className="text-center text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-primary hover:text-accent-primary/90">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
} 