"use server"

import {cookies} from "next/headers";
import {redirect} from "next/navigation";

export async function retrieveUptArray(center: string) {
    const APIEndpoint = new URL("http://localhost:8000/service/status");
    APIEndpoint.searchParams.set("center", center)

    const headers = new Headers({
        "Authorization": `Bearer ${cookies().get("token")}`
    })

    try {
        const resp = await fetch(APIEndpoint, {
            method: "GET",
            headers: headers
        })
        if (resp.status == 403) { redirect("/login") }
        if (resp.ok) {
            const respJSON = await resp.json();
            let uptArray: Array<object> = respJSON.uptArray;
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
