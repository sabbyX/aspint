import {Controller, useFormContext, UseFormReturn} from "react-hook-form";


import { Input } from "../ui/input";
import {Button} from "@/components/ui/button";
import {ChevronRight} from "lucide-react";
import emoji from "react-easy-emoji";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {Dispatch, SetStateAction, useCallback} from "react";
import {z} from "zod";
import {FormSchema} from "@/components/autobook-multi-form/schema";
import {getCountryFlag, getCountryFromISOCode} from "@/components/shared/utils";

interface ICountrySelection {form: UseFormReturn<z.infer<typeof FormSchema>>, formStep: Dispatch<SetStateAction<number>>}
const CountrySelection = ({form, formStep}: ICountrySelection) => {

    const onSubmit = (country: string) => {
        form.reset();
        form.setValue("issuer", country);
        formStep(2);
    }

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-5 md:space-y-2">
            {["be", "fr", "de", "ch"].map(
                (country) => (
                    <Button type="button" key={country} className="group w-[300px] justify-start" variant="ghost" onClick={() => onSubmit(country)}>
                        <div className="flex flex-row items-center ml-[60px] text-base">
                            {emoji(`${getCountryFlag(getCountryFromISOCode(country))} ${getCountryFromISOCode(country)}`)}
                        </div>
                        <div className="hidden group-hover:block ml-auto">
                            <ChevronRight className="h-4 w-4"/>
                        </div>
                    </Button>
                )
            )}
        </div>
    );
};

export default CountrySelection;