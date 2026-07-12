import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth.js';
import AuthLayout from '../layouts/AuthLayout.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import Button from '../components/Button.jsx';
import Toast from '../components/Toast.jsx';

const signupSchema = z.object({
  full_name: z.string().min(1, "Full Name is required"),
  company_name: z.string().min(1, "Company Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string().min(1, "Confirm Password is required"),
  terms: z.literal(true, { errorMap: () => ({ message: "You must accept the Terms & Conditions" }) })
}).refine(data => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"]
});

export default function SignupPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onSubmit'
  });

  const { signup } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const onSubmit = async (data) => {
    setApiError(null);
    setIsLoading(true);
    try {
      await signup(data.full_name, data.company_name, data.email, data.password);
      setToast({ message: 'Account created successfully!', type: 'success' });
      navigate('/dashboard');
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
        <h1 className="text-2xl font-bold text-white text-center">Create Account</h1>
        <p className="text-[#A3A3A3] text-center mt-2">Join EcoSphere today</p>

        {apiError && (
          <p className="text-[#F87171] text-sm text-center mt-4">{apiError}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <Input
            label="Full Name"
            name="full_name"
            placeholder="Enter your full name"
            error={errors.full_name?.message}
            register={register}
          />
          <Input
            label="Company Name"
            name="company_name"
            placeholder="Enter your company name"
            error={errors.company_name?.message}
            register={register}
          />
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
            placeholder="Min. 8 characters"
            error={errors.password?.message}
            register={register}
          />
          <PasswordInput
            label="Confirm Password"
            name="confirm_password"
            placeholder="Confirm your password"
            error={errors.confirm_password?.message}
            register={register}
          />

          <div>
            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" className="mt-1" {...register('terms')} />
              <label htmlFor="terms" className="text-sm text-[#A3A3A3]">I accept the Terms & Conditions</label>
            </div>
            {errors.terms && (
              <p className="text-[#F87171] text-sm mt-1">{errors.terms.message}</p>
            )}
          </div>

          <Button type="submit" loading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className="my-6">
          <div className="h-px bg-[#2A2A2A]" />
        </div>

        <p className="text-center text-[#A3A3A3] text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </Card>

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
