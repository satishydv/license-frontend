import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { UserProvider } from "@/contexts/UserContext";
import { CityProvider } from "@/contexts/CityContext";
import { VendorProvider } from "@/contexts/VendorContext";
import { DTOProvider } from "@/contexts/DTOContext";
import { PermissionProvider } from "@/contexts/PermissionContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <PermissionProvider>
              <RoleProvider>
                    <UserProvider>
                      <CityProvider>
                        <VendorProvider>
                          <DTOProvider>
                            {children}
                          </DTOProvider>
                        </VendorProvider>
                      </CityProvider>
                    </UserProvider>
              </RoleProvider>
            </PermissionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
