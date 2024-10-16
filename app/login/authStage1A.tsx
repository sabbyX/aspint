"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { z } from 'zod';
import {RectangleEllipsis, LoaderCircleIcon, TriangleAlertIcon} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {ChangeEvent, useEffect, useState} from "react";
import { useSelector, useDispatch } from 'react-redux';
import { IRootState, IAppDispatch } from "@/components/store";
import {authStage, authUsername, invalidCredentialAlert} from "@/components/store/rootSlice";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";

const FormSchema = z.object({
    username: z.string()
        .min(1, "Username is required")
        .email("Not a valid username")
});

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}
export function AuthStage1A({ className, ...props }: UserAuthFormProps) {

    const dispatch = useDispatch<IAppDispatch>();
    const rAuthUsername = useSelector<IRootState, string>(state => state.AuthUsername);
    const invalidAlert = useSelector<IRootState, boolean>(state => state.InvalidCredentialAlert);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            username: rAuthUsername || "",
        }
    })


    const [isLoading, setIsLoading] = useState<boolean>(false);
    async function onSubmit(data: z.infer<typeof FormSchema>) {
        setIsLoading(true)
        dispatch(authUsername(data.username));
        dispatch(invalidCredentialAlert(false));
        dispatch(authStage(2));
        setIsLoading(false);
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid gap-2">
                        <Alert variant="destructive" hidden={!invalidAlert}>
                            <TriangleAlertIcon className="h-5 w-5"/>
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                Invalid Username or Password.
                            </AlertDescription>
                        </Alert>
                        <div className="grid gap-1">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormMessage />
                                        <FormControl>
                                            <Input placeholder="example@example.com" {...field}/>
                                        </FormControl>
                                    </FormItem>
                                )} />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && (
                                <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Sign In with Email
                        </Button>
                    </div>
                </form>
            </Form>
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
            <Button variant="outline" type="button" disabled onClick={(e) => {dispatch(authStage(3))}}>
                {isLoading ? (
                    <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <RectangleEllipsis className="mr-2 h-4 w-4" />
                )}{" "}
                Auth Code
            </Button>
        </div>
    )
}
