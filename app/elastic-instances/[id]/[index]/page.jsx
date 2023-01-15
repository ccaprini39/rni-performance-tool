'use client'

import { useEffect, useState } from "react"
import LoadingComponent from "../../../components/LoadingComponent"
import { getAvailableUrlById } from "../../../database/availableElasticUrlsCrud"
import { sleep } from "../page"
import IndexTable, { OverAllGrid } from "./components"

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

    useEffect(() => {
        async function loadInstance(){
            setLoading(true)
            const {url, name} = await getAvailableUrlById(params.id)
            setHealth(await getElasticInstanceHealth(url))
            setPlugins(await getElasticPlugins(url))
            setIndices(await getNonHiddenIndices(url))
            setNodeStats(await getElasticNodesStats(url))
            setClusterStats(await getElasticClusterStats(url))
            setUrl(url)
            setName(name)
            await sleep(500)
            setLoading(false)
        }
        loadInstance()
    },[])

    if(loading) return <LoadingComponent />
    return (
        <div>
            <h1>{name}</h1>
            <h3>Instance Url: {url}</h3>
            <OverAllGrid health={health[0]} 
                plugins={plugins} 
                indices={indices} 
                nodesStats={nodeStats} 
                clusterStats={clusterStats} 
            />
            <IndexTable indices={indices} />
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
        const nonHiddenIndices = data.filter(index => index.index[0] !== '.')
        return nonHiddenIndices
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
        const valid = await verifyElastic(cookie)
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