"use server"

import { cookies } from "next/headers"
import {redirect} from "next/navigation";

export async function authenticateType1(username: string, password: string): Promise<boolean> {
    try {
        let payload = {
            username: username,
            password: password
        }

        const resp = await fetch("http://localhost:7777/service/authenticateUser/",
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        )
        console.log("Authentication Request status:", resp.status);
        if (!resp.ok) return false;
        else {
            const data = await resp.json();
            if (data?.token) {
                cookies().set("JSESSIONID", data?.token, {secure: true, path: "/"});
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

export async function authVerify(token: string | undefined | null) : Promise<boolean> {
    if (typeof token !== 'string') return false;
    const headers = new Headers({
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    })

    try {
        const resp = await fetch("http://localhost:7777/service/verifyAuth",
            {
                method: "GET",
                headers: headers,
            }
        )
        if (!resp.ok) return false
        else return true
    } catch (e: any) {
      console.log("Encountered Error While fetching authenticated user:", e.toString())
    }
    return false
}

export async function logOut() {
    cookies().delete("JSESSIONID")
    return redirect("/login")
}

export async function redirectToHome() {
    return redirect("/");
}
