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
                    <UptimeBar centerCode="gbLON2be" center="London" />
                    <UptimeBar centerCode="gbMNC2be" center="Manchester" />
                    <UptimeBar centerCode="gbEDI2be" center="Edinburgh" />
                </CardContent>
            </Card>
            <Card className="w-[450px]">
                <CardHeader>
                    <div className="flex flex-row">
                        <CardTitle className="flex flex-row self-center">{emoji('🇫🇷 France')}</CardTitle>
                        <Button className="ml-auto" variant="link">View detailed logs</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <UptimeBar centerCode="gbLON2fr" center="London" />
                    <UptimeBar centerCode="gbMNC2fr" center="Manchester" />
                    <UptimeBar centerCode="gbEDI2fr" center="Edinburgh" />
                </CardContent>
            </Card>
            <Card className="w-[450px] lg:justify-self-end">
                <CardHeader>
                    <div className="flex flex-row">
                        <CardTitle className="flex flex-row self-center">{emoji('🇩🇪 Germany')}</CardTitle>
                        <Button className="ml-auto" variant="link">View detailed logs</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <UptimeBar centerCode="gbLON2de" center="London" />
                    <UptimeBar centerCode="gbMNC2de" center="Manchester" />
                    <UptimeBar centerCode="gbEDI2de" center="Edinburgh" />
                </CardContent>
            </Card>
            <Card className="w-[450px]">
                <CardHeader>
                    <div className="flex flex-row">
                        <CardTitle className="flex flex-row self-center">{emoji('🇨🇭 Switzerland')}</CardTitle>
                        <Button className="ml-auto" variant="link">View detailed logs</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <UptimeBar centerCode="gbLON2ch" center="London" />
                    <UptimeBar centerCode="gbMNC2ch" center="Manchester" />
                    <UptimeBar centerCode="gbEDI2ch" center="Edinburgh"/>
                </CardContent>
            </Card>
        </div>
    )
}
