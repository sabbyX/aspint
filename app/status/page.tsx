"use client"

import {UptimeBar} from '@/components/uptimeBar';
import {LoaderCircleIcon, RefreshCwIcon, RotateCwIcon, TriangleAlertIcon,} from 'lucide-react'
import emoji from 'react-easy-emoji'
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card"
import {Button} from "@/components/ui/button";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog"

import {Alert, AlertDescription, AlertTitle,} from "@/components/ui/alert"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {z} from "zod";
import {toast} from "@/components/ui/use-toast";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {listenerRestartAction} from "@/app/actions/freloadAction";
import {getCountryFlag} from "@/components/shared/utils";
import {useMediaQuery} from "usehooks-ts";
import {
    Drawer,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import {cn} from "@/lib/utils";
import * as React from "react";

const RLForm = z.object({
    center: z
        .string({
            required_error: "Please select the center to restart listener.",
        }),
})


export default function StatusPage() {
    const [isLoading, setLoading] = useState<boolean>(false);

    return (
        <TooltipProvider>
                <div>
                    <div className="mb-10 flex flex-row">
                        <h2 className="text-xl md:text-3xl font-semibold tracking-tight first:mt-0">
                            📈 Status
                        </h2>
                        <Button className="ml-auto" variant="ghost" onClick={() => {
                            window.location.reload();
                            setLoading(true);
                        }}>
                            <RotateCwIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Reload
                        </Button>
                    </div>
                    <div className="flex items-center xl:grid flex-col grid-cols-2 gap-10">
                        {statusCardGen("Belgium", [{centerCode: "gbLON2be", workerId: null}, {centerCode: "gbMNC2be", workerId: null}, {centerCode: "gbEDI2be", workerId: null}])}
                        {statusCardGen("France", [{centerCode: "gbLON2fr", workerId: null}, {centerCode: "gbMNC2fr", workerId: null}, {centerCode: "gbEDI2fr", workerId: null}], true)}
                        {statusCardGen("Germany", [{centerCode: "gbLON2de", workerId: null}, {centerCode: "gbMNC2de", workerId: null}, {centerCode: "gbEDI2de", workerId: null}])}
                        {statusCardGen("Switzerland", [{centerCode: "gbLON2ch", workerId: null}, {centerCode: "gbMNC2ch", workerId: null}, {centerCode: "gbEDI2ch", workerId: null}], true)}
                    </div>
                </div>
        </TooltipProvider>
    )
}

interface centerData { centerCode: "gbLON2be" | "gbLON2de" | "gbLON2ch" | "gbLON2fr" | "gbMNC2de" | "gbMNC2fr" | "gbMNC2be" | "gbMNC2ch" | "gbEDI2be" | "gbEDI2ch" | "gbEDI2fr" | "gbEDI2de", workerId: string | null }

function __int_get_center_name(ccode: string) {
    if (ccode.includes("LON")) return "London"
    else if (ccode.includes("MNC")) return "Manchester"
    else return "Edinburgh"
}

const statusCardGen = (country: string, centers: Array<centerData>, left: boolean = false) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const isDesktop = useMediaQuery("(min-width: 768px)")

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const form = useForm<z.infer<typeof RLForm>>({
        resolver: zodResolver(RLForm),
    })
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setLoading] = useState(false);

    async function onSubmit(data: z.infer<typeof RLForm>) {
        setLoading(true);
        await listenerRestartAction(country.toLowerCase(), data.center, null);
        //                                                    todo: wid ^^^^
        setLoading(false);
        toast({
            title: "Restart command sent to selected listeners",
            description: `Sent the restart command to following listener(s) ${data.center.toUpperCase()} of ${country}`
        })
        setOpen(false);
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {if (!open) form.reset()}, [open]);

    return (
        <Tooltip>
            {isDesktop ?
                <Dialog open={open} onOpenChange={setOpen}>
                    <IntCardContent country={country} centers={centers} left={left} responsiveDialogOpen={setOpen}/>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="mb-5">Restart Listener</DialogTitle>
                            <DelayedRestartAlert />
                        </DialogHeader>
                        <RLFormView isDesktop={isDesktop} form={form} onSubmit={onSubmit} isLoading={isLoading}/>
                    </DialogContent>
                </Dialog>
                :
                <Drawer open={open} onOpenChange={setOpen}>
                    <IntCardContent country={country} centers={centers} left={left} responsiveDialogOpen={setOpen}/>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle className="mb-5">Restart Listener</DrawerTitle>
                            <DelayedRestartAlert />
                        </DrawerHeader>
                        <RLFormView isDesktop={isDesktop} form={form} onSubmit={onSubmit} isLoading={isLoading}/>
                    </DrawerContent>
                </Drawer>
            }
        </Tooltip>
    )
}

interface IResponsiveSubmitTrigger { isDesktop: boolean, isLoading: boolean }
const ResponsiveSubmitTrigger = ({isDesktop, isLoading}: IResponsiveSubmitTrigger) => (
    isDesktop ? (
            <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                        <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Restart Listener
                </Button>
            </DialogFooter>
        ) :
        <DrawerFooter>
            <Button type="submit" disabled={isLoading}>
                {isLoading && (
                    <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Restart Listener
            </Button>
        </DrawerFooter>
)

interface IRLFormView { form: UseFormReturn<z.infer<typeof RLForm>>, onSubmit: SubmitHandler<z.infer<typeof RLForm>>, isDesktop: boolean, isLoading: boolean }
const RLFormView = ({form, onSubmit, isDesktop, isLoading}: IRLFormView) => (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className={cn("grid gap-4 py-4 w-[200px] space-y-6", !isDesktop && "px-4")}>
                <FormField
                    control={form.control}
                    name="center"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Center</FormLabel>
                            <Select onValueChange={field.onChange}
                                    defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select center to be restarted."/>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="lon">London</SelectItem>
                                    <SelectItem value="mnc">Manchester</SelectItem>
                                    <SelectItem value="edi">Edinburgh</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <ResponsiveSubmitTrigger isDesktop={isDesktop} isLoading={isLoading}/>
        </form>
    </Form>
)

interface IIntCardContent {centers: Array<centerData>, left: boolean, country: string, responsiveDialogOpen: Dispatch<SetStateAction<boolean>>}
const IntCardContent = ({centers, responsiveDialogOpen, country, left}: IIntCardContent) => (
    <Card className={`backdrop-blur-xl bg-background/30 w-[450px] ${left ? 'lg:justify-self-start' : 'lg:justify-self-end'}`}>
        {/* todo: remove workaround ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/}
        <CardHeader>
            <div className="flex flex-row">
                <CardTitle className="flex flex-row self-center">{emoji(`${getCountryFlag(country)} ${country}`)}</CardTitle>
                <Button className="ml-auto" variant="ghost">View detailed logs</Button>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button className="ml-2" variant="ghost" size="icon" onClick={() => responsiveDialogOpen(true)}>
                            <RefreshCwIcon className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        Restart Listener
                    </TooltipContent>
                </Tooltip>
            </div>
        </CardHeader>
        <CardContent>
            {centers.map((cdata, i) => (
                <UptimeBar key={i} centerCode={cdata.centerCode} center={__int_get_center_name(cdata.centerCode)} />
            ))}
        </CardContent>
    </Card>
)

const DelayedRestartAlert = () => (
    <Alert>
        <TriangleAlertIcon className="h-5 w-5"/>
        <AlertTitle>Delayed Restart</AlertTitle>
        <AlertDescription>Listener will takes, at max 5 minutes to receive restart command, and
            further for restart process to complete.</AlertDescription>
    </Alert>
)
