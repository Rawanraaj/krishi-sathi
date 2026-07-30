import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { UserProfile, UserRole } from '../models/user';

export async function registerUser(email: string, pass: string, role: UserRole): Promise<UserProfile> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const user = cred.user;
    
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      role: role,
      createdAt: new Date().toISOString(),
    };

    // Save user role in Firestore collection 'users' (doc id = user uid)
    await setDoc(doc(db, 'users', user.uid), {
      email: profile.email,
      role: profile.role,
      createdAt: profile.createdAt
    });

    return profile;
  } catch (error: any) {
    // If running in demo mode without live Firebase backend setup, create a local mock user profile
    if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/invalid-api-key' || error.message?.includes('api-key')) {
      const mockUid = 'demo-uid-' + Math.random().toString(36).substr(2, 9);
      const profile: UserProfile = {
        uid: mockUid,
        email,
        role,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('krishi_sathi_demo_user', JSON.stringify(profile));
      return profile;
    }
    throw error;
  }
}

export async function loginUser(email: string, pass: string): Promise<UserProfile> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const user = cred.user;
    const profile = await fetchUserProfile(user.uid);
    if (!profile) {
      // Fallback if doc didn't exist
      return {
        uid: user.uid,
        email: user.email || email,
        role: 'buyer', // default
        createdAt: new Date().toISOString()
      };
    }
    return profile;
  } catch (error: any) {
    if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/invalid-api-key' || error.message?.includes('api-key')) {
      const stored = localStorage.getItem('krishi_sathi_demo_user');
      if (stored) {
        return JSON.parse(stored) as UserProfile;
      }
      // Create demo user
      const profile: UserProfile = {
        uid: 'demo-uid-123',
        email,
        role: 'farmer',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('krishi_sathi_demo_user', JSON.stringify(profile));
      return profile;
    }
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.warn('Firebase signout error, clearing demo state:', error);
  }
  localStorage.removeItem('krishi_sathi_demo_user');
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid,
        email: data.email,
        role: data.role as UserRole,
        createdAt: data.createdAt
      };
    }
    return null;
  } catch (error) {
    const stored = localStorage.getItem('krishi_sathi_demo_user');
    if (stored) {
      const parsed = JSON.parse(stored) as UserProfile;
      if (parsed.uid === uid) return parsed;
    }
    return null;
  }
}
