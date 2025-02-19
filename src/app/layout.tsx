import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Navbar } from '@/components/navbar';
import { AuthProvider } from '@/components/auth-provider';
import { PortalProvider } from '@/components/portal-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Promptaat',
  description: 'Your AI Prompt Library',
};

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <PortalProvider />
            <div className="relative min-h-screen bg-black isolate">
              <Navbar />
              <div className="pt-16">
                {children}
              </div>
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

export default RootLayout;
