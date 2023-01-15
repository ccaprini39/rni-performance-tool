import Cors from 'cors'
import { generateRandomNumber } from './name-number-gen'
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
 * @example { ucn: "uuid", names: ["name1", "name2", "name3"], dobs: ["dob1", "dob2", "dob3"] }
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
    const nestedIdentity = await getNestedIdentity()
    const flattenedNames = flattenNames(nestedIdentity)
    const flattenedEverything = flattenEverything(nestedIdentity)
    res.status(200).json({ nestedIdentity: nestedIdentity, flattenedNames: flattenedNames, flattenedEverything: flattenedEverything })
}

/**
 * Takes a nested identity and flattens the names, but leaves the dob nested
 * @param {identity} nestedIdentity the identity to flatten
 * @returns the identity with the names flattened
 */
export function flattenNames(nestedIdentity){
    let copy = []
    nestedIdentity.names.forEach(name => {
        copy.push(
            {
                ucn: nestedIdentity.ucn,
                name: name,
                dobs: nestedIdentity.dobs
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
    nestedIdentity.names.forEach(name => {
        nestedIdentity.dobs.forEach(dob => {
            copy.push(
                {
                    ucn: nestedIdentity.ucn,
                    name: name,
                    dob: dob
                }
            )
        })
    })
    return copy
}