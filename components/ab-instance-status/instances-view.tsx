"use client"

import {Card} from "@/components/ui/card";
import {cn} from "@/lib/utils";

export function InstancesView() {
    return (
        <div className="grid grid-cols-4 overflow-hidden shrink-0 w-max">
            {[1, 2, 3, 4].map((idx) => (
                <Card key={idx} className="backdrop-blur-sm bg-background/10 m-5 p-5 w-[300px]">
                    $$country$$
                    <div className="grid grid-rows-4 gap-5 mt-5">
                        {[1, 2, 3, 4].map((idx) => (
                            <Card
                                className={cn(
                                    "px-5 py-2 rounded-[10px] shadow-none bg-gray-100/50",
                                    idx == 3 && "ring-2 ring-green-500 ring-offset-background ring-offset-2",
                                    idx == 2 && "bg-inactive-patten"
                                )} key={idx}>
                                $$name$$
                            </Card>
                        ))}
                    </div>
                </Card>
            ))}
        </div>
    )
}
