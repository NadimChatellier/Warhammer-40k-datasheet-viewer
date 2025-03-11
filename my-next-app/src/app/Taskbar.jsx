"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, ChevronDown, LogOut, List } from "lucide-react";
import supabase from "../../src/lib/supabase";

export default function Taskbar() {
  const [userEmail, setUserEmail] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUserEmail(session.user.email);
      }
    };

    getUser();

    // Listen to authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUserEmail(session?.user?.email ?? null);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    setIsDropdownOpen(false);
  };

  return (
    <div className="absolute top-0 right-0 p-2 flex items-center space-x-4">
      {userEmail ? (
        <div className="relative">
          {/* Profile Button */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
          >
            <User size={20} className="mr-2" />
            {userEmail}
            <ChevronDown size={16} className="ml-2" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-900 text-white rounded-lg shadow-lg py-2">
              <Link href="/armyLists">
                <div className="flex items-center px-4 py-2 hover:bg-gray-700 cursor-pointer">
                  <List size={18} className="mr-2" />
                  View Army Lists
                </div>
              </Link>

              <div
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 hover:bg-red-600 cursor-pointer"
              >
                <LogOut size={18} className="mr-2" />
                Sign Out
              </div>
            </div>
          )}
        </div>
      ) : (
        <Link href="/signIn">
          <Button className="bg-green-500 text-white hover:bg-green-600 flex items-center">
            <User size={20} />
            <span className="ml-2">Sign In</span>
          </Button>
        </Link>
      )}
    </div>
  );
}
