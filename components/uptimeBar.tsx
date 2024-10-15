"use client"

import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card"
import {useEffect, useState} from "react";
import {IStatusPayload, retrieveUptArray} from "@/app/actions/uptimeActions";
import {Badge} from "@/components/ui/badge";

interface StatusBarProps {
    centerCode: "gbLON2be" | "gbLON2de" | "gbLON2ch" | "gbLON2fr" | "gbMNC2de" | "gbMNC2fr" | "gbMNC2be" | "gbMNC2ch" | "gbEDI2be" | "gbEDI2ch" | "gbEDI2fr" | "gbEDI2de"
    center: "London" | "Manchester" | "Edinburgh"
}

export function UptimeBar({ centerCode, center }: StatusBarProps) {
    const [pulsate, setPulsate] = useState(true);
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState<Array<IStatusPayload>>(Array(60).fill({status: "INDETERMINATE", code: 0}))

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
            const upt_arr = await retrieveUptArray(centerCode);
            if (upt_arr) setData(upt_arr)
            setLoading(false)
            setPulsate(false)
        })()
    }, []);

    return (
        <div>
            <div className="flex flex-row">
                <p className="text-sm font-semibold leading-none">{center}</p>
                { computeStatus(data) }
            </div>
            <div className="p-4">
                <div className="flex overflow-y-hidden overflow-x-auto py-1 w-[calc(7px*60)] px-1">
                    {data.map((rdata, index) => (
                        <HoverCard key={index} openDelay={300}>
                            <HoverCardTrigger>
                                <div
                                    className={`cursor-pointer ${pulsate ? 'animate-pulse-L2R' : 'hover:scale-y-125 transform transition duration-100 ease-in'}`}
                                    style={{animationDelay: `${pulsate ? index * 0.2 : 0}s`}}>
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
                                        <div
                                            className={`flex flex-row space-x-2 ${rdata.status == "INDETERMINATE" ? 'hidden' : ''}`}>
                                            <small className="text-sm font-medium leading-none">
                                                Interval:
                                            </small>
                                            <small
                                                className="text-sm font-normal leading-none">{computeInterval(rdata.interval)}</small>
                                        </div>
                                        <div className="flex flex-row space-x-2">
                                            <small className="text-sm font-medium leading-none">Code: </small>
                                            <small className="text-sm font-normal leading-none">{rdata.code}</small>
                                        </div>
                                        <div className="flex flex-row space-x-2">
                                            <small className="text-sm font-medium leading-none">Status: </small>
                                            <small className="text-sm font-normal leading-none"> {rdata.status}</small>
                                        </div>
                                    </div>
                                }
                            </HoverCardContent>
                        </HoverCard>
                    ))}
                </div>
            </div>
        </div>
    );
}


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
            return 'dark:bg-gray-800 bg-gray-100'
    }
}


function computeInterval(s: string): string {
    if (!s) return '';
    const startInt = new Date(s);
    const endInt = new Date(startInt.getTime() + 4.999999999 * 60000);

    return `${__int_format_interval(startInt)} - ${__int_format_interval_short(endInt)}`
}

function __int_format_interval(date: Date): string {
    return (date.getMonth()+1) + '/' + date.getDate() + '/' + date.getFullYear() + ' ' + __int_format_interval_short(date)
}

function __int_format_interval_short(date: Date): string {
    const minutes = date.getMinutes();
    const displayMinutes = minutes < 10 ? '0'+minutes : minutes.toString()
    return date.getHours() + ':' + displayMinutes
}

function computeStatus(rdata: Array<IStatusPayload>) {
    if (rdata.length > 0) {
        const latestHealth = rdata[rdata.length - 1]
        switch (latestHealth.code) {
            case 0:
                return <Badge className="ml-auto" variant="destructive">Not found</Badge>
            case 102:
                return <Badge className="ml-auto" variant="secondary">(Re)Starting</Badge>
            case 200:
                return <Badge className="ml-auto" variant="secondary">Running</Badge>
            default:
                return <Badge className="ml-auto" variant="destructive">Failing</Badge>
        }
    }
}
