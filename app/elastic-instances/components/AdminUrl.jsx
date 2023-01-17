'use client'

import { Button, FormGroup, TextField } from "@mui/material"
import Cookies from "js-cookie"
import { useState } from "react"

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

/**
 * helper function to verify that the url is a valid elastic url
 * @param {string} url 
 * @param {int} timeout timeout in milliseconds
 * @returns 
 */
export async function verifyElasticWithTimeout(url, timeout = 100){
    let response
    try {
        response = await fetch(url, {timeout: timeout})
        let responseJson = await response.json()
        if(response.ok && responseJson.cluster_name){
            return "Elastic is up and running: cluster name is : " + responseJson.cluster_name
        }
    } catch (error) {
        return false
    }
    return false
}