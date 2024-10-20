"use client"

import {TopBar} from "@/components/layout/top-bar";
import {Separator} from "@/components/ui/separator";
import {cn} from "@/lib/utils";
import {MobileSidebar} from "@/components/layout/mobilenav.";
import {SidebarNav} from "@/components/layout/sidenav";
import {ThemeProvider} from "@/components/theme-provider";
import {Toaster} from "@/components/ui/toaster";
import {ReactNode} from "react";
import {usePathname} from "next/navigation";


const NavBarAllowedRoutes = ["/autobook", "/", "/status", "/instances"]


export function Layout({children}: Readonly<{
    children: ReactNode;
}>) {

    const pathname = usePathname();
    if (!NavBarAllowedRoutes.includes(pathname)) {
        return (
            <div className="overflow-auto">
                {children}
            </div>
        );
    }

    return (
        <div className="h-screen bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)] dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-slate-900 dark:to-black dark:text-white">
            <TopBar/>
            <Separator className="hidden md:block"/>
            <div className="flex flex-col lg:flex-row h-full md:h-[calc(100vh-55px)]">
                <div className={cn("block md:!hidden")}>
                    <MobileSidebar/>
                </div>
                <aside className="hidden lg:w-[250px] p-2 md:flex flex-col lg:flex-row">
                    <SidebarNav/>
                </aside>
                <Separator className="hidden lg:block lg:h-[calc(100vh-55px)]" orientation="vertical"/>
                <div className="flex-1 p-5 overflow-auto shadow-md">
                    {children}
                    <Toaster/>
                </div>
            </div>
        </div>
    )
}
