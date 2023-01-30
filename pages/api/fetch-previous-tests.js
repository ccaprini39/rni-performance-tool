//this file will hold crud operations for previous tests index in the elasticsearch instance
//using async/await syntax

import { checkThatIndexExists } from "../../app/elastic-instances/[id]/components"
import { processHits } from "./create-search-object"

/**
 * Function that gets all the documents from the previous-tests index
 * @param {string} adminUrl the url of the elasticsearch instance where the admin data is stored
 * @param {string} instanceUrl the url of the instance to get the previous tests for, if 'all' then all previous tests will be returned
 * @returns an array of all the documents in the previous-tests index
 * @example
 * const url = 'http://localhost:9200'
 * const result = await getAllDocsFromEsIndex(url, 'previous-tests')
 * console.log(result)
 * //returns an array of all the documents in the previous-tests index
 */
export async function getPreviousTests(adminUrl, instanceUrl = 'all'){
    const indexExists = await checkThatIndexExists(adminUrl, 'previous-tests')
    if(!indexExists) return []
    let results = await getAllDocsFromEsIndex(adminUrl, 'previous-tests')
    //now filter the results by which match the instanceUrl
    if(instanceUrl !== 'all'){
        results = results.filter(doc => doc.url === instanceUrl)
    }
    return results
}

/**
 * Function that gets all the documents from an index
 * @param {string} url the url of the elasticsearch instance
 * @param {string} index the name of the index to query
 * @returns an array of all the documents in the index
 * @example
 * const url = 'http://localhost:9200'
 * const result = await getAllDocsFromEsIndex(url, 'previous-tests')
 * console.log(result)
 * //returns an array of all the documents in the previous-tests index
 */
export async function getAllDocsFromEsIndex(url, index){
    const res = await fetch(`${url}/${index}/_search?format=json`, {
        method: 'GET',
    })
    let data = await res.json()
    data = data.hits.hits
    data = await processDocsFromHits(data)
    return data
}

export async function processDocsFromHits(arrayOfHits){
    let urlObjects = []
    arrayOfHits.forEach(hit => {
        urlObjects.push({...hit._source, id: hit._id})
    })
    return urlObjects
}

/**
 * Function that saves a test to the previous-tests index
 * @param {string} url the url of the admin elasticsearch instance
 * @param {object} test the test object to save
 * @returns the result of the save operation, true if successful, false if not
 */
export async function savePreviousTest(url, test){
    try {
        const res = await fetch(`${url}/previous-tests/_doc`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(test)
        })
        const data = await res.json()
        if(data.result === 'created'){
            return true
        }
        if(data.result !== 'created'){
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
    return false
}

