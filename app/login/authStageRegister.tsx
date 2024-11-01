"use client"

import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {LoaderCircleIcon, TriangleAlertIcon} from "lucide-react";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import * as React from "react";
import {Separator} from "@/components/ui/separator";
import {useState} from "react";
import {useDispatch} from "react-redux";
import {IAppDispatch} from "@/components/store";
import {authStage} from "@/components/store/rootSlice";

const FormSchema = z.object({
    name: z.string()
        .min(1, {message: "required"}),
    username: z.string()
        .email({message: "invalid email"}),
    password: z.string()
        .min(4, {message: "min 4 characters"}),
    confirmPassword: z.string(),
    perm: z.string()
        .optional(),
    nro: z.string(),
}).superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
        ctx.addIssue({
            code: "custom",
            message: "The passwords did not match",
            path: ['confirmPassword']
        });
    }
});

export default function AuthStageRegister() {
    const dispatch = useDispatch<IAppDispatch>();

    const [isLoading, setLoading] = useState(false);
    const [invalidAlert, setAlert] = useState(false);
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            perm: "standarduser",
            nro: "34d6f2d77ab23cf39ae9"
        }
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        setLoading(true)
        let jsonData = {
            username: data.username,
            name: data.name,
            password: data.password,
            perm: data.perm,
            nro: data.nro
        }
        const resp = await fetch("/api/register", {
            method: "POST",
            body: JSON.stringify(jsonData)
        })
        setLoading(false)
        if (!resp.ok) setAlert(true)
        else dispatch(authStage(1))
    }

    return (
        <div>
            <Button
                variant="ghost"
                className="absolute right-4 top-4 md:right-8 md:top-8"
                onClick={() => dispatch(authStage(1))}
            >
                Login
            </Button>
            <Alert variant="destructive" hidden={!invalidAlert}>
                <TriangleAlertIcon className="h-5 w-5"/>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Registration failed, contact admin
                </AlertDescription>
            </Alert>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid gap-2 mt-2">
                        <div className="grid gap-1">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormMessage />
                                        <FormControl>
                                            <Input placeholder="Name" {...field}/>
                                        </FormControl>
                                    </FormItem>
                                )} />
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormMessage />
                                        <FormControl>
                                            <Input placeholder="example@example.com" {...field}/>
                                        </FormControl>
                                    </FormItem>
                                )} />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormMessage />
                                        <FormControl>
                                            <Input placeholder="password" type="password" {...field}/>
                                        </FormControl>
                                    </FormItem>
                                )} />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormMessage />
                                        <FormControl>
                                            <Input placeholder="password" type="password" {...field}/>
                                        </FormControl>
                                    </FormItem>
                                )} />
                            <Separator className="my-5"/>
                            <FormField
                                control={form.control}
                                name="perm"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>perm</FormLabel>
                                        <FormMessage />
                                        <FormControl>
                                            <Input placeholder="perm" {...field}/>
                                        </FormControl>
                                    </FormItem>
                                )} />
                            <FormField
                                control={form.control}
                                name="nro"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>nro</FormLabel>
                                        <FormMessage />
                                        <FormControl>
                                            <Input placeholder="nro" {...field}/>
                                        </FormControl>
                                    </FormItem>
                                )} />
                        </div>
                        <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isLoading} className="mt-5">
                            {isLoading && (
                                <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Register
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
