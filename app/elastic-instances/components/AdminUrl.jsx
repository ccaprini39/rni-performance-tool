'use client'

import { Button, FormGroup, TextField } from "@mui/material"
import Cookies from "js-cookie"
import { useState } from "react"
import { verifyElasticWithTimeout } from "../../../pages/api/create-search-object"

export default function AdminUrl({toggle}){
    const [adminUrlInput, setAdminUrlInput] = useState('') 
    const [valid, setValid] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('Enter a valid url.  Example: "http://localhost:9200"')

    async function handleUrlChange(e){
        const url = e.target.value
        setAdminUrlInput(url)
        const valid = await verifyElasticWithTimeout(url)
        if(valid){
            setValid(true)
            setMessage(valid)
            return
        } else {
            setValid(false)
            setMessage('Enter a valid url.  Example: "http://localhost:9200"')
        }
    }

    function handleSubmit(){
        Cookies.set('adminElasticUrl', adminUrlInput)
        toggle()
    }

    return(
        <FormGroup row>
            <TextField 
                id="adminUrl" 
                fullWidth
                label="Admin Url" 
                variant="standard" 
                error={!valid}
                helperText={message}
                value={adminUrlInput} 
                onChange={handleUrlChange} 
            />
            <Button disabled={!valid} type="submit" color="primary" variant="contained" onClick={handleSubmit}>Update</Button>
        </FormGroup>
    )
}

