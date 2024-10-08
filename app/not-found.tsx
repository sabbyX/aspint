import { Button } from "@/components/ui/button";

export default function Custom404() {
    return (
        <>
        <html className="h-full">
            <body className="h-full grid place-items-center px-6 py-24 sm:py-32 lg:px-8 bg-[url('/404.png')] bg-cover">
                {/*<main className="">*/}
                    <div className="text-center">
                        <p className="text-base font-semibold text-gray-100">404</p>
                        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-100 sm:text-5xl">Page not found</h1>
                        <p className="mt-6 text-xl leading-7 text-gray-200">Sorry, we couldn’t find the page you’re looking for.</p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Button variant="link">
                                <p className="text-gray-100">Go back home</p>
                            </Button>
                        </div>
                    </div>
                {/*</main>*/}
            </body>
        </html>
        </>
    )
}
