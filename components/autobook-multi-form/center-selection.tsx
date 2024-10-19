import {UseFormReturn} from "react-hook-form";
import {z} from "zod";
import {FormSchema} from "@/components/autobook-multi-form/schema";
import {Card} from "@/components/ui/card";
import {Dispatch, SetStateAction} from "react";

interface ICenterSelection {form: UseFormReturn<z.infer<typeof FormSchema>>, formStep: Dispatch<SetStateAction<number>>}
export default function CenterSelection({form, formStep}: ICenterSelection) {
    function handleSubmit(center: string) {
        form.setValue("center", center);
        formStep(3);
    }
    return (
        <div className="flex flex-col md:flex-row items-center justify-center h-full space-y-2 md:space-x-10">
            {["London", "Manchester", "Edinburgh"].map((center) => (
                <Card
                    key={center}
                    className="flex items-center justify-center min-w-[200px] min-h-[100px] md:min-h-[200px] hover:shadow-2xl hover:ring-4 hover:ring-blue-500 transition duration-400 hover:cursor-pointer dark:hover:scale-110 transform duration-200 ease-in"
                    onClick={() => handleSubmit(center)}>
                    <div className="text-xl">
                        {center}
                    </div>
                </Card>
            ))}
        </div>
    )
}
