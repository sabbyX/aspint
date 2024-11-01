"use server"

import {cookies} from "next/headers";
import {redirect} from "next/navigation";

export interface IStatusPayload {
    interval: string,
    code: number,
    status: string
}

export async function retrieveUptArray(center: string) {
    const APIEndpoint = new URL("http://localhost:8000/service/status/");
    APIEndpoint.searchParams.set("center", center)

    const headers = new Headers({
        "Authorization": `Bearer ${cookies().get("JSESSIONID")?.value}`
    })

    try {
        const resp = await fetch(APIEndpoint, {
            method: "GET",
            headers: headers
        })
        if ([401].includes(resp.status)) { redirect("/login") }
        if (resp.ok) {
            let uptArray: Array<IStatusPayload> = await resp.json();
            if (uptArray.length < 60) {
                const remainingArrLength = 60 - uptArray.length
                uptArray = Array(remainingArrLength).fill({"status": "INDETERMINATE", "code": 0}).concat(uptArray)
            }
            return uptArray
        }
    } catch (e: any) {
        console.log("Encountered error while fetching /status :", e.toString())
    }
    return null;
}
