// import { withSwagger } from "next-swagger-doc"

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

export default function handler(req, res) {
    res.status(200).json({ spec: swaggerJson })
}

export const swaggerJson =
{
    "openapi": "3.0.0",
    "info": {
      "title": "RNI Testing Tool API",
      "version": "1.0"
    },
    "paths": {
      "/api/name-number-gen": {
        "get": {
          "description": "Returns a random number of names for an identity",
          "responses": {
            "200": {
              "description": "returns a random number of names for an identity"
            }
          }
        }
      }
    },
    "components": {},
    "tags": []
  }