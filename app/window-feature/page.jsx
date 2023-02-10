'use client'

import { useState } from "react"
import { executeBigLeonard, indexLeonard, queryLeonard } from "../../pages/api/window-feature-tools/l-cohen"
import { createWindowSizeIndex, getIndexInfo, indexInfoDefault } from "../../pages/api/window-feature"
import AvailableUrlsDropdown from "../../components/AvailableUrlsDropdown"
import { Button, CircularProgress, FormGroup } from "@mui/material"
import { useEffect } from "react"
import { sleep } from "../../pages/api/create-search-object"
import { IndexInfo } from "../../pages/api/window-feature-tools/components"

export default function WindowFeaturePage(){

    const [response, setResponse] = useState(null)
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [indexInfo, setIndexInfo] = useState(indexInfoDefault)


    async function handleCreateLeonard(){
        setLoading(true)
        const result = await executeBigLeonard(url)
        setResponse(result)
        setLoading(false)
    }

    useEffect(() => {
        async function loadIndexInfo(){
            const result = await getIndexInfo(url.url, 'window-test')
            setIndexInfo(result)
        }
        url.url && loadIndexInfo()
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
            <IndexInfo indexInfo={indexInfo} />
            <pre>
                {JSON.stringify(response, null, 2)}
            </pre>
        </div>
    )
}