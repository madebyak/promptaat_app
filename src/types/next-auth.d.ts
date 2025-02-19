import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    image?: string | null;
    username?: string;
    isAdmin: boolean;
  }

  interface Session {
    user: {
      id: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      image?: string | null;
      username?: string;
      isAdmin: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    image?: string | null;
    username?: string;
    isAdmin: boolean;
  }
}
