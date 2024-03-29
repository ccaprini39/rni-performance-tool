import Cors from 'cors'
import { getNestedIdentity } from './nested-identity-gen'

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
 * For flattening nested identities
 * @param {object} req the request object
 * @param {object} res the response object
 * @returns a JSON object with the value of the nested identity and the flattened identities
 * @example { ucn: "uuid", aliases: ["name1", "name2", "name3"], birth_dates: ["dob1", "dob2", "dob3"] }
 * @swagger
 * /api/flatten-nested-identity:
 *   get:
 *     description: Returns a nested identity and the flattened identities
 *     responses:
 *       200:
 *         description: returns a nested identity and the flattened identities
 */
export default async function handler(req, res) {
    await cors(req, res)
    res.status(200).json(await generateObjectWithAll())
}

export async function generateObjectWithAll(){
    const nestedIdentity = await getNestedIdentity()
    const flattenedNames = flattenNames(nestedIdentity)
    const flattenedEverything = flattenEverything(nestedIdentity)
    return { nestedIdentity: nestedIdentity, flattenedNames: flattenedNames, flattenedEverything: flattenedEverything }
}

/**
 * Takes a nested identity and flattens the names, but leaves the dob nested
 * @param {identity} nestedIdentity the identity to flatten
 * @returns the identity with the names flattened
 */
export function flattenNames(nestedIdentity){
    let copy = []
    nestedIdentity.aliases.forEach(name => {
        copy.push(
            {
                ucn: nestedIdentity.ucn,
                ...name,
                birth_dates: nestedIdentity.birth_dates
            }
        )
    })
    return copy
}

/**
 * Takes a nested identity and flattens everything
 * @param {identity} nestedIdentity the identity to flatten
 * @returns the flattened identity
 */
export function flattenEverything(nestedIdentity){
    let copy = []
    nestedIdentity.aliases.forEach(name => {
        nestedIdentity.birth_dates.forEach(dob => {
            copy.push(
                {
                    ucn: nestedIdentity.ucn,
                    ...name,
                    ...dob
                }
            )
        })
    })
    return copy
}

/**
 * Generates a bulk string for ElasticSearch.
 * @returns a bulk string for ElasticSearch
 * @example { "index" : {"_index" : "rni-nested"}} + '\n' + JSON.stringify(initialObject) + '\n'
 */
export async function generateBulkObject(){
    let string = ''
    const initialObject = await getNestedIdentity()
    
    string = string + JSON.stringify({ "index" : {"_index" : "rni-nested"}}) + '\n' +
        JSON.stringify(initialObject) + '\n'

    let nestedDobArray = await flattenNames(initialObject)
    nestedDobArray.forEach(element => {
        string = string + JSON.stringify({ "index" : {"_index" : "rni-nested-dobs"}}) + '\n' + 
            JSON.stringify(element) + '\n'
    })

    let flatArray = await flattenEverything(initialObject)
    flatArray.forEach(element => {
        string = string + JSON.stringify({ "index" : {"_index" : "rni-flat"}}) + '\n' + 
            JSON.stringify(element) + '\n'
    })
    return string
}

export async function generateBulkNestedOnly(){
    let string = ''
    const initialObject = await getNestedIdentity()
    
    string = string + JSON.stringify({ "index" : {"_index" : "rni-nested"}}) + '\n' +
        JSON.stringify(initialObject) + '\n'

    return string
}

/**
 * Generates a bulk string for ElasticSearch.  Same as above, but takes a nested identity as a parameter.
 * @param {identity} nestedIdentity the identity to flatten
 * @returns a bulk string for ElasticSearch
 */
export async function generateBulkObjectGivenNested(nestedIdentity){
    let string = ''
    
    string = string + JSON.stringify({ "index" : {"_index" : "rni-nested"}}) + '\n' +
        JSON.stringify(nestedIdentity) + '\n'

    let nestedDobArray = await flattenNames(nestedIdentity)
    nestedDobArray.forEach(element => {
        string = string + JSON.stringify({ "index" : {"_index" : "rni-nested-dobs"}}) + '\n' + 
            JSON.stringify(element) + '\n'
    })

    let flatArray = await flattenEverything(nestedIdentity)
    flatArray.forEach(element => {
        string = string + JSON.stringify({ "index" : {"_index" : "rni-flat"}}) + '\n' + 
            JSON.stringify(element) + '\n'
    })
    return string
}

/**
 * Generates a bulk string for Elasticsearch with 100 nested identities and their flattened versions.
 * @returns a bulk string for ElasticSearch
 * @example { "index" : {"_index" : "rni-nested"}} + '\n' + JSON.stringify(initialObject) + '\n'
//  * swagger may use this in the future
//  * /api/flatten-nested-identity:
//  *   get:
//  *     description: Returns a bulk string for ElasticSearch with 100 nested identities and their flattened versions.
//  *     responses:
//  *       200:
//  *         description: returns a bulk string for ElasticSearch with 100 nested identities and their flattened versions.
 */
export async function generateOneHundredBulkObjects(){
    let string = ''
    for await (const _ of Array(100).keys()) {
        string = string + await generateBulkObject()
    }
    return string 
}