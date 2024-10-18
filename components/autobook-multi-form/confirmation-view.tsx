import {UseFormReturn} from "react-hook-form";
import {z} from "zod";
import {FormSchema} from "@/components/autobook-multi-form/schema";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {getCountryFromISOCode} from "@/components/shared/utils";

interface IConfirmationView {form: UseFormReturn<z.infer<typeof FormSchema>>}
export default function ConfirmationView({form}: IConfirmationView) {
    return (
        <div className="pt-10">
            <Table>
                <TableCaption>Please confirm, editing after submitting later may NOT work.</TableCaption>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium text-base">Issuer</TableCell>
                        <TableCell className="text-base text-muted-foreground">{getCountryFromISOCode(form.getValues("issuer"))}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium text-base">Center</TableCell>
                        <TableCell className="text-base text-muted-foreground">{form.getValues("center")}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium text-base">TLS Email</TableCell>
                        <TableCell className="text-base text-muted-foreground">{form.getValues("email")}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium text-base">TLS Password</TableCell>
                        <TableCell className="text-base text-muted-foreground">{form.getValues("password")}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium text-base">TLS formID</TableCell>
                        <TableCell className="text-base text-muted-foreground">{form.getValues("formid")}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium text-base">Preferred Slot Range</TableCell>
                        <TableCell className="text-base text-muted-foreground">{form.getValues("preferredSlotRange").toString()}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium text-base">SlotRange.From</TableCell>
                        <TableCell className="text-base text-muted-foreground">{form.getValues("dateRange.from")?.toDateString()}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium text-base">SlotRange.To</TableCell>
                        <TableCell className="text-base text-muted-foreground">{form.getValues("dateRange.to")?.toDateString()}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium text-base">Allow Prime Time/Premium Appointments</TableCell>
                        <TableCell className="text-base text-muted-foreground">{form.getValues("primeTimeAppointment").toString()}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium text-base">Allow Prime Time Weekend Appointment</TableCell>
                        <TableCell className="text-base text-muted-foreground">{form.getValues("primeTimeWeekendAppointment").toString()}</TableCell>
                    </TableRow>
                </TableBody>
        </Table>
        </div>
    )
}
