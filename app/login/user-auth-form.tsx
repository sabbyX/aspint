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

    switch (authStage) {
        case 1:
            return <AuthStage1A />
        case 2:
            return <AuthStage1B />
        case 3:
            return <AuthCodeStage />
    }

    return (
        <>
        Unexpected Page. Contact Admin
        </>
    )
}