'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
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
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { useRouter } from 'next/navigation';

type SignupFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: { value: string; label: any } | null;
  agreeToTerms: boolean;
};

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  country: z.object({
    value: z.string(),
    label: z.any(),
  }).nullable(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const countries = countryList().getData().map(country => ({
  value: country.value,
  label: (
    <div key={country.value} className="flex items-center space-x-2">
      <Image
        src={`https://flagcdn.com/w20/${country.value.toLowerCase()}.png`}
        alt={country.label}
        width={20}
        height={15}
      />
      <span>{country.label}</span>
    </div>
  ),
  searchLabel: country.label,
}));

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      country: null,
      agreeToTerms: false,
    },
  });

  const emailValue = form.watch('email');
  const emailError = form.formState.errors.email;
  
  useEffect(() => {
    console.log('Email field:', {
      value: emailValue,
      error: emailError?.message
    });
  }, [emailValue, emailError]);

  const formState = form.formState;
  console.log('Form State:', {
    isDirty: formState.isDirty,
    isValid: formState.isValid,
    errors: formState.errors,
  });

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log(`Field ${name} changed:`, {
        value,
        type,
        errors: form.formState.errors[name as keyof SignupFormValues],
      });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setIsLoading(true);
      
      // Clean the data
      const cleanEmail = data.email.toLowerCase().trim();
      
      const formData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: cleanEmail,
        password: data.password,
        country: data.country?.value || null,
      };

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to create account');
      }

      router.push(`/auth/verify-email?email=${encodeURIComponent(cleanEmail)}`);
    } catch (error: any) {
      console.error('Signup error:', error);
      form.setError('email', {
        type: 'server',
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const customSelectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: '#171717',
      borderColor: 'transparent',
      '&:hover': {
        borderColor: '#282828',
      },
      boxShadow: 'none',
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: '#171717',
      border: '1px solid #282828',
      position: 'absolute',
      width: '100%',
      zIndex: 50,
    }),
    menuList: (base: any) => ({
      ...base,
      maxHeight: '200px',
    }),
    option: (base: any, state: { isSelected: boolean; isFocused: boolean }) => ({
      ...base,
      backgroundColor: state.isSelected
        ? 'linear-gradient(to right, #0051ff, #7100fc)'
        : state.isFocused
        ? '#282828'
        : undefined,
      color: 'white',
      '&:active': {
        background: 'linear-gradient(to right, #0051ff, #7100fc)',
      },
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'white',
    }),
    input: (base: any) => ({
      ...base,
      color: 'white',
    }),
  };

  return (
    <div className="flex min-h-screen bg-black_main">
      <div className="flex w-1/2 flex-col justify-center px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Create an account
            </h1>
            <p className="text-light_grey">
              Join our community and start creating amazing prompts
            </p>
          </div>

          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit)} 
              className="space-y-4"
              noValidate 
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">First Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="John"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Doe"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                        className="bg-dark_grey border-[#1F1F1F] text-white h-12"
                        onChange={(e) => {
                          const value = e.target.value.trim();
                          field.onChange(value);
                        }}
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
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="relative mb-6">
                    <FormLabel>Country</FormLabel>
                    <Select
                      {...field}
                      options={countries}
                      styles={customSelectStyles}
                      placeholder="Select your country"
                      isSearchable={true}
                      filterOption={(option, input) => {
                        if (!input) return true;
                        const searchLabel = (option.data as any).searchLabel.toLowerCase();
                        return searchLabel.includes(input.toLowerCase());
                      }}
                      className="z-50"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-light_grey data-[state=checked]:bg-gradient-to-r from-[#0051ff] to-[#7100fc]"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm text-light_grey">
                        I agree to the{' '}
                        <Link href="/terms" className="text-white hover:underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-white hover:underline">
                          Privacy Policy
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <GradientButton
                type="submit"
                disabled={isLoading}
                className="h-12 text-base"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create account'
                )}
              </GradientButton>
            </form>
          </Form>

          <p className="text-center text-light_grey">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-white hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

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
