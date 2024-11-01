// auto generated


type Props = { className?: string }

const Skeleton = ({ className }: Props) => (
    <div aria-live="polite" aria-busy="true" className={className}>
    <span className="inline-flex w-full animate-pulse select-none rounded-md bg-gray-300 leading-none">
      ‌
    </span>
        <br />
    </div>
)

const SVGSkeleton = ({ className }: Props) => (
    <svg
        className={
            className + " animate-pulse rounded bg-gray-300"
        }
    />
)

export default function QueueTableSkeleton(){
    return (
        <>
            <div className="w-full">
                <div className="flex items-center py-4">
                    <div className="flex h-9 w-full border border-input px-3 py-1 shadow-sm transition-colors file:border-0 rounded-[10px] max-w-sm">
                        <Skeleton className="w-[208px] max-w-full" />
                    </div>
                </div>
                <div className="border">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom">
                            <thead className="[&amp;_tr]:border-b">
                            <tr className="border-b transition-colors">
                                <th className="h-10 px-2 text-left align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div className="h-4 w-4 shrink-0 border border-primary rounded-[5px]"></div>
                                </th>
                                <th className="h-10 px-2 text-left align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <Skeleton className="w-[32px] max-w-full" />
                                </th>
                                <th className="h-10 px-2 text-left align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <Skeleton className="w-[48px] max-w-full" />
                                </th>
                                <th className="h-10 px-2 text-left align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div className="inline-flex items-center justify-center transition-colors h-9 px-4 py-2 pl-0">
                                        <Skeleton className="w-[48px] max-w-full" />
                                        <SVGSkeleton className="ml-2 w-[15px] h-[15px]" />
                                    </div>
                                </th>
                                <th className="h-10 px-2 text-left align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div className="inline-flex items-center justify-center transition-colors h-9 px-4 py-2 pl-0">
                                        <Skeleton className="w-[40px] max-w-full" />
                                        <SVGSkeleton className="ml-2 w-[15px] h-[15px]" />
                                    </div>
                                </th>
                                <th className="h-10 px-2 text-left align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]"></th>
                            </tr>
                            </thead>
                            <tbody className="[&amp;_tr:last-child]:border-0">
                            <tr className="border-b transition-colors">
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div className="h-4 w-4 shrink-0 border border-primary rounded-[5px]"></div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div>
                                        <Skeleton className="w-[56px] max-w-full" />
                                    </div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div>
                                        <Skeleton className="w-[56px] max-w-full" />
                                    </div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div>
                                        <Skeleton className="w-[56px] max-w-full" />
                                    </div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div>
                                        <Skeleton className="w-[120px] max-w-full" />
                                    </div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div className="inline-flex items-center justify-center transition-colors h-8 w-8 p-0">
                                        <SVGSkeleton className="w-[15px] h-[15px]" />
                                    </div>
                                </td>
                            </tr>
                            <tr className="border-b transition-colors">
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div className="h-4 w-4 shrink-0 border border-primary rounded-[5px]"></div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div>
                                        <Skeleton className="w-[40px] max-w-full" />
                                    </div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div>
                                        <Skeleton className="w-[56px] max-w-full" />
                                    </div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div>
                                        <Skeleton className="w-[56px] max-w-full" />
                                    </div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div>
                                        <Skeleton className="w-[120px] max-w-full" />
                                    </div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div className="inline-flex items-center justify-center transition-colors h-8 w-8 p-0">
                                        <SVGSkeleton className="w-[15px] h-[15px]" />
                                    </div>
                                </td>
                            </tr>
                            <tr className="border-b transition-colors">
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div className="h-4 w-4 shrink-0 border border-primary rounded-[5px]"></div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div>
                                        <Skeleton className="w-[40px] max-w-full" />
                                    </div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div>
                                        <Skeleton className="w-[80px] max-w-full" />
                                    </div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div>
                                        <Skeleton className="w-[56px] max-w-full" />
                                    </div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div>
                                        <Skeleton className="w-[168px] max-w-full" />
                                    </div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div className="inline-flex items-center justify-center transition-colors h-8 w-8 p-0">
                                        <SVGSkeleton className="w-[15px] h-[15px]" />
                                    </div>
                                </td>
                            </tr>
                            <tr className="border-b transition-colors">
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div className="h-4 w-4 shrink-0 border border-primary rounded-[5px]"></div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div>
                                        <Skeleton className="w-[40px] max-w-full" />
                                    </div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div>
                                        <Skeleton className="w-[56px] max-w-full" />
                                    </div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div>
                                        <Skeleton className="w-[48px] max-w-full" />
                                    </div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div>
                                        <Skeleton className="w-[136px] max-w-full" />
                                    </div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div className="inline-flex items-center justify-center transition-colors h-8 w-8 p-0">
                                        <SVGSkeleton className="w-[15px] h-[15px]" />
                                    </div>
                                </td>
                            </tr>
                            <tr className="border-b transition-colors">
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div className="h-4 w-4 shrink-0 border border-primary rounded-[5px]"></div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div>
                                        <Skeleton className="w-[16px] max-w-full" />
                                    </div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div>
                                        <Skeleton className="w-[48px] max-w-full" />
                                    </div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div>
                                        <Skeleton className="w-[88px] max-w-full" />
                                    </div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div>
                                        <Skeleton className="w-[160px] max-w-full" />
                                    </div>
                                </td>
                                <td className="p-2 align-middle [&amp;:has([role=checkbox])]:pr-0 [&amp;>[role=checkbox]]:translate-y-[2px]">
                                    <div className="inline-flex items-center justify-center transition-colors h-8 w-8 p-0">
                                        <SVGSkeleton className="w-[15px] h-[15px]" />
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1">
                        <Skeleton className="w-[184px] max-w-full" />
                    </div>
                    <div className="space-x-2">
                        <div className="inline-flex items-center justify-center transition-colors border border-input rounded-[10px] shadow-sm h-8 px-3">
                            <Skeleton className="w-[64px] max-w-full" />
                        </div>
                        <div className="inline-flex items-center justify-center transition-colors border border-input rounded-[10px] shadow-sm h-8 px-3">
                            <Skeleton className="w-[32px] max-w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}