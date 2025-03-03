"use client";

import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "../../src/lib/supabase";

export default function Taskbar() {
  const [userEmail, setUserEmail] = useState(null);

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

    // Optional: Listen to authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUserEmail(session?.user?.email ?? null);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <div className="absolute top-0 right-0 text-white p-2 flex items-right shadow-lg">
      <div>
        {userEmail ? (
          <span >{userEmail}</span>
        ) : (
          <Link href="/signIn">
            <Button
              variant="ghost"
              className="absolute top-0 right-0 bg-green-500 text-white hover:bg-green-600"
            >
              <User size={24} />
              <span className="ml-2">Sign In</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}