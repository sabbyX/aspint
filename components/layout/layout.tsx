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


const NavBarAllowedRoutes = ["/autobook"]


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
        <div className="md:block">
            <TopBar/>
            <Separator/>
            <div className="flex flex-col lg:flex-row">
                <div className={cn("block md:!hidden")}>
                    <MobileSidebar/>
                </div>
                <aside className="hidden lg:w-[200px] p-2 bg-muted/50 md:flex flex-col lg:flex-row">
                    <SidebarNav/>
                </aside>
                <Separator className="lg:h-[calc(100vh-50px)]" orientation="vertical"/>
                <div className="flex-1 p-5 overflow-auto">
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem
                        disableTransitionOnChange
                    >
                        {children}
                        <Toaster/>
                    </ThemeProvider>
                </div>
            </div>
        </div>
    )
}
