import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import Link from "next/link";
export default function Taskbar() {
  return (
    <div className="fixed top-5 right-5 w-full text-white p-2 flex justify-between items-center shadow-lg">

      {/* Right Side - System Tray */}
      <div className="flex space-x-4 items-center bg-gray-800 p-2 rounded-lg">
        {/* This button is absolutely positioned */}
        <Link href="/signIn">      
        <Button 
          variant="ghost" 
          className="absolute top-0 right-0 bg-green-500 text-white hover:bg-green-600"
        >
          <User size={24} />
           <span className="ml-2">Sign In</span>
        </Button>
        </Link>
      </div>
    </div>
  );
}



    