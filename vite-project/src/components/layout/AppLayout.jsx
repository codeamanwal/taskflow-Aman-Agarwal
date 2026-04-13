import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, CheckCircle2, Sun, Moon, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const navItems = [
  { name: "Projects", path: "/", icon: LayoutDashboard },
];

const SidebarContent = ({ user, handleLogout, setIsSidebarOpen, location }) => (
  <>
    <div className="h-16 flex items-center justify-between px-6 border-b border-border">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold tracking-tight">TaskFlow</span>
      </div>
      <button 
        onClick={() => setIsSidebarOpen(false)}
        className="lg:hidden p-2 rounded-md hover:bg-secondary text-muted-foreground"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
    
    <div className="flex-1 py-6 px-4 flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (location.pathname.startsWith('/projects/') && item.path === '/');
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold ${
              isActive 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </div>

    <div className="p-4 border-t border-border">
      <div className="flex items-center gap-3 px-3 py-2.5 mb-2 bg-secondary/50 rounded-2xl border border-border/50">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-bold leading-none truncate">{user?.name}</span>
          <span className="text-[10px] text-muted-foreground truncate">{user?.email}</span>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors mt-2"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  </>
);

export function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);

  // Close sidebar on route change (for mobile)
  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    setIsSidebarOpen(false);
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 border-r border-border bg-card flex-col shadow-sm z-20">
        <SidebarContent 
          user={user} 
          handleLogout={handleLogout} 
          setIsSidebarOpen={setIsSidebarOpen} 
          location={location} 
        />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-card border-r border-border z-50 lg:hidden flex flex-col shadow-2xl"
            >
              <SidebarContent 
                user={user} 
                handleLogout={handleLogout} 
                setIsSidebarOpen={setIsSidebarOpen} 
                location={location} 
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 via-transparent to-transparent -z-10 pointer-events-none" />
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-30 transition-all">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-border bg-background/50 hover:bg-secondary transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hidden sm:block">
              {location.pathname === "/" ? "Workspace Dashboard" : "Project Infrastructure"}
            </h1>
            <h1 className="text-xs font-bold sm:hidden">
              {location.pathname === "/" ? "Dashboard" : "Workspace"}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-secondary transition-all border border-border bg-background/50 shadow-sm active:scale-95 group"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              ) : (
                <Sun className="h-4 w-4 group-hover:rotate-45 transition-transform" />
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
          <motion.div 
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-7xl mx-auto pb-20 md:pb-8"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
