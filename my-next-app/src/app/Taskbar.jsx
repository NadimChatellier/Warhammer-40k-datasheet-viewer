import { Button } from "@/components/ui/button";
import { Home, Menu, User } from "lucide-react";

export default function Taskbar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg">
      {/* Menu Button */}
      <Button variant="ghost" className="text-white">
        <Menu size={24} />
      </Button>
      
      {/* Home Button */}
      <Button variant="ghost" className="text-white">
        <Home size={24} />
      </Button>
      
      {/* Sign In Button */}
      <Button variant="ghost" className="text-white">
        <User size={24} />
        <span className="ml-2">Sign In</span>
      </Button>
    </div>
  );
}