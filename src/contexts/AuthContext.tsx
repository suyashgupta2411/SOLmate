import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import toast from 'react-hot-toast';

interface UserProfile {
  uid: string;
  email: string;
  username: string;
  bio: string;
  interests: string[];
  connectedWallet?: string;
  joinDate: Date;
  studyGroupsJoined: string[];
  totalTipsSent: number;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile({ ...userDoc.data(), uid: user.uid } as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Successfully logged in!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        username,
        bio: '',
        interests: [],
        joinDate: new Date(),
        studyGroupsJoined: [],
        totalTipsSent: 0,
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      setUserProfile(userProfile);
      
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, create if not
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          username: user.displayName || 'User',
          bio: '',
          interests: [],
          joinDate: new Date(),
          studyGroupsJoined: [],
          totalTipsSent: 0,
        };
        
        await setDoc(doc(db, 'users', user.uid), userProfile);
        setUserProfile(userProfile);
      }
      
      toast.success('Successfully logged in with Google!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      await setDoc(doc(db, 'users', user.uid), data, { merge: true });
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}