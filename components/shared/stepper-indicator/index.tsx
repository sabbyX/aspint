import { Separator } from "@/components/ui/separator";
import clsx from "clsx";
import {CheckIcon, EarthIcon, FormInputIcon, CalendarIcon, BuildingIcon, CheckCheckIcon} from "lucide-react";
import React, { Fragment } from "react";

export const stepsData = [
    {
        idx: 1,
        icon: EarthIcon,
        title: "Choose Destination Country",
        description: "Select the country where you want to apply for a visa."
    },
    {
        idx: 2,
        icon: BuildingIcon,
        title: "Select Visa Center",
        description: "Choose the visa application center for your appointment."
    },
    {
        idx: 3,
        icon: FormInputIcon,
        title: "Enter TLS Details",
        description: "Fill in your login credentials and form ID."
    },
    {
        idx: 4,
        icon: CalendarIcon,
        title: "Select Appointment Slot",
        description: "Choose your preferred appointment date and time slot."
    },
    {
        idx: 5,
        icon: CheckCheckIcon,
        title: "Confirm Details",
        description: "Review and confirm all the entered information before submission."
    },
];

interface StepperIndicatorProps {
    activeStep: number;
}

export const StepperIndicator = ({ activeStep }: StepperIndicatorProps) => {
    return (
        <div className="flex flex-col justify-center items-center">
            {stepsData.map((step) => (
                <Fragment key={step.idx}>
                    <div className="flex flex-row">
                        <div className="flex flex-col justify-center items-center">
                            <div
                                className={clsx(
                                    "w-[40px] h-[40px] flex justify-center items-center m-[5px] rounded-full",
                                    step.idx < activeStep && "bg-primary",
                                    step.idx === activeStep && "ring-2 ring-offset-2 ring-offset-background ring-primary bg-primary text-primary"
                                )}
                            >
                                {step.idx >= activeStep ? <step.icon className={`h-5 w-5 ${step.idx === activeStep ? 'text-white dark:text-black' : 'text-muted-foreground'}`} /> : <CheckIcon className="h-5 w-5 text-white dark:text-black"/>}
                            </div>
                            {step.idx !== 5 && (
                                <Separator
                                    orientation="vertical"
                                    className={clsx(
                                        "w-[2px] h-[50px]",
                                        step.idx <= activeStep - 1 && "bg-primary"
                                    )}
                                />
                            )}
                        </div>
                        <div className="flex flex-col ml-2 w-[200px]">
                            <text className="text-md font-semibold whitespace-nowrap">{step.title}</text>
                            <text className="text-xs text-muted-foreground">{step.description}</text>
                        </div>
                    </div>
                </Fragment>
            ))}
        </div>
    );
};
