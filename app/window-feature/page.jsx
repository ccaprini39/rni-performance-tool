'use client'

import { useState } from "react"
import { indexLeonard, queryLeonard } from "../../pages/api/window-feature-tools/l-cohen"
import { createWindowSizeIndex } from "../../pages/api/window-feature"
import AvailableUrlsDropdown from "../../components/AvailableUrlsDropdown"
import { Button, CircularProgress, FormGroup } from "@mui/material"
import { useEffect } from "react"
import { sleep } from "../../pages/api/create-search-object"

export default function WindowFeaturePage(){

    const [response, setResponse] = useState(null)
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleCreateLeonard(){
        setLoading(true)
        await createWindowSizeIndex(url.url)
        await indexLeonard(url.url)
        await sleep(2000)
        const result = await queryLeonard(url.url, 5)
        setResponse(result)
        setLoading(false)
    }

    useEffect(() => {
        async function load(){
            setLoading(true)
            console.log(url)
            setLoading(false)
        }
        load()
    },[url])

    if(loading) return <CircularProgress />
    return (
        <div>
            <h1>Window Feature Page</h1>
            <FormGroup row>
                <AvailableUrlsDropdown setUrl={setUrl} />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateLeonard}
                >
                    Create Leonard
                </Button>
            </FormGroup>
            <pre>
                {JSON.stringify(response, null, 2)}
            </pre>
        </div>
    )
}