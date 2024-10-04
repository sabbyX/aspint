"use server"

import { cookies } from "next/headers"
import {redirect} from "next/navigation";

export async function authenticateType1(username: string, password: string): Promise<boolean> {
    try {
        let payload = new FormData();
        payload.append('username', username);
        payload.append('password', password);

        const resp = await fetch("http://localhost:8000/service/authenticate/",
            {
                method: "POST",
                body: payload
            }
        )
        console.log("Authentication Request status:", resp.status);
        if (!resp.ok) return false;
        else {
            const data = await resp.json();
            if (data?.access_token) {
                cookies().set("JSESSIONID", data?.access_token, {secure: true, path: "/"});
                return true;
            }
        }
    } catch (e: any) {
        console.log("Encountered error while authenticating (type1):", e.toString());
    }
    return false
}

export type UserResp = {
    username: string,
    name: string
}

export async function getMe(token: string | undefined | null) : Promise<UserResp | null> {
    if (typeof token !== 'string') return null;
    const headers = new Headers({
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    })

    try {
        const resp = await fetch("http://localhost:8000/service/accounts/me",
            {
                method: "GET",
                headers: headers,
            }
        )
        if (!resp.ok) return null
        else return await resp.json()
    } catch (e: any) {
      console.log("Encountered Error While fetching authenticated user:", e.toString())
    }
    return null
}

export async function redirectToHome() {
    return redirect("/");
}
