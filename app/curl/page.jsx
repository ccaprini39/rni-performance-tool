'use client'

import { Button, Select, Tabs, TextInput, Textarea } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import { MantineProvider } from "@mantine/styles"
import { useState } from "react"
import { defaultHeaders } from "../../pages/api/curl"

import './curl.css'

export default function CurlPage() {
    const methods = 
    [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' },
        { label: 'PATCH', value: 'PATCH' }
    ]
    const [method, setMethod] = useState(methods[0])
    const [url, setUrl] = useState('http://ec2-3-17-180-49.us-east-2.compute.amazonaws.com:9200')
    const [endpoint, setEndpoint] = useState('')

    const [headers, setHeaders] = useState(JSON.stringify(defaultHeaders))
    const [body, setBody] = useState('{}')

    const [response, setResponse] = useState({})

    const [history, setHistory] = useLocalStorage('curl-history', [])

    const [loading, setLoading] = useState(false)

    async function handleSendRequest(e){
        e.preventDefault()
        //send a request to the api endpoing curl
        //set the response to the response state
        //add the request to the history
        setLoading(true)
        const res = await fetch('/api/curl', {

            method: "POST",
            headers: defaultHeaders,
            body: JSON.stringify({
                method: method.value,
                url: url + endpoint,
                headers: headers,
                body: body
            })
        })
        const data = await res.json()
        setResponse(data)
    }

    return (
        <MantineProvider>
            <h1>Curl Page</h1>
            <div className="curl-page">
                {/* <div className="sidebar">
                    <h1>sidebar</h1>
                </div> */}
                <div className="main-content">
                    <div className="url-view">
                        <h3>{ url + endpoint }</h3>
                    </div>
                    <div>
                        <form className="url-view">
                            <Select 
                                style={{flex: 1}}
                                clearable
                                value={method}
                                onChange={setMethod}
                                data={methods}
                            />
                            {/* //text input of url */}
                            <TextInput 
                                style={{flex: 6}}
                                placeholder="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                            {/* //text input of endpoint */}
                            <TextInput
                                style={{flex: 3}}
                                placeholder="endpoint"
                                value={endpoint}
                                onChange={(e) => setEndpoint(e.target.value)}
                            />
                            <Button style={{flex: .5}} type="submit" onClick={handleSendRequest}>Send Request</Button>
                        </form>
                    </div>
                    <div className="request-box">
                        <h3>Request</h3>
                        <Textarea
                            style={{height: '100%'}} 
                            placeholder="body"
                            value={body}
                            minRows={12}
                            onChange={(e) => setBody(e.target.value)}
                        />
                        request setter
                    </div>
                    <div className="response-box">
                        response
                        <pre style={{whiteSpace: 'pre-wrap'}}>{JSON.stringify(response, null, 2)}</pre>
                    </div>
                </div>
            </div>
        </MantineProvider>
    )

}