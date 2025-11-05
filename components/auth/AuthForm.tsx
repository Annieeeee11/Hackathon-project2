'use client';

import { useState, FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthFormData, SignUpFormData } from '@/lib/types';
import { Button } from '@/components/ui/Button';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSuccess?: () => void;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [formData, setFormData] = useState<AuthFormData | SignUpFormData>({
    email: '',
    password: '',
    ...(mode === 'signup' && { confirmPassword: '' }),
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSignupSuccess(false);
    setLoading(true);

    if (mode === 'signup') {
      const signupData = formData as SignUpFormData;
      if (signupData.password !== signupData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        
        if (onSuccess) {
          onSuccess();
        } else {
          const redirect = searchParams.get('redirect') || '/dashboard';
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('nav-token', 'valid');
            sessionStorage.setItem('nav-time', Date.now().toString());
            document.cookie = `nav-token=valid; path=/; max-age=5; SameSite=Lax`;
          }
          router.push(redirect);
          router.refresh();
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        setSignupSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold mb-2 text-black">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-black/60">
          {mode === 'login' ? 'Sign in to continue' : 'Start your journey today'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2 text-black">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-lg border-2 border-black/20 bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-black transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-black">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            minLength={6}
            className="w-full px-4 py-3 rounded-lg border-2 border-black/20 bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-black transition-colors"
          />
        </div>
        
        {mode === 'signup' && (
          <div>
            <label className="block text-sm font-medium mb-2 text-black">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={(formData as SignUpFormData).confirmPassword || ''}
              onChange={handleChange}
              required
              placeholder="••••••••"
              minLength={6}
              className="w-full px-4 py-3 rounded-lg border-2 border-black/20 bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-black transition-colors"
            />
          </div>
        )}
        
        {error && (
          <div className="p-3 rounded-lg bg-black/5 border-2 border-black/20">
            <p className="text-sm text-black">{error}</p>
          </div>
        )}
        
        {signupSuccess && mode === 'signup' && (
          <div className="p-4 rounded-lg bg-green-50 border-2 border-green-200">
            <p className="text-sm text-green-800 font-medium">
              Account created successfully! Please check your email to verify.
            </p>
          </div>
        )}
        
        <Button
          type="submit"
          disabled={loading}
          variant="primary"
          className="w-full rounded-lg bg-black hover:bg-black/90 focus:ring-black"
        >
          {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-black/60">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <Button
                type="button"
                variant="text"
                onClick={() => {
                  // This will be handled by the parent component
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('switchToSignup'));
                  }
                }}
                className="text-black hover:underline p-0 h-auto"
              >
                Sign up
              </Button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Button
                type="button"
                variant="text"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('switchToLogin'));
                  }
                }}
                className="text-black hover:underline p-0 h-auto"
              >
                Sign in
              </Button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
