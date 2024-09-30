import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/theme-provider";
import {SidebarNav} from "@/components/layout/sidenav";
import {TopBar} from '@/components/layout/top-bar'
import {Separator} from "@/components/ui/separator";
import {UserPlus2, Menu, LogsIcon, Settings2Icon} from "lucide-react";
import {Toaster} from "@/components/ui/toaster";
import {MobileSidebar} from "@/components/layout/mobilenav.";
import {cn} from "@/lib/utils";
import {useRouter} from "next/router";
import {Layout} from "@/components/layout/layout";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aspire Internal",
  description: "Internal service website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
    <body className={inter.className}>
    <Layout>{children}</Layout>
    </body>
    </html>
  );
}
