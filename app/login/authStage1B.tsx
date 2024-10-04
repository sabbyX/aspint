import React, {ChangeEvent, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {IAppDispatch, IRootState} from "@/components/store";
import {authStage, invalidCredentialAlert} from "@/components/store/rootSlice";
import {cn} from "@/lib/utils";
import {z} from 'zod'
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {LoaderCircleIcon, RefreshCcwIcon} from "lucide-react";
import {TooltipContent, TooltipProvider, TooltipTrigger, Tooltip} from "@/components/ui/tooltip";
import { authenticateType1, redirectToHome } from "@/app/actions/authActions";
import {Form, FormItem, FormField, FormMessage, FormControl} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

const FormSchema = z.object({
    password: z.string()
        .min(1, "Password is required")
})

interface AuthStage1BProps extends React.HTMLAttributes<HTMLDivElement> {}
export function AuthStage1B({ className, ...props }: AuthStage1BProps) {
    const dispatch = useDispatch<IAppDispatch>();
    const rAuthUsername = useSelector<IRootState, string>(state => state.AuthUsername);
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            password: ""
        }
    })

    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        setIsLoading(true)
        const isAuth = await authenticateType1(rAuthUsername, data.password);
        if (!isAuth) {
            dispatch(invalidCredentialAlert(true))
            dispatch(authStage(1))
        } else await redirectToHome()
        setIsLoading(false)
    }

    return (
        <TooltipProvider>
            <div className={cn("grid gap-6", className)} {...props}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid gap-2">
                            <div className="grid gap-1">
                                <div className="flex">
                                    <Label className="sr-only" htmlFor="email">
                                        Email
                                    </Label>
                                    <Input
                                        value={rAuthUsername}
                                        disabled={true}
                                        required
                                    />
                                    <div className="ml-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button type="button"
                                                        variant="outline"
                                                        onClick={(_) => {
                                                            dispatch(authStage(1))
                                                        }}
                                                >
                                                    <RefreshCcwIcon className="h-4 w-4"/>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Change Email</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormMessage />
                                            <FormControl>
                                                <Input {...field}  placeholder="password" autoFocus/>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && (
                                    <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Sign In
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </TooltipProvider>
    )
}
