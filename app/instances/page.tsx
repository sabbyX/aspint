"use client"

import {ABServerData, InstancesView} from "@/components/ab-instance-status/instances-view";
import {ABQueueTable, QueueTable} from "@/components/ab-instance-status/queue-table";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {useMediaQuery} from "usehooks-ts";
import {ReactNode, useCallback, useEffect, useState} from "react";
import QueueTableSkeleton from "@/components/ab-instance-status/queue-table-skeleton";


export default function InstancePage() {
    const isDesktop = useMediaQuery("(min-width: 1600px)");
    const [isClient, setIsClient] = useState(false)
    const [isLoaded, setLoadState] = useState(false);
    const [tableData, setTableData] = useState<Array<ABQueueTable>>([]);
    const [serverData, setServerData] = useState<Array<ABServerData>>([]);

    const removeABTask = useCallback((e: MessageEvent) => setServerData((ps) => {
        let data = JSON.parse(e.data);
        return ps.map((d) => {
            if (d.server == data.server_id) {
                const idx = d.queue.findIndex((i) => i == data.deletion)
                d.queue.splice(idx, 1);
            }
            return d
        });
    }), []);

    const newABTask = useCallback((e: MessageEvent) => setServerData((ps) => {
        let data = JSON.parse(e.data);
        return ps.map((d) => {
            if (d.server == data.server_id) {
                d.queue.push(data.addition);
            }
            return d
        });
    }), []);
    const newABApplication = useCallback((e: MessageEvent) => setTableData((ps) => {
        const data = JSON.parse(e.data);
        let ns = ps.slice();
        ns.push(data);
        return ns
    }),[]);
    const deleteABApplication = useCallback((e: MessageEvent) => setTableData((ps) => {
        const data = JSON.parse(e.data);
        const ns = ps.slice();
        const idx = ns.findIndex((el) => el.id == data.formid);
        if (idx != -1) ns.splice(idx,1);
        return ns;
    }), [])
    const initApplications = useCallback((e: MessageEvent) => {
        setTableData(JSON.parse(e.data));
        setLoadState(true);
    }, []);
    const newABLog = useCallback((e: MessageEvent) => setTableData((ps) => {
        const data = JSON.parse(e.data);
        const ns: ABQueueTable[] = [];
        ps.forEach((el) => {
            if (el.id == data.formid) {
                el.status = data.updated_status;
            }
            ns.push(el);
        })
        return ns;
    }), []);
    const initABServers = useCallback((e: MessageEvent) => setServerData(JSON.parse(e.data)), []);


    useEffect(() => {
        setLoadState(false);
        const sse = new EventSource("/api/viewInstance", {withCredentials: true});
        sse.onerror = (e) => sse.close();

        const events = [
            "initApplications",
            "initABServers",
            "removeABTask",
            "newABTask",
            "newABApplication",
            "deleteABApplication",
            "newABLog"
        ];

        sse.onopen = (e) => {
            events.forEach(event => {
                sse.addEventListener(event, eval(event), false);
            });
        }

        return () => {
            events.forEach(event => {
                sse.removeEventListener(event, eval(event), false);
            });
            sse.close();
        }
    }, [initABServers, initApplications, newABTask, removeABTask, deleteABApplication, newABApplication, newABLog]);

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
                    <InstancesView data={serverData} />
                    {!isDesktop? <ScrollBar orientation="horizontal"/>: <div></div>}
                </WrapWithScroll>
            </div>
            <div>
                {isLoaded ? <QueueTable data={tableData} /> : <QueueTableSkeleton />}
            </div>
        </div>
    )
}
