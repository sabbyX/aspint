import {useDispatch, useSelector} from "react-redux";
import {authCode, authStage, authUsername} from '@/components/store/rootSlice';
import {IRootState, IAppDispatch} from "@/components/store";
import {ChangeEvent, HTMLAttributes, useEffect, useState} from "react";
import { cn } from "@/lib/utils";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {LoaderCircleIcon, RectangleEllipsis} from "lucide-react";
import * as React from "react";

interface AuthCodeStageInterface extends HTMLAttributes<HTMLDivElement> {}
export function AuthCodeStage({className, ...props}: AuthCodeStageInterface) {
    const rAuthCode = useSelector<IRootState, string>(state => state.AuthCode);
    const [formData,setFormData] = useState({
        authcode: rAuthCode || "",
    })
    const dispatch = useDispatch<IAppDispatch>();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        })
    }

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
            dispatch(
                authCode(formData.authcode)
            )
        }
    }, [formData, isSubmitted, dispatch]);

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form onSubmit={onSubmit}>
                <div className="grid gap-2">
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="authcode">
                            Email
                        </Label>
                        <Input
                            id="authcode"
                            placeholder="Enter your auth code"
                            type="password"
                            name="authcode"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                            onChange={handleChange}
                            value={formData.authcode}
                            required
                        />
                    </div>
                    <Button disabled={isLoading} onClick={() => setIsSubmitted(true)}>
                        {isLoading && (
                            <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Authenticate
                    </Button>
                </div>
            </form>
        </div>
    )
}
