import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase';

const AuthContext = createContext(null);
const LEGACY_LOCAL_STORAGE_KEY = 'agriprice_auth_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [error, setError] = useState(null);

  useEffect(() => {
    // Demo access should never bypass the login screen after a reload.
    localStorage.removeItem(LEGACY_LOCAL_STORAGE_KEY);

    // 2. If Firebase is configured and auth exists, subscribe to auth state changes
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Agri User',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || null,
            isGuest: false
          });
        } else {
          setUser(null);
        }
      });
      return unsubscribe;
    } else {
      // Firebase not configured - show login until a demo role is selected.
      setUser(null);
    }
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      setError('Firebase keys are not configured in your .env file. You can continue instantly using Demo Mode below.');
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user) {
        setUser({
          uid: result.user.uid,
          displayName: result.user.displayName || 'Agri Trader',
          email: result.user.email || '',
          photoURL: result.user.photoURL || null,
          isGuest: false
        });
      }
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        // User intentionally cancelled
        return;
      }
      if (err.code === 'auth/unauthorized-domain') {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
        setError(`This domain "${currentHost}" is not authorized in your Firebase Console. Go to Firebase Console > Authentication > Settings > Authorized domains and add "${currentHost}".`);
      } else if (err.code === 'auth/invalid-api-key' || err.code === 'auth/api-key-not-found') {
        setError('Invalid Firebase API key. Please check your .env file or use Demo Mode.');
      } else {
        setError(err.message || 'Failed to sign in with Google');
      }
    }
  };

  const signInAsGuest = (role = 'Trader') => {
    setError(null);
    const guestUser = {
      uid: 'guest-' + Date.now(),
      displayName: role === 'Analyst' ? 'Market Analyst' : 'Agri Trader (Demo)',
      email: role === 'Analyst' ? 'analyst@agriprice.ai' : 'trader@agriprice.ai',
      photoURL: null,
      isGuest: true,
      role: role
    };

    setUser(guestUser);
  };

  const logout = async () => {
    setError(null);
    localStorage.removeItem(LEGACY_LOCAL_STORAGE_KEY);
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        error, 
        isFirebaseConfigured, 
        signInWithGoogle, 
        signInAsGuest, 
        logout,
        clearError 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
