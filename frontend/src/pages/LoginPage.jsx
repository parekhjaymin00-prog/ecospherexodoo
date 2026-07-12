import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import AuthLayout from '../layouts/AuthLayout.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import Button from '../components/Button.jsx';
import Toast from '../components/Toast.jsx';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const onSubmit = async (data) => {
    setApiError(null);
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      setToast({ message: 'Login successful!', type: 'success' });
      setTimeout(() => {
        navigate('/dashboard');
      }, 300);
    } catch (error) {
      if (error.response) {
        setApiError(error.response.data.error);
      } else {
        setApiError('Connection error. Please check your network.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card>
        <div className="space-y-6">
          {/* Heading */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="text-[#A3A3A3] mt-2">
              Sign in to your EcoSphere account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              register={register}
            />

            <PasswordInput
              label="Password"
              name="password"
              placeholder="Enter your password"
              error={errors.password?.message}
              register={register}
            />

            {/* Forgot Password link */}
            <div className="text-right">
              <a
                href="#"
                className="text-sm text-white hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            {/* API Error */}
            {apiError && (
              <p className="text-[#F87171] text-sm text-center">{apiError}</p>
            )}

            {/* Submit Button */}
            <Button type="submit" loading={isLoading}>
              Login
            </Button>
          </form>

          {/* Divider */}
          <div className="h-px bg-[#2A2A2A]" />

          {/* Signup Link */}
          <p className="text-center text-[#A3A3A3] text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-white hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </Card>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AuthLayout>
  );
}
