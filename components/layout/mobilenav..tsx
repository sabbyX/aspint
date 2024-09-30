"use client"

import {LogsIcon, Menu, ServerIcon, Settings2Icon, UserPlus2} from "lucide-react";

const items = [
    {
        title: "New Application",
        icon: UserPlus2,
        href: "/",
    },
    {
        title: "View Instances",
        icon: ServerIcon,
        href: "/view-instances",
    },
    {
        title: "Logs",
        icon: LogsIcon,
        href: "/internal-logs",
    },
    {
        title: "Backend Control",
        icon: Settings2Icon,
        href: "/backend-control",
    },
]

import React, { useState, useEffect } from "react";
import { MenuIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/layout/sidenav";

export const MobileSidebar = () => {
    const [open, setOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <div className="py-4 md:py-2 p-2 pl-6 bg-muted/50 flex space-x-4 items-center">
                        <div className="md:hidden">
                            <Menu/>
                        </div>
                        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Aspire Internal</h2>
                    </div>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                    <div className="px-1 py-6 pt-16">
                        <SidebarNav className="flex-col" setOpen={setOpen}/>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
};
