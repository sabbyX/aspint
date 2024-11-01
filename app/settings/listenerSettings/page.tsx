"use client"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {Card} from "@/components/ui/card";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect, useState} from "react";
import {abbCenter, getCenterCode, getCenterFromCenterCode, getCountryFromISOCode} from "@/components/shared/utils";
import {LoaderCircleIcon, PlusIcon, Trash2Icon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {cn} from "@/lib/utils";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import * as React from "react";
import {toast} from "sonner";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const LCredential = z.object({
    username: z.string().optional(),
    password: z.string().optional(),
    fg_id: z.preprocess(
        (a) => parseInt(a as string, 10),
        z.number().positive()
    ).optional(),
    country: z.string().optional(),
})

const Schema = z.array(
    z.object({
        rotate_id: z.number(),
        cdata: z.record(z.string(), z.array(LCredential))
    })
)

type Test2 = {
    username: string,
    password: string,
    fg_id: number,
    country: string
}

type cdata = {
    [key: string]: Test2[]
}

type Test = {
    rotate_id: number,
    cdata: cdata
}

const NCRSchema = z.object({
    center: z.string(),
    username: z.string(),
    password: z.string(),
    fg_id: z.preprocess(
        (a) => parseInt(a as string, 10),
        z.number().positive()
    ),
    country: z.string(),
    rotation: z.number(),
})

export default function ListenerSettingsPage()  {
    const [data, setData] = useState<Test[]>()
    const [openRootDialog, setOpenRootDialog] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [noPerm, setNoPerm] = useState(false);

    const form = useForm<z.infer<typeof Schema>>({
        resolver: zodResolver(Schema),
        shouldUnregister: false,
    })

    const NCRForm = useForm<z.infer<typeof NCRSchema>>({
        resolver: zodResolver(NCRSchema)
    })

    function handleNCRSubmit(data: z.infer<typeof NCRSchema>) {
        const center = getCenterCode(data.country, data.center);
        setData((ps) => {
            if (ps) {
                let ns = ps.slice();
                if (ns[data.rotation].cdata[center]) {
                    ns[data.rotation].cdata[center].push({username: data.username, password: data.password, country: data.country, fg_id: data.fg_id});
                } else {
                    ns[data.rotation].cdata[center] = [{username: data.username, password: data.password, country: data.country, fg_id: data.fg_id}];
                }
                setData(ns);
                setOpenRootDialog(false);
                return ns;
            } else { return ps }
        })
    }

    async function handleSubmit(data: z.infer<typeof Schema>) {
        console.log(JSON.stringify(data, null, 2))
        setLoading(true)
        const resp = await fetch("/api/listenerData", { method: "POST", body: JSON.stringify({data: data}), headers: { "Content-Type": "application/json" }});
        if (!resp.ok) toast.error(`Failed to save updated listener data: ${await resp.text()}`);
        else toast.success("Saved");
        setLoading(false);
    }

    const fetchData = async () => {
        const resp = await fetch("/api/listenerData", { method: "GET" });
        if (resp.ok) {
            const data = (await resp.json()).data;
            setData(data);
        } else if (resp.status == 401) {
            setNoPerm(true);
        }
    }

    useEffect(() => {
        fetchData()
    }, []);

    useEffect(() => {
        form.reset(data);
    }, [data]);

    return (
        <div>
            <Dialog open={openRootDialog} onOpenChange={setOpenRootDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Center</DialogTitle>
                    </DialogHeader>
                    <Form {...NCRForm}>
                        <form onSubmit={NCRForm.handleSubmit(handleNCRSubmit)}>
                            <div className={cn("grid gap-4 py-4 w-[200px] space-y-2")}>
                                <FormField
                                    control={NCRForm.control}
                                    name="center"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Center</FormLabel>
                                            <Select onValueChange={field.onChange}
                                                    defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select center"/>
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="lon">London</SelectItem>
                                                    <SelectItem value="mnc">Manchester</SelectItem>
                                                    <SelectItem value="edi">Edinburgh</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <div>
                                    <FormField
                                        control={NCRForm.control}
                                        name="username"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Username</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="example@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div>
                                    <FormField
                                        control={NCRForm.control}
                                        name="password"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="********" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div>
                                    <FormField
                                        control={NCRForm.control}
                                        name="fg_id"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Form ID</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="000000" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Submit</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <div className="ml-5">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Listener Settings</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <Alert variant="destructive" className={cn("m-5 max-w-[500px]", !noPerm && "hidden")}>
                <AlertTitle>Restricted</AlertTitle>
                <AlertDescription>This settings requires ElevatedUser permissions</AlertDescription>
            </Alert>

            <div className="ml-5 mt-10 space-y-5">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        {data?.map((value, index) => (
                            <div key={index}>
                                <text className="text-xl">Rotation {value.rotate_id}</text>
                                <Card className="min-h-[200px]">
                                    {["be", "fr", "de", "ch"].map((issuer, idx) => (
                                        <div className="p-5" key={idx}>
                                            <div className="flex flex-row items-center">
                                                <text className="text-lg">{getCountryFromISOCode(issuer)}</text>
                                                <div className="ml-auto">
                                                    <Button type="button" size="icon" onClick={() => {
                                                        NCRForm.reset();
                                                        NCRForm.setValue("rotation", value.rotate_id)
                                                        NCRForm.setValue("country", issuer);
                                                        setOpenRootDialog(true);
                                                    }}>
                                                        <PlusIcon className="h-4 w-4"/>
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                {getIssuerCenters(issuer, value.cdata).map((center, idx) => (
                                                    <Card key={idx} className="my-2">
                                                        <div className="p-5">
                                                            <div className="flex flex-row items-center">
                                                                <text
                                                                    className="text-lg">{getCenterFromCenterCode(center)}</text>
                                                                {data[value.rotate_id].cdata[center].length == 0 &&
                                                                    <div className="ml-auto">
                                                                        <Button type="button" variant="ghost"
                                                                                size="icon" onClick={() => {
                                                                            NCRForm.reset();
                                                                            NCRForm.setValue("rotation", value.rotate_id)
                                                                            NCRForm.setValue("country", issuer);
                                                                            NCRForm.setValue("center", abbCenter(getCenterFromCenterCode(center)).toLowerCase())
                                                                            setOpenRootDialog(true);
                                                                        }}>
                                                                            <PlusIcon className="h-4 w-4"/>
                                                                        </Button>
                                                                    </div>
                                                                }
                                                            </div>
                                                            <div key={idx}
                                                                 className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                                {value.cdata[center].map((lcred, idx) => (
                                                                    <div key={idx}>
                                                                        <Card>
                                                                            <div className="flex flex-row">
                                                                                <div className="ml-auto">
                                                                                    <AlertDialog>
                                                                                        <AlertDialogTrigger asChild>
                                                                                            <Button type="button"
                                                                                                    className="m-1"
                                                                                                    variant="ghost" size="icon">
                                                                                               <Trash2Icon className="h-4 w-4 text-red-400 dark:text-red-500"/>
                                                                                           </Button>
                                                                                       </AlertDialogTrigger>
                                                                                       <AlertDialogContent>
                                                                                           <AlertDialogHeader>
                                                                                               <AlertDialogTitle>Confirm</AlertDialogTitle>
                                                                                               <AlertDialogDescription>
                                                                                                   This action cannot be undone. This will permanently delete the listener.
                                                                                               </AlertDialogDescription>
                                                                                           </AlertDialogHeader>
                                                                                           <AlertDialogFooter>
                                                                                               <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                               <AlertDialogAction onClick={() => {
                                                                                                   setData((ps) => {
                                                                                                       let ns = ps?.slice();
                                                                                                       if (ns) {
                                                                                                           ns[value.rotate_id].cdata[center].splice(idx,1);
                                                                                                           return ns
                                                                                                       } else return ps
                                                                                                   })
                                                                                               }}>Continue</AlertDialogAction>
                                                                                           </AlertDialogFooter>
                                                                                       </AlertDialogContent>
                                                                                   </AlertDialog>
                                                                               </div>
                                                                            </div>
                                                                            <div className="p-5 pt-0">
                                                                                <div>
                                                                                    <FormField
                                                                                        control={form.control}
                                                                                        name={`${value.rotate_id}.cdata.${center}.${idx}.username`}
                                                                                        render={({field}) => (
                                                                                            <FormItem>
                                                                                                <FormLabel>username</FormLabel>
                                                                                                <FormControl>
                                                                                                    <Input value={field.value} onChange={field.onChange}/>
                                                                                                </FormControl>
                                                                                                <FormMessage/>
                                                                                            </FormItem>
                                                                                        )}
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <FormField
                                                                                        control={form.control}
                                                                                        name={`${value.rotate_id}.cdata.${center}.${idx}.password`}
                                                                                        render={({field}) => (
                                                                                            <FormItem>
                                                                                                <FormLabel>Password</FormLabel>
                                                                                                <FormControl>
                                                                                                    <Input value={field.value} onChange={field.onChange} />
                                                                                                </FormControl>
                                                                                                <FormMessage/>
                                                                                            </FormItem>
                                                                                        )}
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <FormField
                                                                                        control={form.control}
                                                                                        name={`${value.rotate_id}.cdata.${center}.${idx}.fg_id`}
                                                                                        render={({field}) => (
                                                                                            <FormItem>
                                                                                                <FormLabel>Form
                                                                                                    ID</FormLabel>
                                                                                                <FormControl>
                                                                                                    <Input value={field.value} onChange={field.onChange} />
                                                                                                </FormControl>
                                                                                                <FormMessage/>
                                                                                            </FormItem>
                                                                                        )}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </Card>
                                                                    </div>
                                                                ))}
                                                                <div>
                                                                    { data[value.rotate_id].cdata[center].length > 0 &&
                                                                        <Card className="h-full w-10 hover:bg-muted/50"
                                                                              onClick={() => {
                                                                                  NCRForm.reset();
                                                                                  NCRForm.setValue("rotation", value.rotate_id)
                                                                                  NCRForm.setValue("country", issuer);
                                                                                  NCRForm.setValue("center", abbCenter(getCenterFromCenterCode(center)).toLowerCase())
                                                                                  setOpenRootDialog(true);
                                                                              }}>
                                                                            <div
                                                                                className="flex h-full items-center justify-center">
                                                                                <PlusIcon className="h-4 w-4"/>
                                                                            </div>
                                                                        </Card>
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </Card>
                            </div>
                        ))}
                        <div className="absolute shadow-2xl right-10 bottom-10">
                            <div className="flex flex-row">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading &&
                                        <LoaderCircleIcon className="h-4 w-4 animate-spin mr-1"/>
                                    }
                                    Save changes
                                </Button>
                                <Button type="button" disabled={isLoading} variant="secondary" className="ml-5"
                                        onClick={async () => await fetchData()}>
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}

function getIssuerCenters(issuer: string, data: Object) {
    let res: string[] = [];
    if (!data) return res;
    Object.keys(data).forEach((val) => {
        if (val.endsWith(issuer)) {
            res.push(val)
        }
    });
    return res;
}
