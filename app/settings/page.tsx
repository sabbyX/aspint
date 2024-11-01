import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {Card} from "@/components/ui/card";
import {ChevronRight, LinkIcon} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
    return (
        <div>
            <div className="ml-5">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Settings</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="ml-5 mt-10">
                <Link href="/settings/listenerSettings">
                    <Card className="flex flex-row items-center space-x-3 space-y-0 justify-between rounded-lg border p-3 shadow-sm max-w-[800px] min-h-[70px] hover:bg-muted/50">
                        <div className="flex flex-row items-center w-full">
                            <div className="p-2">
                                <LinkIcon className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col ml-2">
                                <text className="text-sm">Listener Settings</text>
                                <text className="text-sm text-muted-foreground">Change slot listener account credentials</text>
                            </div>
                            <div className="ml-auto">
                                <ChevronRight className="h-5 w-5"/>
                            </div>
                        </div>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
