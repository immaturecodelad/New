import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, signInWithGoogle as fbSignIn, signOutUser as fbSignOut, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import { UserProfile, UserRole } from '../types/index.ts';
import { generateRandomAlias } from '../utils/alias.ts';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isTeacher: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateAlias: (newAlias: string) => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoRoleOverride, setDemoRoleOverride] = useState<UserRole | null>(null);

  // Check role with server allowlist
  const fetchServerRole = async (email: string): Promise<UserRole> => {
    try {
      const res = await fetch('/api/auth/verify-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        const data = await res.json();
        return data.role as UserRole;
      }
    } catch (e) {
      console.warn('Could not contact role verification API:', e);
    }
    return 'student';
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setError(null);
      if (currentUser) {
        setUser(currentUser);
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);

          // Check server allowlist for role
          const verifiedRole = await fetchServerRole(currentUser.email || '');

          if (userSnap.exists()) {
            const data = userSnap.data();
            const currentProfile: UserProfile = {
              id: currentUser.uid,
              name: data.name || currentUser.displayName || 'College Scholar',
              email: data.email || currentUser.email || '',
              // Server allowlist overrides or current DB role
              role: verifiedRole !== 'student' ? verifiedRole : (data.role || 'student'),
              alias: data.alias || generateRandomAlias(),
              createdAt: data.createdAt || new Date().toISOString()
            };
            setProfile(currentProfile);

            // If server allowlist upgraded role, sync it
            if (verifiedRole !== 'student' && data.role !== verifiedRole) {
              await setDoc(userRef, { role: verifiedRole }, { merge: true });
            }
          } else {
            // New user registration
            const newAlias = generateRandomAlias();
            const newProfile: UserProfile = {
              id: currentUser.uid,
              name: currentUser.displayName || 'College Scholar',
              email: currentUser.email || '',
              role: verifiedRole,
              alias: newAlias,
              createdAt: new Date().toISOString()
            };

            await setDoc(userRef, {
              name: newProfile.name,
              email: newProfile.email,
              role: 'student', // Initial Firestore create adheres to student role
              alias: newProfile.alias,
              createdAt: newProfile.createdAt
            });

            if (verifiedRole !== 'student') {
              // Upgraded if present on allowlist
              await setDoc(userRef, { role: verifiedRole }, { merge: true });
            }

            setProfile(newProfile);
          }
        } catch (err) {
          console.error('Failed to load user profile from Firestore:', err);
          // If firestore read had an issue, fallback to basic profile
          setProfile({
            id: currentUser.uid,
            name: currentUser.displayName || 'Scholar',
            email: currentUser.email || '',
            role: 'student',
            alias: generateRandomAlias(),
            createdAt: new Date().toISOString()
          });
        }
      } else {
        // Guest / Demo student profile for testing before sign-in
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      setError(null);
      await fbSignIn();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign in failed';
      setError(msg);
      throw err;
    }
  };

  const signOut = async () => {
    setDemoRoleOverride(null);
    await fbSignOut();
  };

  const updateAlias = async (newAlias: string) => {
    if (!profile) return;
    const clean = newAlias.trim();
    if (!clean || clean.length > 50) return;

    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { alias: clean }, { merge: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
    setProfile(prev => prev ? { ...prev, alias: clean } : null);
  };

  // Demo switch for reviewer convenience
  const switchDemoRole = (role: UserRole) => {
    setDemoRoleOverride(role);
    if (!profile) {
      setProfile({
        id: `demo_${role}_user`,
        name: role === 'teacher' ? 'Prof. David Vance' : (role === 'admin' ? 'Admin Officer' : 'Student Reviewer'),
        email: role === 'teacher' ? 'faculty@doubtmate.edu' : (role === 'admin' ? 'admin@doubtmate.edu' : 'student@college.edu'),
        role,
        alias: generateRandomAlias(),
        createdAt: new Date().toISOString()
      });
    } else {
      setProfile(prev => prev ? { ...prev, role } : null);
    }
  };

  const effectiveRole: UserRole = demoRoleOverride || profile?.role || 'student';
  const isTeacher = effectiveRole === 'teacher' || effectiveRole === 'admin';
  const isAdmin = effectiveRole === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: effectiveRole,
        isTeacher,
        isAdmin,
        loading,
        error,
        signIn,
        signOut,
        updateAlias,
        switchDemoRole,
        isDemoMode: Boolean(demoRoleOverride || !user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
