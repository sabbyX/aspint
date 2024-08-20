import {z} from 'zod'

const formSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
    perfDateRange: z.object({
        from: z.date(),
        to: z.date(),
    })
})

export default function Home() {
    //const form = useForm();
    return (
        <main>
            <div className="">
                <h2 className=" text-3xl font-semibold tracking-tight first:mt-0">
                    New Application
                </h2>
                <input/>
            </div>
        </main>
    );}

