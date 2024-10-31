// @ts-ignore
import EventSource from "eventsource";
import {NextRequest, NextResponse} from "next/server";

export const runtime = 'nodejs';
// This is required to enable streaming
export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
    const jsessionidToken = request.cookies.get("JSESSIONID");

    const {writable, readable} = new TransformStream();
    const encoder = new TextEncoder();
    let writer = writable.getWriter();

    try {
        const internalSse = new EventSource("http://localhost:7777/service/viewInstanceSse", {
            headers: {
                Authorization: `Bearer ${jsessionidToken?.value}`
            }
        });

        request.signal.addEventListener("abort", async () => {
            console.log("sse disconnected");
            for (let i = 0; i < events.length; i++) internalSse.removeEventListener(events[i], internalForwardFn)
            internalSse.close();
            await writer.close()
        });

        // @ts-ignore
        function internalForwardFn(e: MessageEvent) {
            writer.write(encoder.encode(`event:${e.type}\ndata: ${JSON.stringify(JSON.parse(e.data))}\n\n`));
        }

        const events = ["initApplications", "initABServers", "newABApplication", "deleteABApplication", "newABLog", "newABTask", "removeABTask"]
        for (let i = 0; i < events.length; i++) internalSse.addEventListener(events[i], internalForwardFn)

        internalSse.onerror = (e: any) => {
            writer.write(encoder.encode(`event:connectionLost\ndata:${e.message}`))
            internalSse.close();
        };

        return new NextResponse(readable, {
            headers: {
                Connection: 'keep-alive',
                // 'Content-Encoding': 'None',
                'Cache-Control': 'no-cache, no-transform',
                'Content-Type': 'text/event-stream',
            }
        })
    }   catch (e: any) {
        return new Response(`Internal conn failed to initialize with status: ${e.toString()}`, { status: 500 })
    }
}
