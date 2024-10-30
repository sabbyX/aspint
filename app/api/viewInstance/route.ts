import EventSource from "eventsource";
import {NextRequest, NextResponse} from "next/server";

export const runtime = 'nodejs';
// This is required to enable streaming
export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
    console.log("Reached 2")
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

        // @ts-ignore
        function internalForwardFn(e: MessageEvent) {
            console.log(`event: ${e.type}`);
            console.log(`data: ${JSON.stringify(JSON.parse(e.data).data)}`);
            writer.write(encoder.encode(`event:${e.type}\ndata: ${JSON.stringify(JSON.parse(e.data).data)}\n\n`));
        }

        const events = ["initApplications", "initABServers", "newABApplication", "deleteABApplication", "newABLog", "newABTask", "removeABTask"]
        for (let i = 0; i < events.length; i++) internalSse.addEventListener(events[i], internalForwardFn)
        
        internalSse.onerror = (e: any) => {
            console.log(JSON.stringify(e))
            internalSse.close();
        };

        console.log(JSON.stringify(readable), "reache here");
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
