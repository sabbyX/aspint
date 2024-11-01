"use client";

import { useEffect, useState } from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";

import {StepperIndicator, stepsData} from "../shared/stepper-indicator";
import { Button } from "../ui/button";
import TLSInfoForm from "./t-l-s-info-form";
import CountrySelection from "./country-selection";
import {Card, CardFooter, CardTitle} from "@/components/ui/card"
import {Form} from "@/components/ui/form"
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {FormSchema} from "@/components/autobook-multi-form/schema";
import CenterSelection from "@/components/autobook-multi-form/center-selection";
import {getCountryFlag} from "@/components/shared/utils";
import emoji from "react-easy-emoji";
import AppointmentSelection from "@/components/autobook-multi-form/appointment-selection";
import ConfirmationView from "@/components/autobook-multi-form/confirmation-view";
import {LoaderCircleIcon} from "lucide-react";
import * as React from "react";
import submitNewApplication from "@/app/actions/newApplicationAction";


const AutobookApplicationForm = () => {
    const [activeStep, setActiveStep] = useState(1);
    const [erroredInputName, setErroredInputName] = useState("");

    const methods = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: "",
            password: "",
            preferredSlotRange: false,
            primeTimeAppointment: true,
            primeTimeWeekendAppointment: false,
        },
    })
    const {trigger, formState: { isSubmitting } } = methods;

    function getStepContent(step: number) {
        switch (step) {
            case 1:
                return <CountrySelection form={methods} formStep={setActiveStep}/>;
            case 2:
                return <CenterSelection form={methods} formStep={setActiveStep}/>
            case 3:
                return <TLSInfoForm form={methods} />;
            case 4:
                return <AppointmentSelection form={methods} />
            case 5:
                return <ConfirmationView form={methods} />
            default:
                return "Unknown step";
        }
    }


    // focus errored input on submit
    useEffect(() => {
        const erroredInputElement =
            document.getElementsByName(erroredInputName)?.[0];
        if (erroredInputElement instanceof HTMLInputElement) {
            erroredInputElement.focus();
            setErroredInputName("");
        }
    }, [erroredInputName]);

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        const {status, message} = await submitNewApplication(data)
        if (status == 200) {
            methods.reset();
            setActiveStep(1);
            toast.success("Application has been submitted successfully!");
        }
        else if ([409].includes(status)) toast.error("Submission Failed", {description: "Duplicate application!"})
        else toast.error("Submission Failed", {description: `Unexpected error encountered while submitting: ${message}`})
    };

    const handleNext = async () => {
        const isStepValid = await trigger(undefined, { shouldFocus: true });
        if (isStepValid) setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    return (
        <div className="flex flex-col lg:flex-row h-full">
            <div className="self-center">
                    <StepperIndicator activeStep={activeStep} setStep={setActiveStep}/>
            </div>
            <div className="self-center mt-5 md:mt-0 lg:ml-10 flex-1 h-full bg-gray">
                <Card className="backdrop-blur-md bg-background/30 h-full">
                    <div className="m-10 flex flex-col h-[97%]">
                        <CardTitle className="text-xl md:text-3xl">
                            <div className="flex flex-row items-center">
                                {activeStep === 2 ? emoji(`${stepsData[activeStep-1].title} (${getCountryFlag(methods.getValues("issuer"))})`) : stepsData[activeStep-1].title}
                            </div>
                        </CardTitle>
                        <div className="flex-1 h-full">
                            <Form {...methods}>
                                <form noValidate className="h-full">
                                    <div className="h-full">
                                        {getStepContent(activeStep)}
                                    </div>
                                </form>
                            </Form>
                        </div>
                        <CardFooter className="mt-auto mb-5">
                            <div className="flex justify-center space-x-[20px] ml-auto">
                                <Button
                                    type="button"
                                    className={`${activeStep === 1 ? 'hidden': ''} w-[100px]`}
                                    variant="secondary"
                                    onClick={handleBack}
                                    disabled={activeStep === 1}
                                >
                                    Back
                                </Button>
                                {activeStep === 5 ? (
                                    <Button
                                        className="w-[100px]"
                                        type="button"
                                        onClick={methods.handleSubmit(onSubmit)}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting && (
                                            <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Submit
                                    </Button>
                                ) : (
                                    <Button type="button" className={`${[1,2].includes(activeStep) ? 'invisible': ''} w-[100px]`} onClick={handleNext}>
                                        Next
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AutobookApplicationForm;