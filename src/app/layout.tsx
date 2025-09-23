import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { UserProvider } from "@/contexts/UserContext";
import { PermissionProvider } from "@/contexts/PermissionContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Driving License System",
  description: "Driving License Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <PermissionProvider>
            <RoleProvider>
              <UserProvider>
                {children}
              </UserProvider>
            </RoleProvider>
          </PermissionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
