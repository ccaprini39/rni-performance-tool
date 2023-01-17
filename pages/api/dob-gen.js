// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Cors from 'cors'
import { generateRandomNumber } from './name-number-gen'

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
 * Handles the request and response for the API route that generates a random date of birth
 * @param {object} req the request object
 * @param {object} res the response object
 * @returns a JSON object with the value of the random date of birth
 * @example { dob: "2020-01-01T00:00:00.000Z", dobString: "2020-01-01" }
 * @swagger
 * /api/dob-gen:
 *   get:
 *     description: Returns a random date of birth
 *     responses:
 *       200:
 *         description: returns a random date of birth
 */
export default async function handler(req, res) {
    await cors(req, res)
    res.status(200).json({ dob: getRandomDobDateObject(), dobString: getRandomDobString() })
}

export function getRandomDobDateObject(){
    const year = generateRandomNumber(1900, 2020)
    const month = generateRandomNumber(0, 11)
    const day = generateRandomNumber(1, 31)
    const date = new Date(year, month, day)
    return date
}

export function getRandomDobString(){
    const date = getRandomDobDateObject()
    return date.toISOString().split('T')[0]
}

export function generateArrayOfDobs(number){
    const dobs = []
    for (let i = 0; i < number; i++){
        dobs.push({dob : getRandomDobString()})
    }
    return dobs
}