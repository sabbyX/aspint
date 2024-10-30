"use client"

import {InstancesView} from "@/components/ab-instance-status/instances-view";
import {QueueTable} from "@/components/ab-instance-status/queue-table";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {useMediaQuery} from "usehooks-ts";
import {ReactNode, useEffect, useState} from "react";
import QueueTableSkeleton from "@/components/ab-instance-status/queue-table-skeleton";


export default function InstancePage() {
    const isDesktop = useMediaQuery("(min-width: 1600px)");
    const [isClient, setIsClient] = useState(false)

    const [isLoaded, setLoadState] = useState(false);

    useEffect(() => {
        setLoadState(true);
        const sse = new EventSource("/api/viewInstance", {withCredentials: true});
        sse.onerror = (e) => {
            alert(JSON.stringify(e));
            sse.close();
        }
        // sse.onmessage = (e) => { alert(JSON.stringify(e)) }

        sse.addEventListener("initApplications", (e) => { alert(JSON.stringify(e.data)) })
        sse.addEventListener("initABServers", (e) => { alert(JSON.stringify(e.data)) })


        return () => { sse.close() }
    }, []);

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) return <></>  // disable ssr

    const WrapWithScroll = ({children}: Readonly<{ children: ReactNode; }>) => (
        !isDesktop ? (
            <ScrollArea className="w-full">
                {children}
            </ScrollArea>
        ) : <>{children}</>
    )
    return (
        <div className="flex flex-col h-full">
            <div className="h-[400px]">
                <WrapWithScroll>
                    <InstancesView />
                    {!isDesktop? <ScrollBar orientation="horizontal"/>: <div></div>}
                </WrapWithScroll>
            </div>
            <div>
                {isLoaded ? <QueueTable /> : <QueueTableSkeleton />}
            </div>
        </div>
    )
}
