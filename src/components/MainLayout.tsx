import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarToggle } from "@/components/ui/SidebarToggle";
import { AppSidebar } from "@/components/AppSidebar";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 md:h-16 border-b border-border flex items-center justify-between px-4 md:px-6 bg-gradient-to-r from-[#001BB7] to-purple-600">
            <SidebarToggle />
            <LogoutButton onClick={handleLogout} />
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: location.pathname === '/dashboard' ? 0 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: location.pathname === '/dashboard' ? 0 : -20 }}
                transition={{ 
                  duration: location.pathname === '/dashboard' ? 0.8 : 0.3, 
                  ease: location.pathname === '/dashboard' ? "easeOut" : "easeInOut" 
                }}
                className="w-full h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
