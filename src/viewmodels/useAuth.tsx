import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../services/firebase';
import type { UserProfile, UserRole } from '../models/user';
import { registerUser, loginUser, logoutUser, fetchUserProfile } from '../services/authService';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, pass: string, role: UserRole) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for demo stored user first
    const storedDemo = localStorage.getItem('krishi_sathi_demo_user');
    if (storedDemo) {
      try {
        const parsed = JSON.parse(storedDemo) as UserProfile;
        setUserProfile(parsed);
      } catch (e) {
        console.error('Demo auth parse error:', e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        const profile = await fetchUserProfile(fbUser.uid);
        if (profile) {
          setUserProfile(profile);
        }
      } else {
        const stored = localStorage.getItem('krishi_sathi_demo_user');
        if (stored) {
          setUserProfile(JSON.parse(stored));
        } else {
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, pass: string, role: UserRole) => {
    setLoading(true);
    try {
      const profile = await registerUser(email, pass, role);
      setUserProfile(profile);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const profile = await loginUser(email, pass);
      setUserProfile(profile);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
