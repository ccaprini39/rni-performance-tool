'use client'

import { createWindowSizeIndex } from "../../pages/api/window-feature"
import { TextField, Button } from "@mui/material"
import { useState } from "react"
import { indexLeonard, queryLeonard } from "../../pages/api/window-feature-tools/l-cohen"

export default function WindowFeaturePage(){

    const [response, setResponse] = useState(null)
    const [url, setUrl] = useState('')

    async function handleCreateLeonard(){
        await createWindowSizeIndex(url)
        await indexLeonard(url)
        const result = await queryLeonard(url)
        setResponse(result)
    }

    return (
        <div>
            <TextField
                label="URL" 
                value={url}
                onChange={e => setUrl(e.target.value)} 
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleCreateLeonard}
            >
                Create Leonard
            </Button>
            <pre>
                {JSON.stringify(response, null, 2)}
            </pre>
        </div>
    )
}