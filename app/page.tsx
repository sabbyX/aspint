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

export default function Page() {
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
            <h3>Welcome</h3>
        </main>
    );
}
