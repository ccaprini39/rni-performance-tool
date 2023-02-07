'use client'

import { CircularProgress, MenuItem, Select } from "@mui/material"
import { useEffect, useState } from "react"
import { getAvailableElasticUrls } from "../pages/api/create-search-object"

export default function AvailableUrlsDropdown({setUrl}){

    const [urls, setUrls] = useState([])
    const [selectedUrl, setSelectedUrl] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadUrls(){
            setLoading(true)
            const data = await getAvailableElasticUrls()
            setUrls(data)
            setSelectedUrl(data[0])
            setLoading(false)
        }
        loadUrls()
    },[])

    useEffect(() => {
        setUrl(selectedUrl)
    },[selectedUrl])

    if(loading) return <CircularProgress />
    return (
        <Select value={selectedUrl} onChange={e => setSelectedUrl(e.target.value.url)}>
            {urls.map((url, index) => 
                <MenuItem key={index} value={url}>
                    {url.name}
                </MenuItem>
            )}
        </Select>
    )
}