import Cors from 'cors'
import Cookies from 'js-cookie'
import { getRandomDobString } from './dob-gen'
import { getRandomName } from './name-gen'

function initMiddleware(middleware) {
    return (req, res) =>
        new Promise((resolve, reject) => {
        middleware(req, res, (result) => {
            if (result instanceof Error) {
            return reject(result)
            }
            return resolve(result)
        })
    })
}

// Initialize the cors middleware
const cors = initMiddleware(
    // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
    Cors({
        // Only allow requests with GET, POST and OPTIONS
        methods: ['GET', 'POST', 'OPTIONS'],
    })
)

/**
 * Creates a search object with a random name, dob, and number of names
 * @returns a search object with a random name, dob, and number of names
 * @example { name: 'John Smith', dob: '01/01/2000' }
 * @swagger
 * /api/create-search-object:
 *   get:
 *     description: Returns a search object with a random name, dob, and number of names
 *     responses:
 *       200:
 *         description: returns a search object with a random name, dob, and number of names
 */
export default async function handler(req, res) {
    await cors(req, res)
    res.status(200).json({ value: createSearchObject() })
}

//takes in a url and optional search object and returns a promise
//creates a search object based on the options
export async function autoSearch(url, options){
    const search = createSearchObject(options)
    const results = await searchForDocs(url, search)
    console.log(results)
}

//creates a search object based on the options
export async function createSearchObject(options = defaultOptions){
    const search = {}
    search.primary_name = getRandomName()
    search.birth_date = getRandomDobString()
    if (options.window_size) {
        search.window_size = options.window_size
    } else {search.window_size = defaultOptions.window_size}
    return search
}

//default options for the autosearch to use
export const defaultOptions = 
{
    primary_name : true,
    birth_date : true,
    window_size : 100,
}

export async function esAutoSearch(url, options){
    const search = createSearchObject(options)
    const results = await esSearch(url, search)
    return results
}

export async function flatQuery(url, object){
    const {primary_name, birth_date, window_size}  = object
    let rniQuery = 
    {
        "query" : {
            "bool" : {
                "should" : [
                    {
                        "match" : {primary_name : primary_name}
                    },
                    {
                        "match" : {birth_date : birth_date}
                    }
                ]
            }
        }
    }
    let rescorer =  
    {
        "rescore" : {
            "window_size" : window_size,
            "query" : {
                "rescore_query" : {
                    "function_score" : {
                        "doc_score" : {
                            "fields" : {
                                "name" : {"query_value" : primary_name},
                                "dob" : {"query_value" : birth_date}
                            }
                        }
                    }
                },
                "query_weight" : 0.0,
                "rescore_query_weight" : 1.0
            }
        }
    }
    const query = {...rniQuery, ...rescorer}
    let response = await executeQuery(url, 'rni-flat', query)
    return response
}

export async function nestedDobQuery(url, object){
    const {primary_name, birth_date, window_size}  = object
    let rniQuery = 
    {
        "query" : {
            "bool" : {
                "should" : [
                    {
                        "nested" : {
                            "path" : "birth_dates",
                            "query" : {
                                "bool" : {
                                    "should" : {
                                        "match" : {birth_date : birth_date}
                                    }
                                }
                            }
                        }
                    },
                    {
                        "match" : {primary_name : primary_name}
                    }
                ]
            }
        }
    }
    let rescorer = 
    {
        "rescore" : [
            {
                "window_size" : window_size,
                "rni_query" : {
                    "rescore_query" : {
                        "nested" : {
                            "score_mode" : "max",
                            "path" : "birth_dates",
                            "query" : {
                                "function_score" : {
                                    "date_score" : {
                                        "field" : "birth_dates.birth_date",
                                        "query_date" : birth_date,
                                    }
                                }
                            }
                        }
                    },
                    "score_mode" : "total",
                    "query_weight" : 0.0,
                    "rescore_query_weight" : 1.0
                }
            },
            {
                "window_size" : 10,
                "rni_query" : {
                    "rescore_query" : {
                        "function_score" : {
                            "name_score" : {
                                "field" : "primary_name",
                                "query_name" : primary_name,
                            }
                        }
                    },
                    "score_mode" : "total",
                    "query_weight" : 0.,
                    "rescore_query_weight" :  1.0
                }
            }
        ]
    }
    const query = {...rniQuery, ...rescorer}
    let response = await executeQuery(url, 'rni-nested-dobs', query)
    return response
}

