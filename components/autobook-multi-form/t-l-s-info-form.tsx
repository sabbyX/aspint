import {UseFormReturn} from "react-hook-form";

import { Input } from "../ui/input";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {FormSchema} from "@/components/autobook-multi-form/schema";
import {z} from "zod";

interface ITLSInfoForm {form: UseFormReturn<z.infer<typeof FormSchema>>}
const TLSInfoForm = ({form}: ITLSInfoForm) => {
    return (
        <div className="flex flex-col justify-center h-full">
            <div className="max-w-[500px] space-y-5">
                <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="example@example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the email you used to register or log in to TLScontact.
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input placeholder="password" {...field} />
                            </FormControl>
                            <FormDescription>
                                Password for TLScontact login
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="formid"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Form Id</FormLabel>
                            <FormControl>
                                <Input placeholder="1181176" {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter the Form ID given by TLS
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
};

export default TLSInfoForm;