'use client'

import { Refresh } from "@mui/icons-material"
import { Button, CircularProgress, FormGroup, FormLabel, IconButton, Input, TextField } from "@mui/material"
import Cookies from "js-cookie"
import { useEffect, useState } from "react"
import LoadingComponent from "../../../components/LoadingComponent"
import { sleep, verifyElasticWithTimeout } from "../../../pages/api/create-search-object"
import { getCountOfDocsInIndex } from "../../../pages/api/multi-search-and-save"
import IndexTable, { checkThatTestingIndicesExist, createOneHundredDocs, CreateOneHundredDocsButton, CreateTestingIndicesButton, DeleteTestingIndicesButton, OverAllGrid, RecreateTestingIndicesButton } from "./components"

export default function InstancePage({params}){

    const [loading, setLoading] = useState(true)
    //state hooks for health, plugins, indices, nodeStats, clusterStats
    const [health, setHealth] = useState({})
    const [plugins, setPlugins] = useState([])
    const [indices, setIndices] = useState([])
    const [nodeStats, setNodeStats] = useState({})
    const [clusterStats, setClusterStats] = useState({})
    const [url, setUrl] = useState('')
    const [name, setName] = useState('')
    const [value, setValue] = useState(0)
    const [testingIndiciesExist, setTestingIndiciesExist] = useState(false)
    const toggleValue = () => setValue(value === 0 ? 1 : 0)

    useEffect(() => {
        async function loadInstance(){
            setLoading(true)
            const {url, name} = await getAvailableUrlById(params.id)
            setHealth(await getElasticInstanceHealth(url))
            setPlugins(await getElasticPlugins(url))
            setIndices(await getNonHiddenIndices(url))
            const indices = await getNonHiddenIndices(url)
            setNodeStats(await getElasticNodesStats(url))
            setClusterStats(await getElasticClusterStats(url))
            setTestingIndiciesExist(await checkThatTestingIndicesExist(url))
            setUrl(url)
            setName(name)
            await sleep(500)
            setLoading(false)
        }
        loadInstance()
    },[value])

    if(loading) return <LoadingComponent />
    return (
        <div>
            <h1>{name}</h1>
            <span>
                <h3 style={headerStyle}>
                    Instance Url: {url}
                    <IconButton size="large" color="success" onClick={toggleValue}>
                        <Refresh />
                    </IconButton>
                </h3>
            </span>

            <OverAllGrid health={health[0]} 
                plugins={plugins} 
                indices={indices} 
                nodesStats={nodeStats} 
                clusterStats={clusterStats} 
            />
            <IndexTable indices={indices} />
            {testingIndiciesExist ?
                //the indices exist
                <>
                    <span>
                        <CreateDocsForm toggle={toggleValue} url={url} />
                        <br />
                    </span>
                    <span>
                        <DeleteTestingIndicesButton toggle={toggleValue} url={url} />
                        <RecreateTestingIndicesButton toggle={toggleValue} url={url} />
                    </span>
                </>
                :
                <>
                    <CreateTestingIndicesButton toggle={toggleValue} url={url} />
                </>
            }

        </div>
    )
}

/**
 * Get the plugins of a specific cluster
 * @param {*} url the url of the elastic instance
 * @returns the plugins if successful, false if not
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-nodes-info.html
 */
export async function getElasticClusterStats(url){
    const response = await fetch(url + '/_cluster/stats')
    const data = await response.json()
    return data
}

/**
 * Get the cluster health information from the elastic instance
 * @param {string} url the url of the elastic instance
 * @returns an array of cluster health information if successful, false if not
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-health.html
 */
export async function getElasticInstanceHealth(url) {
    try {
        const res = await fetch(`${url}/_cat/health?format=json`, {
            method: 'GET'
        })
        const data = await res.json()
        return data
    } catch (error) {
        return false
    }
}

/**
 * Get the settings of a specific cluster
 * @param {*} url the url of the elastic instance
 * @returns the nodes stats if successful, false if not
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-nodes-stats.html
 */
export async function getElasticNodesStats(url){
    try {
        const res = await fetch(`${url}/_nodes/stats?format=json`, {
            method: 'GET'
        })
        const data = await res.json()
        return data
    } catch (error) {
        return false
    }
}

