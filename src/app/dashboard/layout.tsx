"use client";

import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex">
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <main className="w-full">
            <Navbar />
            <div className="px-4">{children}</div>
          </main>
        </SidebarProvider>
      </div>
    </ProtectedRoute>
  );
}

