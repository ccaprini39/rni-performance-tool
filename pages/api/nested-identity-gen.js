//this will be a react component that generates a nested identity
//it takes no parameters currently, simply returns a nested identity

import Cors from 'cors'
import crypto from 'crypto'
import { generateArrayOfDobs } from './dob-gen'
import { generateNumberOfDobs } from './dob-number-gen'
import { generateArrayOfNames, getRandomGender } from './name-gen'
import { generateNumberOfNames } from './name-number-gen'

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
 * Creates a nested identity in the format of { ucn: "uuid", aliases: ["name1", "name2", "name3"], birth_dates: ["dob1", "dob2", "dob3"] }
 * @param {object} req the request object
 * @param {object} res the response object
 * @returns a JSON object with the value of the nested identity
 * @example { ucn: "uuid", aliases: ["name1", "name2", "name3"], birth_dates: ["dob1", "dob2", "dob3"] }
 * @swagger
 * /api/nested-identity-gen:
 *   get:
 *     description: Returns a nested identity
 *     responses:
 *       200:
 *         description: returns a nested identity
*/
export default async function handler(req, res) {
    await cors(req, res)
    const nestedIdentity = await getNestedIdentity()
    res.status(200).json(nestedIdentity)
}

export async function getNestedIdentity() {
    const gender = getRandomGender()
    const uuid = generateUuid()
    const numOfNames = generateNumberOfNames()
    const numOfDobs = generateNumberOfDobs()
    const names = generateArrayOfNames(numOfNames, gender)
    const dobs = generateArrayOfDobs(numOfDobs)

    return {
        ucn: uuid,
        aliases: names,
        birth_dates: dobs
    }
}

/**
 * function for generating a uuid
 * @returns a uuid
 */
export function generateUuid() {
    return crypto.randomBytes(16).toString("hex")
}

