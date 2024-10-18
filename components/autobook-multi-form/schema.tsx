import {z} from "zod";
import {addDays} from "date-fns";

export const FormSchema = z.object({
    issuer: z.string(),
    center: z.string(),
    email: z.string()
        .min(1, {message: "Email is required"})
        .email("Not a valid email"),
    password: z.string()
        .min(1, {message: "Password is required"}),
    formid: z.preprocess(
        (a) => parseInt(a as string, 10),
        z.number().positive()
    ),
    dateRange: z.optional(
        z.object({
            from: z.date(),
            to: z.date(),
        }).refine(
            (data) => data.from > addDays(new Date(), -1),
            "Start date must be in the future"
        )
    ),
    preferredSlotRange: z.boolean().default(true),
    primeTimeAppointment: z.boolean().default(false),
    primeTimeWeekendAppointment: z.boolean().default(false),
}).superRefine(({preferredSlotRange, dateRange}, refinementCtx) => {
    if (preferredSlotRange && dateRange == undefined) {
        return refinementCtx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Date Range is required, if not intended, uncheck preferredSlotRange option",
            path: ["dateRange"]
        })
    }
})
