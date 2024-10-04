import React, {ChangeEvent, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {IAppDispatch, IRootState} from "@/components/store";
import {authStage, invalidCredentialAlert} from "@/components/store/rootSlice";
import {cn} from "@/lib/utils";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {LoaderCircleIcon, RefreshCcwIcon} from "lucide-react";
import {TooltipContent, TooltipProvider, TooltipTrigger, Tooltip} from "@/components/ui/tooltip";
import { authenticateType1, redirectToHome } from "@/app/actions/authActions";

interface AuthStage1BProps extends React.HTMLAttributes<HTMLDivElement> {}
export function AuthStage1B({ className, ...props }: AuthStage1BProps) {
    const dispatch = useDispatch<IAppDispatch>();
    const rAuthUsername = useSelector<IRootState, string>(state => state.AuthUsername);
    const [formData, setFormData] = useState({
        password: "",
    });

    const handleChange= (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)
        const isAuth = await authenticateType1(rAuthUsername, formData.password);
        if (!isAuth) {
            dispatch(invalidCredentialAlert(true))
            dispatch(authStage(1))
        }
        setIsLoading(false)
        await redirectToHome();
    }

    return (
        <TooltipProvider>
            <div className={cn("grid gap-6", className)} {...props}>
                <form onSubmit={onSubmit}>
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
                                                    onClick={(e) => {
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
                            <Label className="sr-only" htmlFor="password">
                                Password
                            </Label>
                            <Input
                                className="animate-accordion-down"
                                id="password"
                                placeholder="password"
                                type="password"
                                name="password"
                                disabled={isLoading}
                                onChange={handleChange}
                                value={formData.password}
                                required
                                autoFocus
                            />
                        </div>
                        <Button type="submit"
                                disabled={isLoading}
                                onClick={onSubmit}>
                            {isLoading && (
                                <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Sign In
                        </Button>
                    </div>
                </form>
            </div>
        </TooltipProvider>
    )
}
