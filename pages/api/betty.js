// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Cors from 'cors'
import { getMappingForTestIndex, rniFlatMapping, rniNestedDobMapping, rniNestedMapping } from '../../app/elastic-instances/[id]/components'
import { createBulkDocsInIndex, deleteIndex } from '../../app/elastic-instances/[id]/utils'
import { createIndex, sleep } from './create-search-object'
import { flattenEverything, flattenNames } from './flatten-nested-identity'

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


export default async function handler(req, res) {
    await cors(req, res)
    res.status(200).json({ value: 10 })
}

const betty = 
{
    "ucn": "333D",
    "aliases": [
        {
            "primary_name": "Betty Smith",
            "entity_type": "Person",
        },
        {
            "primary_name": "B Smith",
            "entity_type": "Person",
        },
        {
            "primary_name": "Betty James Smith",
            "entity_type": "Person",
        }
    ],
    "birth_dates": [
        {
            "birth_date": "1978-01-01",
        },
        {
            "birth_date": "1979-06-06",
        },
        {
            "birth_date": "1980-12-12",
        }
    ]
}

const nestedDobBetty = flattenNames(betty)
const flatBetty = flattenEverything(betty)

export function getAllOfBetty(){
    return { betty: betty, nestedDobBetty: nestedDobBetty, flatBetty: flatBetty }
}

export async function indexBetty(){
    const string = await generateBulkBetty(betty)
    const url = 'http://ec2-18-216-150-137.us-east-2.compute.amazonaws.com:9200'
    //first delete any old betty
    await deleteIndex(url, 'betty-nested')
    await sleep(10)
    await deleteIndex(url, 'betty-nested-dobs')
    await sleep(10)
    await deleteIndex(url, 'betty-flat')
    await sleep(10)
    await createIndex(url, 'betty-nested', nestedBettyMapping)
    await sleep(10)
    await createIndex(url, 'betty-nested-dobs', nestedDobBettyMapping)
    await sleep(10)
    await createIndex(url, 'betty-flat', rniFlatMapping)
    await sleep(10)
    let response = await createBulkDocsInIndex(url, string)
    return response
}

const nestedBettyMapping =
{
    "mappings" : {
        "properties" : {
            "uuid" : {
                "type" : "keyword"
            },
            "aliases" : {
                "type" : "nested",
                "properties" : {
                    "primary_name" : {
                        "type" : "rni_name"
                    }
                }
            },
            "birth_dates" : {
                "type" : "nested",
                "properties" : {
                    "birth_date" : {
                        "type" : "rni_date"
                    }
                }
            }
        }
    }
}

const nestedDobBettyMapping =
{
    "mappings" : {
        "properties" : {
            "ucn" : {
                "type" : "keyword"
            },
            "primary_name" : {
                "type" : "rni_name"
            },
            "birth_dates" : {
                "type" : "nested",
                "properties" : {
                    "birth_date" : {
                        "type" : "rni_date"
                    }
                }
            }
        }
    }
}

const flatBettyMapping =
{
    "mappings": {
      "properties": {
        "birth_date": {
          "type": "rni_date"
        },
        "primary_name": {
          "type": "rni_name"
        },
        "ucn": {
          "type": "keyword"
        }
      }
    }
}

export async function generateBulkBetty(){
    let string = ''
    
    string = string + JSON.stringify({ "index" : {"_index" : "betty-nested"}}) + '\n' +
        JSON.stringify(betty) + '\n'

    nestedDobBetty.forEach(element => {
        string = string + JSON.stringify({ "index" : {"_index" : "betty-nested-dobs"}}) + '\n' + 
            JSON.stringify(element) + '\n'
    })

    flatBetty.forEach(element => {
        string = string + JSON.stringify({ "index" : {"_index" : "betty-flat"}}) + '\n' + 
            JSON.stringify(element) + '\n'
    })
    return string
}
