import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/auth';
import { Button } from '../../components/ui/Button';
import S_Black_Full_Logo from '../../../public/S_Black_Full_Logo.png';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const navigate = useNavigate();
  const { register: registerUser, login: loginUser, error: authError } = useAuth();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError('');
      setSuccessMessage('');
      
      // Register the user with auto-verification
      const response = await registerUser(data);
      
      // If we got back a session, we're already logged in
      if (response.session?.access_token) {
        setSuccessMessage('Registration successful! Redirecting to app...');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        // Fallback to manual verification if auto-verify failed
        setSuccessMessage('Registration successful! Please check your email to verify your account.');
        setTimeout(() => {
          navigate('/email-verification', { 
            state: { email: data.email }
          });
        }, 2000);
      }
    } catch (err: any) {
      if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-background-secondary p-8 rounded-xl">
        <div className="text-center">
          <img
            src={S_Black_Full_Logo}
            alt="S_Black Logo"
            className="h-36 mx-auto mb-6 pt--8"
          />
          <h2 className="text-3xl font-bold text-text-primary">Create an account</h2>
          <p className="mt-2 text-text-secondary">Join our community today</p>
        </div>

        {error && (
          <div className="bg-accent-error/10 text-accent-error p-3 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/10 text-green-500 p-3 rounded-lg">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary">
                Name
              </label>
              <input
                {...register('name')}
                type="text"
                className="mt-1 block w-full rounded-lg bg-background-primary border border-text-secondary/20 px-3 py-2 text-text-primary"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-accent-error">{errors.name.message}</p>
              )}
            </div>

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
            Sign up
          </Button>

          <p className="text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-primary hover:text-accent-primary/90">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
} 