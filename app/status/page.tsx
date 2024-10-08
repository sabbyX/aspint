import {UptimeBar} from '@/components/uptimeBar';
import {Badge} from "@/components/ui/badge";
import emoji from 'react-easy-emoji'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Button} from "@/components/ui/button";

export default function StatusPage() {
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
                        <UptimeBar center="gbLON2be"/>
                    </div>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-sm font-semibold leading-none">Manchester</p>
                            <Badge className="ml-auto" variant="destructive">Failing</Badge>
                        </div>
                        <UptimeBar center="gbMNC2be"/>
                    </div>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-sm font-semibold leading-none">Edinburgh</p>
                            <Badge className="ml-auto" variant="destructive">Failing</Badge>
                        </div>
                        <UptimeBar center="gbEDI2be"/>
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
                        <UptimeBar center="gbLON2fr"/>
                    </div>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-sm font-semibold leading-none">Manchester</p>
                            <Badge className="ml-auto" variant="destructive">Failing</Badge>
                        </div>
                        <UptimeBar center="gbMNC2fr"/>
                    </div>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-sm font-semibold leading-none">Edinburgh</p>
                            <Badge className="ml-auto" variant="destructive">Failing</Badge>
                        </div>
                        <UptimeBar center="gbEDI2fr"/>
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
                        <UptimeBar center="gbLON2de"/>
                    </div>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-sm font-semibold leading-none">Manchester</p>
                            <Badge className="ml-auto" variant="destructive">Failing</Badge>
                        </div>
                        <UptimeBar center="gbMNC2de"/>
                    </div>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-sm font-semibold leading-none">Edinburgh</p>
                            <Badge className="ml-auto" variant="destructive">Failing</Badge>
                        </div>
                        <UptimeBar center="gbEDI2de"/>
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
                        <UptimeBar center="gbLON2ch"/>
                    </div>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-sm font-semibold leading-none">Manchester</p>
                            <Badge className="ml-auto" variant="destructive">Failing</Badge>
                        </div>
                        <UptimeBar center="gbMNC2ch"/>
                    </div>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-sm font-semibold leading-none">Edinburgh</p>
                            <Badge className="ml-auto" variant="destructive">Failing</Badge>
                        </div>
                        <UptimeBar center="gbEDI2ch"/>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
