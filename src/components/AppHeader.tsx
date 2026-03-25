import { Bell } from "lucide-react";

const AppHeader = () => (
  <header className="sticky top-0 z-50 bg-primary px-4 py-3 flex items-center justify-between shadow-md">
    <div className="flex items-center gap-2">
      <span className="text-2xl">🌾</span>
      <h1 className="text-xl font-extrabold text-primary-foreground tracking-tight">KisanAI</h1>
    </div>
    <button className="relative p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
      <Bell className="w-5 h-5 text-primary-foreground" />
      <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
    </button>
  </header>
);

export default AppHeader;
