'use client'

import { Check, Close, Delete, Edit } from "@mui/icons-material"
import { CircularProgress, IconButton, List, ListItem, Typography } from "@mui/material"
import Cookies from "js-cookie"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getPostRequestOptions, verifyElasticWithTimeout } from "../../../pages/api/create-search-object"
import AddUrl from "./AddUrl"

export default function UrlList({ urlObjects, toggle }) {
    return (
        <>
            <Typography variant='h6' className='admin-url-list-title'>
                Available Elastic URLs
            </Typography>
            <List>
                <UrlListHeader />
                {urlObjects.map((urlObject, index) => (
                    <UrlListItem key={index} urlObject={urlObject} toggle={toggle} />
                ))}
            </List>
            <AddUrl toggle={toggle} />
        </>
    )
}

function UrlListHeader() {
    return (
        <ListItem>
            <Typography variant='h6' style={adminUrlListUrlStyle}>
                Url
            </Typography>
            <Typography variant='h6' style={adminUrlListNameStyle}>
                Name
            </Typography>
            <Typography variant='h6' style={adminUrlListButtonStyle}>
                available?
            </Typography>
            <Typography variant='h6' style={adminUrlListButtonStyle}>
                Edit
            </Typography>
            <Typography variant='h6' style={adminUrlListButtonStyle}>
                Delete
            </Typography> 
        </ListItem>
    )
}

function UrlListItem({ urlObject, toggle }) {
    const [valid, setValid] = useState(false)
    const [loading, setLoading] = useState(true)

    async function handleDelete() {
        await deleteItemFromAvailableUrls(urlObject.id)
        toggle()
    }

    useEffect(() => {
        async function validateEnviroment(){
            setLoading(true)
            let response = await verifyElasticWithTimeout(urlObject.url)
            setValid(response)
            setLoading(false)
        }
        validateEnviroment()
    },[])


    return (
        <ListItem style={adminUrlListStyle}>
            <Typography style={adminUrlListUrlStyle}>
                <Link style={{color: 'inherit', textDecoration: 'none'}} href={`elastic-instances/${urlObject.id}`}>
                    {urlObject.url}
                </Link>
            </Typography>
            <Typography style={adminUrlListNameStyle}>
                <Link style={{color: 'inherit', textDecoration: 'none'}} href={`elastic-instances/${urlObject.id}`}>
                    {urlObject.name}
                </Link>
            </Typography>
            <IconButton style={adminUrlListButtonStyle}>
                {loading ? <CircularProgress size='1em' /> : valid ? <Check color="success" /> : <Close color="error"/>}
            </IconButton>
            <IconButton disabled style={adminUrlListButtonStyle}>
                <Edit />
            </IconButton>           
            <IconButton color='error' onClick={handleDelete} style={adminUrlListButtonStyle}>
                <Delete />
            </IconButton> 
        </ListItem>
    )
}

const adminUrlListStyle = {
    display: 'flex',
}

const adminUrlListUrlStyle = {
    flex: '4'
}

const adminUrlListNameStyle = {
    flex: '2'
}

const adminUrlListButtonStyle = {
    flex: '1'
}

/**
 * Deletes an item from the available-urls index
 * @param {string} id of the item to delete
 */
export async function deleteItemFromAvailableUrls(id){
    let requestOptions = getPostRequestOptions()
    const url = Cookies.get('adminElasticUrl')
    requestOptions.method = 'DELETE'
    await fetch(`${url}/available-urls/_doc/${id}`, requestOptions)
}
