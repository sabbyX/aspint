"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import React from "react";
import {LogsIcon, ChartNoAxesColumnIncreasingIcon, ServerIcon, Settings2Icon, UserPlus2} from 'lucide-react'

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    setOpen?: (open: boolean) => void;
}

const items = [
    {
        title: "Status",
        icon: ChartNoAxesColumnIncreasingIcon,
        href: ["/status", "/"]
    },
    {
        title: "New Application",
        icon: UserPlus2,
        href: ["/autobook"],
    },
    {
        title: "View Instances",
        icon: ServerIcon,
        href: ["/instances"],
    },
    {
        title: "Logs",
        icon: LogsIcon,
        href: ["/internal-logs"],
    },
    {
        title: "Backend Control",
        icon: Settings2Icon,
        href: ["/backend-control"],
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
                    key={item.href[0]}
                    href={item.href[0]}
                    onClick={() => {
                        if (setOpen) setOpen(false);
                    }}
                    className={cn(
                        buttonVariants({ variant: "ghost" }),
                        item.href.includes(pathname)
                            ? "bg-muted hover:bg-muted"
                            : "hover:bg-muted/40",
                        "justify-start",
                        "font-semi-bold",
                        "w-[235px] pr-0"
                    )}
                >
                    <item.icon className="mr-2 w-4 h-4" />
                    <div className="mr-5">{item.title}</div>
                    <div className={`${item.href.includes(pathname) ? '' : 'hidden' } ml-auto w-[3px] h-[25px] rounded-t rounded-b bg-primary`} />
                </Link>
            ))}
        </nav>
    )
}