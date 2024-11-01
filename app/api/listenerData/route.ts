import {NextRequest} from "next/server";

export async function GET(request: NextRequest) {
    const token = request.cookies.get("JSESSIONID")?.value;
    try {
        const resp = await fetch("http://localhost:7777/service/getAllListenersData", {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`,
            }
        })
        if (!resp.ok) return new Response(`${resp.status}: ${resp.statusText}`, { status: resp.status });
        return Response.json(await resp.json(), { status: 200, headers: { "Content-Type": "application/json" } })
    } catch (e: any) {
        return new Response(`failed ${e.toString()}`, {
            status: 400,
        })
    }
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get("JSESSIONID")?.value;
    try {
        const resp = await fetch("http://localhost:7777/service/setListeners", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(await request.json())
        })
        if (!resp.ok) return new Response(`${resp.status}: ${await resp.text()}`, { status: resp.status });
        return new Response("success", {status: 200})
    } catch (e: any) {
        return new Response(`failed ${e.toString()}`, {status: 400,})
    }
}
