"use server"

import {z} from "zod";
import {FormSchema} from "@/components/autobook-multi-form/schema";
import {cookies} from "next/headers";

export default async function submitNewApplication(data: z.infer<typeof FormSchema>): Promise<{message: string, status: number}> {
    const APIEndpoint = new URL("http://localhost:8000/autobookService/newApplication/");
    const headers = new Headers({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${cookies().get("JSESSIONID")?.value}`
    })
    const payload = JSON.stringify(data)

    try {
        const resp = await fetch(APIEndpoint, {
            method: "POST",
            body: payload,
            headers: headers,
        })
        return {status: resp.status, message: JSON.stringify(resp.json())}
    } catch (e: any) {
        return {status: 500, message: e.toString()}
    }
}
