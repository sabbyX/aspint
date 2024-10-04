"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {RectangleEllipsis, LoaderCircleIcon, TriangleAlertIcon} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {ChangeEvent, useEffect, useState} from "react";
import { useSelector, useDispatch } from 'react-redux';
import { IRootState, IAppDispatch } from "@/components/store";
import {authStage, authUsername, invalidCredentialAlert} from "@/components/store/rootSlice";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}
export function AuthStage1A({ className, ...props }: UserAuthFormProps) {

    const dispatch = useDispatch<IAppDispatch>();
    const rAuthUsername = useSelector<IRootState, string>(state => state.AuthUsername);
    const invalidAlert = useSelector<IRootState, boolean>(state => state.InvalidCredentialAlert)
    const [formData,setFormData] = useState({
        username: rAuthUsername || "",
    })

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        })
    }

    // todo: validation, zod?

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)
        setIsSubmitted(true)
        setTimeout(() => {
            setIsLoading(false)
        }, 3000)
    }
    
    useEffect(() => {
        if (isSubmitted) {
            dispatch(authUsername(formData.username));
            dispatch(invalidCredentialAlert(false));
            dispatch(authStage(2));
        }
    }, [formData, isSubmitted, dispatch]);

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form onSubmit={onSubmit}>
                <div className="grid gap-2">
                    <Alert variant="destructive" hidden={!invalidAlert}>
                        <TriangleAlertIcon className="h-5, w-5"/>
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            Wrong Email or Password. Please try again.
                        </AlertDescription>
                    </Alert>
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="email">
                            Email
                        </Label>
                        <Input
                            id="email"
                            placeholder="example@example.com"
                            type="email"
                            name="username"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                            onChange={handleChange}
                            value={formData.username}
                            required
                        />
                    </div>
                    <Button disabled={isLoading} onClick={() => setIsSubmitted(true)}>
                        {isLoading && (
                            <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Sign In with Email
                    </Button>
                </div>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
                </div>
            </div>
            <Button variant="outline" type="button" disabled={isLoading} onClick={(e) => {dispatch(authStage(3))}}>
                {isLoading ? (
                    <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <RectangleEllipsis className="mr-2 h-4 w-4" />
                )}{" "}
                Auth Code [Manual]
            </Button>
        </div>
    )
}