import {NextRequest} from "next/server";

export async function POST(request: NextRequest) {
    let json = await request.json()
    try {
        return await fetch("http://localhost:7777/service/registerUser", {
            method: "POST",
            body: JSON.stringify(json),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (e) {
        console.log("registration failed:", e)
        return new Response('failed', {
            status: 400,
        })
    }
}
