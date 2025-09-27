"use client";

import {
  Home,
  User2,
  ChevronUp,
  Users,
  Group,
  LogOut,
  File,
  CardSim,
  Package,
  CircleCheck,
  Gauge,
  FileText,
  ChevronDown,
  DollarSign,
  CreditCard,
  User,
  Building2,
} from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
} from "./ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    permission: null, // No permission required for dashboard
  },
  {
    title: "Roles",
    url: "/dashboard/roles",
    icon: Group,
    permission: "roles:read",
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
    permission: "users:read",
  },
  {
    title: "city",
    url: "/dashboard/city",
    icon: Building2,
    permission: null, // No permission required for search
  },
  {
    title: "Apply",
    url: "/dashboard/apply",
    icon: File,
    permission: null, // No permission required for search
  },
  {
    title: "Light to Heavy",
    url: "/dashboard/light-heavy",
    icon: CardSim,
    permission: null, // No permission required for search
  },
  {
    title: "Direct Heavy",
    url: "/dashboard/direct-heavy",
    icon: Package,
    permission: null, // No permission required for search
  },
  {
    title: "Light License or Renewal",
    url: "/dashboard/light-renewal",
    icon: Gauge,
    permission: null, // No permission required for search
  },
  {
    title: "Correction",
    url: "/dashboard/correction",
    icon: CircleCheck,
    permission: null, // No permission required for search
  },
];

const reportSubItems = [
  {
    title: "Total Income",
    url: "/dashboard/total-report",
    icon: DollarSign,
    permission: null,
  },
  {
    title: "Dues",
    url: "/dashboard/due-report",
    icon: CreditCard,
    permission: null,
  },
  {
    title: "Customer",
    url: "/dashboard/customer-report",
    icon: User,
    permission: null,
  },
];

const AppSidebar = () => {
  const { logout, user } = useAuth();
  const { hasPermission } = usePermissions();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Image src="/logo.png" alt="logo" width={30} height={30} />
                <span>License Management System</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                // Check if user has permission for this item
                if (item.permission && !hasPermission(item.permission)) {
                  return null; // Don't render this item
                }
                
                const isActive = pathname === item.url;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={isActive ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg" : ""}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.title === "Inbox" && (
                      <SidebarMenuBadge>24</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
              
              {/* Reports Collapsible Menu */}
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <FileText />
                      <span>Reports</span>
                      <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {reportSubItems.map((subItem) => {
                        const isSubActive = pathname === subItem.url;
                        
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton 
                              asChild
                              className={isSubActive ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg" : ""}
                            >
                              <Link href={subItem.url}>
                                <subItem.icon />
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
     
       
       
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {user?.name || 'Admin'} <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Account</DropdownMenuItem>
                <DropdownMenuItem>Setting</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