/**
 * Get the pligins installed on the elastic instance
 * @param {string} url the url of the elastic instance
 * @returns an array of plugins if successful, false if not
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-plugins.html
 */
export async function getElasticPlugins(url) {
    try {
        const res = await fetch(`${url}/_cat/plugins?format=json`, {
            method: 'GET'
        })
        const data = await res.json()
        return data
    } catch (error) {
        return false
    }
}

/**
 * Gets the list of non hidden indices from the elastic instance.  
 * Hidden indices start with a '.', so this function filters out those indices
 * @param {string} url 
 * @returns all of the non hidden indices if successful, false if not
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-get-settings.html
 */
export async function getNonHiddenIndices(url){
    try {
        const res = await fetch(`${url}/_cat/indices?format=json`, {
            method: 'GET'
        })
        const data = await res.json()
        const copy = []
        for await (const element of data) {
            if(!element.index.startsWith('.')){
                const realCount = await getCountOfDocsInIndex(url, element.index)
                copy.push({...element, count : realCount })
            }
        }
        return copy
    } catch (error) {
        return false
    }
}

/**
 * Gets an available elastic url by id
 * @param {string} id the id of the available elastic url
 * @returns the available elastic url if successful, false if not
 */
export async function getAvailableUrlById(id){
    let cookie = Cookies.get('adminElasticUrl')
    if(cookie){
        const valid = await verifyElasticWithTimeout(cookie)
        if(!valid){
            console.log('Admin elastic url is not valid')
            return false
        }
        let response = await basicGetRequest(`${cookie}/available-urls/_doc/${id}?format=json`)
        if (!response.ok) {
            console.error('Error getting available url by id')
            return false
        }
        response = await response.json()
        const result = response._source
        return result
    }else{
        //if the cookie does not exist, return false
        console.log('No admin elastic url set')
        return false
    }
}

/**
 * helper function to make a basic get request
 * @param {string} url the url to make the get request to
 * @returns the response if successful, false if not
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 */
export async function basicGetRequest(url){
    async function fetchResult(){
        const requestOptions = {
            method : 'GET'
        }
        try {
            let response = await fetch(url, requestOptions)
            return response
        }
        catch (error) {
            console.error(error)
            return error
        }
    }
    const result = await fetchResult()
    return result
}

/**
 * checks if a number is a multiple of 100
 * @param {number} number the number to check
 * @returns true if the number is a multiple of 100, false if not
 * @example checkMultipleOfHundred(100) //returns true
 * @example checkMultipleOfHundred(101) //returns false
 */
export function checkMultipleOfHundred (number){
    if(number % 100 === 0){
        return true
    }else{
        return false
    }
}

/**
 * bulk indexes a multiple of 100 nested documents and their flattened versions
 * @param {string} url the url of the elastic instance
 * @param {number} number the number of documents to index
 */
export async function multipleBulkIndex(url, number){
    const iterations = Math.floor(number / 100)
    for await (const _ of Array(iterations).keys()) {
        await createOneHundredDocs(url)
    }
}

function CreateDocsForm({url, toggle}){
    //this react component is a form that has an input for the number of documents to create
    //this value will be validated to make sure it is a multiple of 100
    //if it is not a multiple of 100, the submit button will be disabled
    const [number, setNumber] = useState(0)
    const [valid, setValid] = useState(false)
    const [running, setRunning] = useState(false)
    
    useEffect(() => {
        if(checkMultipleOfHundred(number)){
            setValid(true)
        }else{
            setValid(false)
        }
    }, [number])

    async function handleSubmit(){
        setRunning(true)
        await multipleBulkIndex(url, number)
        setRunning(false)
        toggle()
    }

    if(running) return <CircularProgress />
    else return (
        <FormGroup style={formStyle} row>
            <TextField 
                label="Number of documents to create" type="number" name="number" id="number" placeholder="number" value={number} onChange={(e) => setNumber(e.target.value)} />
            <Button variant="contained" color="success" disabled={!valid || running} onClick={handleSubmit}>Create</Button>
        </FormGroup>
    )
}

const headerStyle = 
{
    display: 'flex',
    justifyContent: 'space-between'
}

const formStyle =
{
    paddingTop: '10px'
}
