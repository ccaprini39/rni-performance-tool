'use client'
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import LoadingComponent from "../../components/LoadingComponent";
import { getPostRequestOptions } from "./components/AddUrl";
import AdminUrl, { verifyElasticWithTimeout } from "./components/AdminUrl";
import UrlList from "./components/UrlList";

//this is a react component that will check to see if the database url is set in the cookies
//if it is, it will display the list of elastic instances from the index 'available-urls'
//if it is not, it will display the AdminUrl component
//the AdminUrl component will allow the user to set the database url in the cookies


export default function ElasticInstances({}) {
    const [cookiesUrl, setCookiesUrl] = useState(false)
    const [instances, setInstances] = useState([])
    const [loading, setLoading] = useState(true)
    const [value, setValue] = useState(0)
    const toggleValue = () => value === 0 ? setValue(1) : setValue(0)

    useEffect(() => {
        async function loadElasticInstances(){
            setLoading(true)
            await sleep(500)
            const cookiesUrl = await Cookies.get('adminElasticUrl')
            if(!cookiesUrl){
                setCookiesUrl(false)
                setInstances([])
                setLoading(false)
                return
            }
            const instances = await getAvailableElasticUrls()
            setCookiesUrl(cookiesUrl)
            setInstances(instances)
            setLoading(false)
        }
        loadElasticInstances()
    },[value])

    if(loading) return <LoadingComponent />
    else return (
        <div>
            <h1>Elastic Instances</h1>
            {cookiesUrl ? 
                <>
                    <h3>Admin Url: {cookiesUrl}</h3>
                    <UrlList urlObjects={instances} toggle={toggleValue}/>
                </>
                : 
                <>
                    <AdminUrl toggle={toggleValue} />
                    <AdminInstructionsNoCookie />
                </>
            }
        </div>
    )

}

export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function AdminInstructionsNoCookie(){
    return (
        <div>
            <h3>Admin Instructions</h3>
            <p>You have not yet configured a url</p>
            <p>This application uses an instance of elasticsearch as a database</p>
            <p>Once a valid url is provided, the indexes it needs will be created in that instance</p>
            <p>Set the admin url in the cookies by entering the url in the input field above.</p>
            <p>Once the admin url is set, you can add and remove elastic instances from the list.</p>
        </div>
    )
}

export const matchAllQuerySearch = {
    "size" : 1000,
    "query": {
        "match_all": {}
    }
}

/**
 * This function will get the cookie for the admin elastic instance, if it exists.  
 * If it does, it will return the list of available elastic urls.  If it does not, it will return false
 * If the cookie is valid but the index 'available-urls' does not exist, it will create the index and call itself again
 * @returns the list of available elastic urls or false
 */
export async function getAvailableElasticUrls(){
    //get the cookie for the admin elastic instance
    let cookie = Cookies.get('adminElasticUrl')
    if(cookie){
        const valid = await verifyElasticWithTimeout(cookie)
        if(!valid){
            console.log('Admin elastic url is not valid')
            return false
        }
        let requestOptions = getPostRequestOptions(matchAllQuerySearch)
        let response = await fetch(`${cookie}/available-urls/_search?format=json`, requestOptions)
        if (!response.ok) {
            response = await response.json()
            if (response.error.type === 'index_not_found_exception') {
                await createIndex(cookie, 'available-urls', availableUrlsMapping)
                //yes this is recursive, but it should only happen once unless elastic isn't running
                response = await getAvailableElasticUrls()
                return response
            }
        }
        response = await response.json()
        response = await processHits(response.hits.hits)
        return response
    }else{
        //if the cookie does not exist, return false
        console.log('No admin elastic url set')
        return false
    }
}

/**
 * This function will take the array of hits from the elastic search response and return an array of objects
 * @param {array} arrayOfHits
 * @returns an array of objects
 */
async function processHits(arrayOfHits){
    let urlObjects = []
    arrayOfHits.forEach(hit => {
        urlObjects.push({...hit._source, id: hit._id})
    })
    return urlObjects
}

/**
 * Create an index
 * @param {string} url
 * @param {string} index
 * @param {object} mapping
 * @returns the response from ElasticSearch
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-create-index.html
 */
export async function createIndex(url, index, mapping = null) {
    let res
    if (mapping === null) {
        res = await fetch(`${url}/${index}?format=json`, {
            method: 'PUT'
        })
    } else {
        res = await fetch(`${url}/${index}?format=json`, {
        method: 'PUT',
        body: JSON.stringify(mapping)
        })
    }
    const data = await res.json()
    return data
}

const availableUrlsMapping = {
    "mappings": {
        "properties": {
            "name": {
                "type": "text",
                "fields": {
                "keyword": {
                    "type": "keyword",
                    "ignore_above": 256
                }
                }
            },
            "url": {
                "type": "text",
                "fields": {
                "keyword": {
                    "type": "keyword",
                    "ignore_above": 256
                }
                }
            }
        }
    }
}