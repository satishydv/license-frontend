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
          <main className="w-full flex min-h-screen flex-col">
            <Navbar />
            <div className="px-4 flex-1 pb-16">{children}</div>
            <footer className="fixed bottom-0 left-0 right-0 bg-blue-50 text-gray-900 dark:bg-black dark:text-yellow-300 text-center py-3 z-0">
              Powered by Alibros Infotech Pvt Ltd
            </footer>
          </main>
        </SidebarProvider>
      </div>
    </ProtectedRoute>
  );
}

