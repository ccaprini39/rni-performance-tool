export default async function handler(req, res) {
    const response = {response : "Hello World"}
    const { method, url, headers, body } = req
    res.status(200).json(response)
}

export const defaultHeaders =  {
    'Content-Type': 'application/json',
}

async function fetcher(method, url, headers, body) {
    const response = await fetch(url, {
        method: method,
        headers: headers,
        body: body,
    })
    return response.json()
}