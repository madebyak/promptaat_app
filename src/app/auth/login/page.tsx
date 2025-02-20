'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { signIn } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { GradientButton } from '@/components/ui/gradient-button';
import { ReCAPTCHA } from '@/components/recaptcha';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().default(false),
  recaptchaToken: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string>();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    if (!recaptchaToken) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please complete the reCAPTCHA verification',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email.toLowerCase(),
        password: data.password,
        isAdmin: 'false',
        recaptchaToken,
        redirect: false,
        callbackUrl: '/',
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });

      router.push('/');
      router.refresh();
    } catch (error: any) {
      form.setError('email', {
        type: 'manual',
        message: 'Invalid email or password',
      });
      form.setError('password', {
        type: 'manual',
        message: 'Invalid email or password',
      });

      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to login',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black_main">
      {/* Left Side - Login Form */}
      <div className="flex w-1/2 flex-col justify-center px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="text-light_grey">
              Enter your credentials to access your account
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="john@example.com"
                        className="h-12 bg-dark_grey text-white placeholder:text-light_grey form-input"
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        placeholder="Enter your password"
                        className="h-12 bg-dark_grey text-white placeholder:text-light_grey form-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between py-2">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="bg-dark_grey data-[state=checked]:main-gradient"
                        />
                      </FormControl>
                      <FormLabel className="text-sm text-light_grey">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <Link
                  href="/auth/forgot-password"
                  className="text-sm main-gradient-text hover:opacity-80 transition-opacity"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="w-full max-w-md">
                <GradientButton
                  type="submit"
                  disabled={isLoading}
                  className="h-12 text-base"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </GradientButton>
              </div>

              <ReCAPTCHA onVerify={token => setRecaptchaToken(token)} />

              <p className="text-center text-sm text-light_grey mt-4">
                Don't have an account?{' '}
                <Link
                  href="/auth/signup"
                  className="main-gradient-text hover:opacity-80 transition-opacity"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </Form>
        </motion.div>
      </div>

      {/* Right Side - Image */}
      <div className="relative w-1/2">
        <Image
          src="/desert_img_01.png"
          alt="Authentication background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black_main to-transparent" />
      </div>
    </div>
  );
}
