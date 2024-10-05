import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card"

interface StatusBarProps {
    data: {
        uptimePercentage: number;
        todayUptime: number;
        statuses: ('up' | 'down')[];
    };
}

export function UptimeBar({ data }: StatusBarProps) {
    return (
            <div className="p-4">
                <div className="flex overflow-y-hidden overflow-x-auto py-1 w-[calc(7px*60)] px-1">
                    {data.statuses.map((status, index) => (
                        <HoverCard key={index} openDelay={300}>
                            <HoverCardTrigger>
                                <div className="cursor-pointer hover:scale-y-125 transform transition duration-100 ease-in">
                                    <div
                                        className={`w-[4px] h-[30px] mr-[2px] rounded-sm ${status === 'up' ? 'bg-green-500' : 'bg-red-500'}`}
                                    ></div>
                                </div>
                            </HoverCardTrigger>
                            <HoverCardContent>
                                <div className="flex flex-col space-y-2">
                                    <div className="flex flex-row space-x-2">
                                        <small className="text-sm font-medium leading-none">Incident Interval: </small>
                                        <small className="text-sm font-normal leading-none">0:00 GMT</small>
                                    </div>
                                    <div className="flex flex-row space-x-2">
                                        <small className="text-sm font-medium leading-none">Health Code: </small>
                                        <small className="text-sm font-normal leading-none">200</small>
                                    </div>
                                    <div className="flex flex-row space-x-2">
                                        <small className="text-sm font-medium leading-none">Health Status: </small>
                                        <small className="text-sm font-normal leading-none">OK</small>
                                    </div>
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                    ))}
                </div>
            </div>
    );
};
