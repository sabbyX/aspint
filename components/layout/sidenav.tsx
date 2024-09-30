"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import React from "react";
import {LogsIcon, LucideIcon, ServerIcon, Settings2Icon, UserPlus2} from 'lucide-react'

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    setOpen?: (open: boolean) => void;
}

const items = [
    {
        title: "New Application",
        icon: UserPlus2,
        href: "/autobook",
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

export function SidebarNav({ className, setOpen, ...props }: SidebarNavProps) {
    const pathname = usePathname()

    return (
        <nav
            className={cn(
                "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
                className
            )}
            {...props}
        >
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                        if (setOpen) setOpen(false);
                    }}
                    className={cn(
                        buttonVariants({ variant: "ghost" }),
                        pathname === item.href
                            ? "bg-muted hover:bg-muted"
                            : "hover:bg-muted/40",
                        "justify-start",
                        "font-semi-bold"
                    )}
                >
                    <item.icon className="mr-2 w-4 h-4" />
                    {item.title}

                </Link>
            ))}
        </nav>
    )
}