export async function nestedQuery(url, object){
    const {primary_name, birth_date, window_size}  = object

    let rniQuery = 
    {
        "query" : {
            "bool" : {
                "should" : [
                    {
                        "nested" : {
                            "path" : "aliases",
                            "query" : {
                                "bool" : {
                                    "should" : {
                                        "match" : {"aliases.primary_name" : primary_name}
                                    }
                                }
                            }
                        }
                    },
                    {
                        "nested" : {
                            "path" : "birth_dates",
                            "query" : {
                                "bool" : {
                                    "should" : {
                                        "match" : {"birth_dates.birth_date" : birth_date}
                                    }
                                }
                            }
                        }
                    }
                ]
            }
        }
    }
    let rescorer = 
    {
        "rescore" : [
            {
                "window_size" : window_size,
                "rni_query" : {
                    "rescore_query" : {
                        "nested" : {
                            "score_mode" : "max",
                            "path" : "aliases",
                            "query" : {
                                "function_score" : {
                                    "name_score" : {
                                        "field" : "aliases.primary_name",
                                        "query_name" : primary_name
                                    }
                                }
                            }
                        }
                    },
                    "score_mode" : "total",
                    "query_weight" : 0.0,
                    "rescore_query_weight" : 1.0
                }
            },
            {
                "window_size" : window_size,
                "rni_query" : {
                    "rescore_query" : {
                        "nested" : {
                            "score_mode" : "max",
                            "path" : "birth_dates",
                            "query" : {
                                "function_score" : {
                                    "date_score" : {
                                        "field" : "birth_dates.birth_date",
                                        "query_date" : birth_date
                                    }
                                }
                            }
                        }
                    },
                    "score_mode" : "total",
                    "query_weight" : 0.0,
                    "rescore_query_weight" :  1.0
                }
            }
        ]
    }
    const query = {...rniQuery, ...rescorer}
    let response = await executeQuery(url, 'rni-nested', query)
    return response
}

export async function executeQuery(url, index, query){
    let requestOptions = getPostRequestOptions(query)
    let response = await fetch(`${url}/${index}/_search?format=json`, requestOptions)
    response = await response.json()
    return response
}

export async function multiQuery(url, query){
    let nestedResult, nestedDobResult, flatResult
    nestedResult = await nestedQuery(url, query)
    nestedDobResult = await nestedDobQuery(url, query)
    flatResult = await flatQuery(url, query)
    return {nestedResult, nestedDobResult, flatResult}
}

/**
 * This function will take the hits from the elastic search response and return a random url
 */
export async function getRandomElasticUrl(){
    const urls = await getAvailableElasticUrls('http://ec2-18-219-118-71.us-east-2.compute.amazonaws.com:9200')
    if(!urls) return false
    const randomIndex = Math.floor(Math.random() * urls.length)
    return urls[randomIndex].url
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
export async function getAvailableElasticUrls(url = false){
    //get the cookie for the admin elastic instance
    let cookie

    if(url) { 
        cookie = url 
    } else cookie = Cookies.get('adminElasticUrl')

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
export async function createIndex(url, index, mappings = null){
    let requestOptions = getPutRequestOptions(mappings)
    let response 
    try {
        response = await fetch(`${url}/${index}?format=json`, requestOptions)
        if (response.ok){
            response = await response.json()
            return response
        } else {
            response = await response.json()
            throw new Error(response.error.type)
        }      
    } catch (error) {
        response = {error : error.message}
        return response
    }
}

/**
 * helper function to get the options for a PUT request
 * @param {object} bodyJson
 * @returns the options for a PUT request
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 */
export function getPutRequestOptions(bodyJson = null){
    if (bodyJson === null) {
        return {
            method: 'PUT',
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }
    } else return {
        method: 'PUT',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body : JSON.stringify(bodyJson)
    }
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

export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

/**
 * helper function to get the options for a post request. Same as getPostRequestOptions but with a string body
 * @param {string} bodyString body of the request
 */
export function getPostRequestOptionsStringBody(bodyString){
    return {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body : bodyString
    }
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