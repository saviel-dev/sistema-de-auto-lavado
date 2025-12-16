import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  IoSpeedometerOutline,
  IoCarSportOutline,
  IoLayersOutline,
  IoSwapHorizontalOutline,
  IoCashOutline,
  IoCalendarOutline,
  IoPeopleOutline,
  IoSettingsOutline,
  IoBarChartOutline,
  IoFlaskOutline,
  IoCubeOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";

// Define menu structure with potential support for subgroups
type MenuItem = {
  title: string;
  url?: string;
  icon?: any;
  items?: {
    title: string;
    url: string;
    icon?: any;
  }[];
};

const menuStructure: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IoSpeedometerOutline,
  },
  {
    title: "Productos",
    icon: IoCubeOutline,
    items: [
      {
        title: "Inventario",
        url: "/inventory",
        icon: IoLayersOutline,
      },
      {
        title: "Insumos",
        url: "/consumables",
        icon: IoFlaskOutline,
      },
      {
        title: "Movimientos",
        url: "/movements",
        icon: IoSwapHorizontalOutline,
      }
    ]
  },
  {
    title: "Autolavado",
    icon: IoCarSportOutline,
    items: [
      {
        title: "Clientes",
        url: "/customers",
        icon: IoPeopleOutline,
      },
      {
        title: "Servicios",
        url: "/services",
        icon: IoCarSportOutline,
      },
      {
        title: "Pedidos",
        url: "/appointments",
        icon: IoCalendarOutline,
      }
    ]
  },
  {
    title: "POS",
    url: "/pos",
    icon: IoCashOutline,
  },
  {
    title: "Reportes",
    url: "/reports",
    icon: IoBarChartOutline,
  },
  {
    title: "Ajustes",
    url: "/settings",
    icon: IoSettingsOutline,
  },
];

import { useAuth } from "@/contexts/AuthContext";

export function AppSidebar() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const filteredItems = menuStructure.filter(item => {
    // Hide Settings for non-admins
    if (item.title === "Ajustes" && !isAdmin) {
        return false;
    }
    return true;
  });

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Autolavado Gochi
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => {
                const Icon = item.icon;
                
                // Render Group (Collapsible)
                if (item.items) {
                     // Check if any child is active to default open
                    const isChildActive = item.items.some(child => location.pathname === child.url);
                    
                    return (
                        <Collapsible key={item.title} defaultOpen={isChildActive} className="group/collapsible">
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip={item.title} className="w-full justify-between">
                                        <div className="flex items-center gap-2">
                                            {Icon && <Icon className="h-5 w-5" />}
                                            <span>{item.title}</span>
                                        </div>
                                        <IoChevronForwardOutline className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                    <SidebarMenuSub>
                                        {item.items.map((subItem) => {
                                            const SubIcon = subItem.icon;
                                            const isSubActive = location.pathname === subItem.url;
                                            return (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton asChild isActive={isSubActive}>
                                                        <NavLink to={subItem.url}>
                                                            {SubIcon && <SubIcon className="h-4 w-4 mr-2" />}
                                                            <span>{subItem.title}</span>
                                                        </NavLink>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            );
                                        })}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    );
                }

                // Render Single Item
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                      <NavLink to={item.url!} className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""}>
                        {Icon && <Icon className="h-5 w-5" />}
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
