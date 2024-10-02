import {Request, Response} from 'express'

/**
 * @param {Request} request
 * @param {Response} response
 */
export async function queueAutobook(request, response) {
    const data = await request.json()

    try {
        const username = data['username'];
        const password = data['password'];
        const fg_id = data['fg_id'];
        const country = data['country'];
        const center = data['center'];
        const selected_slot = data['slot'];
        const is_flexible = data['is_flexible'];
    } catch (e) {
        response.status(500)
        response.json({"error": e.toString()});
        response.send()
        return;
    }
    response.on("finish", () => {
        //tojod58333@skrak.com
    })
}
