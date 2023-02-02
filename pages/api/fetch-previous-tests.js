//this file will hold crud operations for previous tests index in the elasticsearch instance
//using async/await syntax
import Cors from 'cors'
import { processHits } from "./create-search-object"
import { getCountOfDocsInIndex } from './multi-search-and-save'


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
* Function that checks if an index exists in the elasticsearch instance
* @param {obj} req the request object
* @param {obj} res the response object
* @returns a JSON object with the value of the previous tests
* @example { previous_tests : [{...}, {...}, {...}] }
* @swagger
* /api/fetch-previous-tests:
*   post:
*     description: Returns an array of previous tests
*     requestBody:
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               adminUrl:
*                 type: string
*                 description: the url of the elasticsearch instance where the admin data is stored
*     responses:
*       200:
*         description: returns an array of previous tests
*/
export default async function handler(req, res) {
    await cors(req, res)
    const { body, method } = req
    if (method === 'POST') {
        const { adminUrl } = body
        if (!adminUrl) {
            res.status(400).json({ error: 'Missing adminUrl' })
            return
        }
        const previousTests = await getPreviousTests(adminUrl, 'all')
        if (previousTests.length === 0) res.status(200).json({ value : 'No previous tests stored at this url' })
        else res.status(200).json({ previous_tests : previousTests })

    } else {
        res.status(200).json({ value: 'Please make POST requst with the admin url (adminUrl) to retrieve previous tests' })
    }
}


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
    try {
        const indexExists = await checkThatIndexExistsLocal(adminUrl, 'previous-tests')
        if(!indexExists) {
            await createIndex(adminUrl, 'previous-tests')
        }
        let results = await getAllDocsFromEsIndex(adminUrl, 'previous-tests')
        //now filter the results by which match the instanceUrl
        if(instanceUrl !== 'all'){
            results = results.filter(doc => doc.url === instanceUrl)
        }
        return results
    } catch (error) {
        
    }
    const indexExists = await checkThatIndexExistsLocal(adminUrl, 'previous-tests')
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
    try {
        const indexExists = await checkThatIndexExistsLocal(adminUrl, 'previous-tests')
        if(!indexExists) return []
        const res = await fetch(`${url}/${index}/_search?format=json`, {
            method: 'GET',
        })
        let data = await res.json()
        data = data.hits.hits
        data = await processHits(data)
        return data
    } catch (error) {
        return []
    }
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
        let copyWithCount = []
        for await (const index of data) {
            if(index.index.startsWith('.')) {
                copyWithCount.push({ ...index, count: 0 })
            } else {
                const count = await getCountOfDocsInIndex(url, index.index)
                copyWithCount.push({ ...index, count })
            }
        }
        return copyWithCount
    } catch (error) {
        return false
    }
}

export function filterHiddenIndices(arrayOfIndices){
    let copy = [...arrayOfIndices]
    copy = copy.filter(index => !index.index.startsWith('.'))
    return copy
}

async function checkThatIndexExistsLocal(url, index){
    const res = await fetch(`${url}/_cat/indices/${index}?format=json`, {
        method: 'GET'
    })
    const data = await res.json()
    if(data.length === 0){
        return false
    }
    return true
}


