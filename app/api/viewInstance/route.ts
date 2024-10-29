import { cookies } from "next/headers";

export async function GET(request: Request) {
    const cookieStore = cookies();
    const jsessionidToken = cookieStore.get("JSESSIONID");

    const {writable, readable} = new TransformStream();
    const internalSse =  await fetch("http://localhost:7777/service/viewInstanceSse", {
        headers: {
            'Authorization': `Bearer ${jsessionidToken}`
        }
    });
    if (!internalSse.ok) {
        await writable.getWriter().close();
        return new Response("Internal API conn failed", { status: 500 });
    }
    await internalSse.body?.pipeTo(writable);
    return new Response(readable, {
        headers: internalSse.headers
    })
}
