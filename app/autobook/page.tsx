"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {toast} from "@/components/ui/use-toast"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {CalendarIcon, CheckIcon, ChevronsUpDownIcon} from 'lucide-react'
import {Calendar} from "@/components/ui/calendar";
import {addDays, format} from "date-fns";
import {Checkbox} from "@/components/ui/checkbox";
import {
    Command,
    CommandList,
    CommandGroup,
    CommandItem,
    CommandEmpty
} from "@/components/ui/command"
import {useState} from "react";

const issuers = [
    { label: "London", value: "gbLON2ch" },
    { label: "Edinburgh", value: "gbEDI2ch" },
    { label: "Manchester", value: "gbMNC2ch" },
] as const

const FormSchema = z.object({
    issuer: z.string()
        .min(1, {message: "Must select a issuer/center"}),
    email: z.string()
        .min(1, {message: "Email is required"})
        .email("Not a valid email"),
    password: z.string()
        .min(1, {message: "Password is required"}),
    dateRange: z.optional(
        z.object({
            from: z.date(),
            to: z.date(),
        }).refine(
            (data) => data.from > addDays(new Date(), -1),
            "Start date must be in the future"
        )
    ),
    preferredSlotRange: z.boolean().default(false),
    primeTimeAppointment: z.boolean().default(false),
    primeTimeWeekendAppointment: z.boolean().default(false),
})

export default function AutobookAdd() {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: "",
            password: "",
            preferredSlotRange: false,
            primeTimeAppointment: false,
            primeTimeWeekendAppointment: false,
        },
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        toast({
            title: "You submitted the following values:",
            description: (
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
            ),
        })
    }

    const [issuerSelectionOpen, setIssuerSelectionOpen] = useState(false);

    return (
        <main>
            <div className="mb-10">
                <h2 className="text-xl md:text-3xl font-semibold tracking-tight first:mt-0">
                    👤New Application
                </h2>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                    <div className="lg:grid flex grid-cols-2 gap-4 gap-y-10 flex-col">
                        <div className="col-span-2">
                            <FormField
                                control={form.control}
                                name="issuer"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Select Centre</FormLabel>
                                        <Popover open={issuerSelectionOpen} onOpenChange={setIssuerSelectionOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-[200px] justify-between",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value
                                                            ? issuers.find(
                                                                (issuer) => issuer.value === field.value
                                                            )?.label
                                                            : "Select center"}
                                                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[200px] p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandEmpty>No framework found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {issuers.map((issuer) => (
                                                                <CommandItem
                                                                    value={issuer.label}
                                                                    key={issuer.value}
                                                                    onSelect={() => {
                                                                        form.setValue("issuer", issuer.value)
                                                                        setIssuerSelectionOpen(false);
                                                                    }}
                                                                >
                                                                    {issuer.label}
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "ml-auto h-4 w-4",
                                                                            issuer.value === field.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormDescription>
                                            Make sure to match account provided with selected center
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="example@example.com" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is the email you used to register or log in to TLScontact.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="password" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Password for TLScontact login
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="dateRange"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Preferred Slot Range</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[240px] pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value?.from ? (
                                                        field.value?.to ? (
                                                            <>
                                                                {format(field.value.from, "LLL dd, y")} -{" "}
                                                                {format(field.value.to, "LLL dd, y")}
                                                            </>
                                                        ) : (
                                                            format(field.value.from, "LLL dd, y")
                                                        )
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="range"
                                                defaultMonth={field.value?.from}
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                numberOfMonths={2}
                                                disabled={(date) => date < ( d => new Date(d.setDate(d.getDate()-1)) )(new Date) || !form.watch("preferredSlotRange")}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>
                                        Appointment confirmed only if the slot is available within the given range.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="preferredSlotRange"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 lg:py-6 md:10">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            onClick={() => form.resetField('dateRange')}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Enable Preferred Slot Range
                                        </FormLabel>
                                        <FormDescription>
                                            If unchecked, first available appointment will be confirmed{" "}
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <div className="col-span-2">
                            <FormField
                                control={form.control}
                                name="primeTimeAppointment"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Allow Prime Time Appointments
                                            </FormLabel>
                                            <FormDescription>
                                                Prime time appointments will be considered if normal ones are unavailable{" "}
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="col-span-2">
                            <FormField
                                control={form.control}
                                name="primeTimeWeekendAppointment"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Allow Prime Time Weekend Appointments
                                            </FormLabel>
                                            <FormDescription>
                                                Prime time weekend appointments will be considered only if normal ones are unavailable{" "}
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                    </div>

                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        </main>
    );
}
