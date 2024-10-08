"use client"

import {ModeToggle} from "@/components/themeToggle";

import React from "react";

export function TopBar() {
    return (
        <div className="hidden md:flex md:flex-row py-2 p-2 pl-6 bg-muted/50 items-center overflow-x-auto">
            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Aspire Internal</h2>
            <div className="ml-auto">
                <ModeToggle />
            </div>
        </div>
    )
}
