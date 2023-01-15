// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Cors from 'cors'

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
 * /api/name-number-gen:
 *   get:
 *     description: Returns a random number of names for an identity
 *     responses:
 *       200:
 *         description: returns a random number of names for an identity
 */
export default async function handler(req, res) {
    await cors(req, res)
    res.status(200).json({ value: generateNumberOfNames() })
}

/**
 * Generates a random number between a given min and max
 * @param {int} min given min
 * @param {int} max given max
 * @returns a random number between min and max
 * @example generateRandomNumber(1, 10) // returns a random number between 1 and 10
 */
export function generateRandomNumber(min, max){
    const num = Math.floor(Math.random() * (max - min + 1)) + min
    return num
}

/**
 * Generates a random number that represents the number of names to generate for an identity
 * @returns a random number between 1 and 1380, following the distribution given
 * 
 * @example generateNumberOfNames() // returns a random number between 1 and 1380
 */
export function generateNumberOfNames(){
    const seed = Math.random()
    if (seed <= 0.4845875093) return 1
    else if (seed <= 0.8580000473) return generateRandomNumber(2, 5)
    else if (seed <= 0.9650097008) return generateRandomNumber(6, 10)
    else if (seed <= 0.9828719312) return generateRandomNumber(11, 15)
    else if (seed <= 0.9929197931) return generateRandomNumber(16, 20)
    else if (seed <= 0.9985) return generateRandomNumber(20, 100)
    else return generateRandomNumber(51, 1380)
}