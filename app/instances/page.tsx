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
        (async () => {
            function sleep(ms: number) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            await sleep(10000)
            setLoadState(true)
        })()
    }, [isLoaded]);

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
