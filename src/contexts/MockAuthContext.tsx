import React, { createContext, useContext, useState, ReactNode } from 'react';

// Mock user data structure matching Clerk's format
interface MockUser {
  id: string;
  emailAddresses: { emailAddress: string }[];
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  createdAt?: string;
}

interface MockAuthContextType {
  user: MockUser | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoaded: boolean;
  signIn: () => void;
  signOut: () => void;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export const MockAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Start authenticated for development
  const [isLoaded, setIsLoaded] = useState(true);

  const mockUser: MockUser = {
    id: 'mock-user-123',
    emailAddresses: [{ emailAddress: 'developer@example.com' }],
    firstName: 'Demo',
    lastName: 'User',
    fullName: 'Demo User',
    imageUrl: undefined,
    createdAt: new Date().toISOString()
  };

  const signIn = () => {
    setIsAuthenticated(true);
  };

  const signOut = () => {
    setIsAuthenticated(false);
  };

  return (
    <MockAuthContext.Provider value={{
      user: isAuthenticated ? mockUser : null,
      userId: isAuthenticated ? mockUser.id : null,
      isAuthenticated,
      isLoaded,
      signIn,
      signOut
    }}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};

// Mock components to replace Clerk components
export const MockUserButton: React.FC = () => {
  const { signOut } = useMockAuth();
  
  return (
    <div className="relative">
      <button 
        onClick={signOut}
        className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm hover:bg-blue-600 transition-colors"
        title="Demo User - Click to sign out"
      >
        D
      </button>
    </div>
  );
};

export const MockSignedIn: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useMockAuth();
  return isAuthenticated ? <>{children}</> : null;
};

export const MockSignedOut: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useMockAuth();
  return !isAuthenticated ? <>{children}</> : null;
};