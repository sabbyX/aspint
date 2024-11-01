"use server"

import {cookies} from "next/headers";
import {redirect} from "next/navigation";

const APIEndpoint = "http://localhost:8000/service/listenerRestartService"

function generateCenterCode(country: string, center: string): Array<string> {
    function intGenCC(countryCode: string | undefined, centerCode: string) { return `gb${centerCode}2${countryCode}` }
    const abbCountryCode = new Map([["switzerland", "ch"], ["belgium", "be"], ["france", "fr"], ["germany", "de"]]);
    if (center == "all") {
        const centers = ["LON", "EDI", "MNC"]; let result = [];
        for (let i = 0; i < centers.length; i++) result.push(intGenCC(abbCountryCode.get(country.toLowerCase()), centers[i]))
        return result;
    }
    else return [intGenCC(abbCountryCode.get(country.toLowerCase()), center.toUpperCase())]
}

export async function listenerRestartAction(country: string, center: string, wid: string | null = null) {
    const authToken = cookies().get("JSESSIONID")?.value;
    const centerCodes = generateCenterCode(country, center);
    const headers = new Headers({
        "Authorization": `Bearer ${authToken}`
    })

    for (let i = 0; i < centerCodes.length; i++) {
        const url = new URL(APIEndpoint)
        url.searchParams.set("center", centerCodes[i])
        if (wid) url.searchParams.set("wid", wid)
        try {
            const resp = await fetch(APIEndpoint, {
                method: "GET",
                headers: headers,
            })
            if ([401].includes(resp.status)) return redirect("/login");
        } catch (e: any) {
            console.log(e.toString())
        }
    }
}
