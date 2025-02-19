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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsEmailSent(true);
    console.log(data);
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 main-gradient hover:bg-white hover:main-gradient-text transition-all mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Sending instructions...</span>
                    </div>
                  ) : (
                    'Send instructions'
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-lg border border-mid_grey bg-dark_grey/50 p-6 text-center"
            >
              <div className="mx-auto mb-4 h-12 w-12 rounded-full main-gradient flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Check your email</h3>
              <p className="text-light_grey mb-4">
                We've sent password reset instructions to your email address. Please check your inbox.
              </p>
              <Button
                variant="outline"
                className="text-white bg-dark_grey border-mid_grey hover:bg-mid_grey hover:text-white"
                onClick={() => setIsEmailSent(false)}
              >
                Try another email
              </Button>
            </motion.div>
          )}
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
