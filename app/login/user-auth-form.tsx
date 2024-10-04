"use client"

import * as React from "react"

import { useSelector } from 'react-redux';
import {IRootState} from "@/components/store";

import {AuthStage1A} from "@/app/login/authStage1A";
import {AuthStage1B} from "@/app/login/authStage1B";
import {AuthCodeStage} from '@/app/login/authStage.alt';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}
export function UserAuthForm({ className, ...props }: UserAuthFormProps) {

    const authStage = useSelector<IRootState, number>(state => state.AuthStage);

    let children = (
        <>
        You shouldn&apos;t see this. Something went wrong! Contact Developer
        </>
    );
    let context_text = "{context}";
    switch (authStage) {
        case 1:
            children = <AuthStage1A />;
            context_text = "Enter your Email below to login";
            break;
        case 2:
            context_text = "Enter your password below to login";
            children = <AuthStage1B />;
            break;
        case 3:
            context_text = "Enter auth code you've received below to login";
            children = <AuthCodeStage />;
            break;
    }

    return (
        <div className="lg:p-8">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Login
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {context_text}
                    </p>
                </div>
                {children}
            </div>
        </div>
    )
}