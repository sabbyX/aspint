"use client"

import {ModeToggle} from "@/components/themeToggle";

import React from "react";
import {Button} from "@/components/ui/button";
import {LogOutIcon} from "lucide-react";
import {logOut} from "@/app/actions/authActions";

export function TopBar() {
    return (
        <div className="hidden md:flex md:flex-row py-2 p-2 pl-6 bg-muted/50 items-center overflow-x-auto">
            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Aspire Internal</h2>
            <div className="ml-auto">
                <ModeToggle />
            </div>
            <div className="ml-2">
                <Button variant="ghost" size="icon" onClick={() => logOut()}>
                    <LogOutIcon className="h-4 w-4"/>
                </Button>
            </div>
        </div>
    )
}
