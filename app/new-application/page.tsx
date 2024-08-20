import {useForm} from "react-hook-form";

export default function Page() {
    const form = useForm()
    return (
        <main>
            <div className="">
                <h2 className=" text-3xl font-semibold tracking-tight first:mt-0">
                    New Application
                </h2>
            </div>
        </main>
    );
}
