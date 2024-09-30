"use server"

export async function verifyUser() {
    const response = await fetch(
        `http://backend:8000/`,
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "username": "test",
                "password": "test",
            })
        }
    )
    const responseData = response.json();
    console.log(responseData);
}
