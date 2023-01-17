'use client'

import { Add, Publish, Remove } from "@mui/icons-material"
import { FormGroup, IconButton, TextField } from "@mui/material"
import { useState } from "react"

//React component that allows the user to add a new url to the database
export default function AddUrl({toggle}) {
    const [url, setUrl] = useState('')
    const [name, setName] = useState('')
    const [formVisible, setFormVisible] = useState(false)
    function toggleFormVisible(){ setFormVisible(!formVisible) }

    async function handleSubmit(e) {
        e.preventDefault()
        const object = { url : url, name : name }
        try {
            await addItemToAvailableUrls(object)
        } catch (error) {
            alert(error.message)
        }
        setUrl('')
        setName('')
        toggleFormVisible()
        toggle()
    }

    return (
        <>
            <IconButton onClick={toggleFormVisible}>
                {formVisible ? <Remove /> : <Add />}
            </IconButton>
            {formVisible && (
                <FormGroup>
                    <TextField
                        label='Url'
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <TextField
                        label='Name'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <IconButton type="submit" color="primary" onClick={handleSubmit}>
                        <Publish />
                    </IconButton>
                </FormGroup>
            )}
        </>
    )
}

/**
 * Function to add a new url to the available-urls index
 * @param {object} {name, url} object with name and url properties
 */
export async function addItemToAvailableUrls({name, url}){
    let requestOptions = getPostRequestOptions({
        name: name,
        url: url
    })
    requestOptions.method = 'POST'
    await fetch(`${url}/available-urls/_doc`, requestOptions)
}


/**
 * helper function to get the options for a post request
 * @param {object} bodyJson body of the request
 * @returns 
 */
export function getPostRequestOptions(bodyJson = null){
    if (bodyJson === null) {
        return {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }
    } else return {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body : JSON.stringify(bodyJson)
    }
}