// import { withSwagger } from "next-swagger-doc"
import swagger from '../../public/swagger.json'


// const swaggerHandler = withSwagger({
//     definition: {
//         openapi: "3.0.0",
//         info: {
//             title: "Name Generator API",
//             version: "1.0.0",
//             description: "A simple API to generate random names",
//         },
//     },
//     apiFolder: "pages/api",
// })

// export default swaggerHandler()

/**
 * Handles the request and response for the API route that returns the swagger.json file
 * @param {object} req the request object
 * @param {object} res the response object
 * @returns a JSON object with the swagger.json file
 * @example { spec: { openapi: "3.0.0", info: { title: "Name Generator API", version: "1.0.0", description: "A simple API to generate random names", }, } }
 * @swagger
 * /api/doc:
 *   get:
 *     description: Returns the swagger.json file
 *     responses:
 *       200:
 *         description: returns the swagger.json file
 */
export default function handler(req, res) {
    res.status(200).json({ spec: swagger })
}