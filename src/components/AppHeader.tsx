import { Bell, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AppHeader = () => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  return (
    <header className="sticky top-0 z-50 bg-primary px-4 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🌾</span>
        <h1 className="text-xl font-extrabold text-primary-foreground tracking-tight">KisanAI</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
          <Bell className="w-5 h-5 text-primary-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
        </button>
        <button onClick={handleLogout} className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
          <LogOut className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
