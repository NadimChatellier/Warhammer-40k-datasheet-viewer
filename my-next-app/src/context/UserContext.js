import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import supabase from '../src/lib/supabase'; // Assuming supabase is initialized in this file

// Create the context
const UserContext = createContext();

// Custom hook to use the context
export const useUser = () => useContext(UserContext);

// UserContext provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session = supabase.auth.session();
    if (session?.user) {
      setUser(session.user);
    }
    setLoading(false);

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.unsubscribe();
    };
  }, []);

  // Optionally, redirect if there's no user when page loads
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');  // Redirect to login page if no user is found
    }
  }, [loading, user, router]);

  if (loading) return <div>Loading...</div>; // or some loading spinner

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
