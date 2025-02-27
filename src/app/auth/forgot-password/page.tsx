'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { ReCAPTCHA } from '@/components/recaptcha';
import { useToast } from '@/components/ui/use-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  recaptchaToken: z.string().optional(),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string>();
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
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
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email.toLowerCase(),
          recaptchaToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process request');
      }

      setIsEmailSent(true);
      toast({
        title: 'Success',
        description: 'If an account exists with this email, you will receive password reset instructions.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to process request',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black_main">
      {/* Left Side - Form */}
      <div className="flex w-1/2 flex-col justify-center px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm text-light_grey hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Reset your password
            </h1>
            <p className="text-light_grey">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {!isEmailSent ? (
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

                <ReCAPTCHA onVerify={token => setRecaptchaToken(token)} />

                <Button
                  type="submit"
                  className="w-full h-12 main-gradient hover:bg-white hover:main-gradient-text transition-all mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send reset instructions'}
                </Button>
              </form>
            </Form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-lg bg-dark_grey p-6 text-center"
            >
              <div className="mx-auto mb-4 h-12 w-12 text-green-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">Check your email</h3>
              <p className="text-light_grey">
                If an account exists with this email address, we've sent instructions to reset your
                password.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setIsEmailSent(false);
                  form.reset();
                }}
              >
                Try another email
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Right Side - Image */}
      <div className="relative hidden w-1/2 lg:block">
        <div className="absolute inset-0 bg-gradient-to-r from-black_main to-transparent z-10" />
        <Image
          src="/auth-bg.jpg"
          alt="Authentication background"
          className="h-full w-full object-cover"
          width={1000}
          height={1000}
          priority
        />
      </div>
    </div>
  );
}
