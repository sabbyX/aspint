import {UptimeBar} from '@/components/uptimeBar';
import {Badge} from "@/components/ui/badge";
import emoji from 'react-easy-emoji'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Button} from "@/components/ui/button";

export default function StatusPage() {
    const data = {
        uptimePercentage: 99.95, // Calculated based on uptime in those 5 hours
        todayUptime: 100,
        statuses: Array(50).fill('up').concat(Array(10).fill('down')), // Simulating service status for 60 intervals
    };

    return (
        <div className="flex items-center xl:grid flex-col grid-cols-2 gap-10">
            <Card className="w-[450px] lg:justify-self-end">
                <CardHeader>
                    <div className="flex flex-row">
                        <CardTitle className="flex flex-row self-center">{emoji('🇧🇪 Belgium')}</CardTitle>
                        <Button className="ml-auto" variant="link">View detailed logs</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-sm font-semibold leading-none">London</p>
                            <Badge className="ml-auto" variant="destructive">Failing</Badge>
                        </div>
                        <UptimeBar data={data}/>
                    </div>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-sm font-semibold leading-none">Manchester</p>
                            <Badge className="ml-auto" variant="destructive">Failing</Badge>
                        </div>
                        <UptimeBar data={data}/>
                    </div>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-sm font-semibold leading-none">Edinburgh</p>
                            <Badge className="ml-auto" variant="destructive">Failing</Badge>
                        </div>
                        <UptimeBar data={data}/>
                    </div>
                </CardContent>
            </Card>
            <Card className="w-[450px]">
                <CardHeader>
                    <div className="flex flex-row">
                        <CardTitle className="flex flex-row self-center">{emoji('🇫🇷 France')}</CardTitle>
                        <Button className="ml-auto" variant="link">Detailed logs</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-sm font-semibold leading-none">London</p>
                            <Badge className="ml-auto" variant="destructive">Failing</Badge>
                        </div>
                        <UptimeBar data={data}/>
                    </div>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-sm font-semibold leading-none">Manchester</p>
                            <Badge className="ml-auto" variant="destructive">Failing</Badge>
                        </div>
                        <UptimeBar data={data}/>
                    </div>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-sm font-semibold leading-none">Edinburgh</p>
                            <Badge className="ml-auto" variant="destructive">Failing</Badge>
                        </div>
                        <UptimeBar data={data}/>
                    </div>
                </CardContent>
            </Card>
            <Card className="w-[450px] lg:justify-self-end">
                <CardHeader>
                    <div className="flex flex-row">
                        <CardTitle className="flex flex-row self-center">{emoji('🇩🇪 Germany')}</CardTitle>
                        <Button className="ml-auto" variant="link">Detailed logs</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-sm font-semibold leading-none">London</p>
                            <Badge className="ml-auto" variant="destructive">Failing</Badge>
                        </div>
                        <UptimeBar data={data}/>
                    </div>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-sm font-semibold leading-none">Manchester</p>
                            <Badge className="ml-auto" variant="destructive">Failing</Badge>
                        </div>
                        <UptimeBar data={data}/>
                    </div>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-sm font-semibold leading-none">Edinburgh</p>
                            <Badge className="ml-auto" variant="destructive">Failing</Badge>
                        </div>
                        <UptimeBar data={data}/>
                    </div>
                </CardContent>
            </Card>
            <Card className="w-[450px]">
                <CardHeader>
                    <div className="flex flex-row">
                        <CardTitle className="flex flex-row self-center">{emoji('🇨🇭 Switzerland')}</CardTitle>
                        <Button className="ml-auto" variant="link">Detailed logs</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-sm font-semibold leading-none">London</p>
                            <Badge className="ml-auto" variant="destructive">Failing</Badge>
                        </div>
                        <UptimeBar data={data}/>
                    </div>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-sm font-semibold leading-none">Manchester</p>
                            <Badge className="ml-auto" variant="destructive">Failing</Badge>
                        </div>
                        <UptimeBar data={data}/>
                    </div>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-sm font-semibold leading-none">Edinburgh</p>
                            <Badge className="ml-auto" variant="destructive">Failing</Badge>
                        </div>
                        <UptimeBar data={data}/>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
