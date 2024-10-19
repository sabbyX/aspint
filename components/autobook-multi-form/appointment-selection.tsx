import {UseFormReturn} from "react-hook-form";
import {z} from "zod";
import {FormSchema} from "@/components/autobook-multi-form/schema";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {format} from "date-fns";
import {CalendarIcon} from "lucide-react";
import {Calendar} from "@/components/ui/calendar";
import {Checkbox} from "@/components/ui/checkbox";
import {Switch} from "@/components/ui/switch";

interface IAppointmentSelection{form: UseFormReturn<z.infer<typeof FormSchema>>}
export default function AppointmentSelection({form}: IAppointmentSelection) {
    return (
        <div className="pt-10 h-full">
            <Tabs defaultValue="aao" className="w-full h-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="aao">
                        <div className="hidden md:block">Auto Appointment Options</div>
                        <div className="block md:hidden">Auto App. Options</div>
                    </TabsTrigger>
                    <TabsTrigger value="cfao">
                        <div className="hidden md:block">Choose from Available Slots</div>
                        <div className="block md:hidden">Available Slots</div>
                    </TabsTrigger>
                    <TabsContent value="aao">
                        <div className="flex flex-col justify-center pt-10 text-primary space-y-10 min-w-[300px]">
                            <FormField
                                control={form.control}
                                name="preferredSlotRange"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Switch
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
                            <div className={`${!form.watch("preferredSlotRange") ? 'hidden' : ''}`} >
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
                                                                !field.value && "text-muted-foreground",
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
                            </div>
                            <div className="col-span-2">
                                <FormField
                                    control={form.control}
                                    name="primeTimeAppointment"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Switch
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
                                                <Switch
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
                    </TabsContent>
                    <TabsContent value="cfao">
                        Work In Progress {'<<<<<<<NOT FINISHED>>>>>>>>>'}
                    </TabsContent>
                </TabsList>
            </Tabs>
        </div>
    )
}
