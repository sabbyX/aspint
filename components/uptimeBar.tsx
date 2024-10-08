"use client"

import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card"
import {useEffect, useState} from "react";
import {retrieveUptArray} from "@/app/actions/uptimeActions";

interface StatusBarProps {
    center: "gbLON2be" | "gbLON2de" | "gbLON2ch" | "gbLON2fr" | "gbMNC2de" | "gbMNC2fr" | "gbMNC2be" | "gbMNC2ch" | "gbEDI2be" | "gbEDI2ch" | "gbEDI2fr" | "gbEDI2de"
}

export function UptimeBar({ center }: StatusBarProps) {
    const [pulsate, setPulsate] = useState(true);
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState(Array(60).fill({status: "INDETERMINATE", code: 0}))

    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setPulsate(!pulsate);
            }, 7000);
            return () => clearInterval(interval)
        }
    }, [pulsate, isLoading]);

    useEffect(() => {
        (async () => {
            const upt_arr = await retrieveUptArray(center);
            if (upt_arr) setData(upt_arr)
            setLoading(false)
            setPulsate(false)
        })()
    }, []);

    return (
            <div className="p-4">
                <div className="flex overflow-y-hidden overflow-x-auto py-1 w-[calc(7px*60)] px-1">
                    {data.map((rdata, index) => (
                        <HoverCard key={index} openDelay={300}>
                            <HoverCardTrigger>
                                <div className={`cursor-pointer ${pulsate ? 'animate-pulse-L2R' : 'hover:scale-y-125 transform transition duration-100 ease-in'}`}
                                     style={{ animationDelay: `${pulsate ? index * 0.2 : 0}s` }}>
                                    <div
                                        className={`w-[4px] h-[30px] mr-[2px] rounded-sm ${detBarColor(rdata.status)}`}
                                    ></div>
                                </div>
                            </HoverCardTrigger>
                            <HoverCardContent>
                                {isLoading ?
                                    <small className="text-sm font-normal leading-none">Loading</small>
                                    :
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex flex-row space-x-2">
                                            <small className="text-sm font-medium leading-none">Incident
                                                Interval: </small>
                                            <small className="text-sm font-normal leading-none">0:00 GMT</small>
                                        </div>
                                        <div className="flex flex-row space-x-2">
                                            <small className="text-sm font-medium leading-none">Health Code: </small>
                                            <small className="text-sm font-normal leading-none">{rdata.code}</small>
                                        </div>
                                        <div className="flex flex-row space-x-2">
                                            <small className="text-sm font-medium leading-none">Health Status: </small>
                                            <small className="text-sm font-normal leading-none"> {rdata.status}</small>
                                        </div>
                                    </div>
                                }
                            </HoverCardContent>
                        </HoverCard>
                    ))}
                </div>
            </div>
    );
};


function detBarColor(type: string) {
    switch (type) {
        case "OK":
        case "INIT":
            return 'bg-green-500';
        case "BLOCK":
        case "TIMEOUT":
        case "INTERNAL_ERROR":
        case "UNKNOWN":
            return 'bg-red-500'
        case "INDETERMINATE":
        default:
            return 'bg-[#f1f5f8]'
    }
}
