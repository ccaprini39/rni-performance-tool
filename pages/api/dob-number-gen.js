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
 * Handles the request and response for the API route that generates a random number of names for an identity
 * @param {object} req the request object
 * @param {object} res the response object
 * @returns a JSON object with the value of the random number of names
 * @example { value: 5 }
 * @swagger
 * /api/dob-number-gen:
 *   get:
 *     description: Returns a random number of dobs for an identity
 *     responses:
 *       200:
 *         description: returns a random number of dobs for an identity
 */
export default async function handler(req, res) {
    await cors(req, res)
    res.status(200).json({ value: generateNumberOfDobs() })
}

/**
 * Generates a random number that represents the number of dobs to generate for an identity
 * @returns a random number between 1 and 242, following the distribution given
 * 
 * @example generateNumberOfNames() // returns a random number between 1 and 242
 */
export function generateNumberOfDobs(){
    const seed = Math.random()
    if (seed <= 0.9147604814) return 1
    else if (seed <= 0.99) return generateRandomNumber(2, 5)
    else return generateRandomNumber(6, 242)
}