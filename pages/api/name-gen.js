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
 * Creates a random name in the format of "First Middle Last"
 * @param {object} req the request object
 * @param {object} res the response object
 * @returns a JSON object with the value of the random name
 * @example { value: "John Michael Smith" }
 * @swagger
 * /api/name-gen:
 *   get:
 *     description: Returns a random name in the format of "First Middle Last"
 *     responses:
 *       200:
 *          description: returns a random name in the format of "First Middle Last"
 */
export default async function handler(req, res) {
    await cors(req, res)
    res.status(200).json({ value: getRandomName() })
}

const arrayOfCommonMaleNames = [
    'James', 'John', 'Robert', 'Michael', 'William',
    'David', 'Richard', 'Charles', 'Joseph', 'Thomas',
    'Christopher', 'Daniel', 'Paul', 'Mark', 'Donald',
    'George', 'Kenneth', 'Steven', 'Edward', 'Brian',
    'Ronald', 'Anthony', 'Kevin', 'Jason', 'Matthew',
    'Gary', 'Timothy', 'Jose', 'Larry', 'Jeffrey', 'Frank',
    'Scott', 'Eric', 'Stephen', 'Andrew', 'Raymond', 'Gregory',
    'Joshua', 'Jerry', 'Dennis', 'Walter', 'Patrick', 'Peter',
    'Harold', 'Douglas', 'Henry', 'Carl', 'Arthur', 'Ryan'
]
const lengthOfCommonMaleNames = arrayOfCommonMaleNames.length

const arrayOfCommonFemaleNames = [
    'Mary', 'Patricia', 'Linda', 'Barbara', 'Elizabeth',
    'Jennifer', 'Maria', 'Susan', 'Margaret', 'Dorothy',
    'Lisa', 'Nancy', 'Karen', 'Betty', 'Helen',
    'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon',
    'Michelle', 'Laura', 'Sarah', 'Kimberly', 'Deborah',
    'Jessica', 'Shirley', 'Cynthia', 'Angela', 'Melissa', 'Brenda',
    'Amy', 'Anna', 'Rebecca', 'Virginia', 'Kathleen', 'Pamela',
    'Martha', 'Debra', 'Amanda', 'Stephanie', 'Carolyn', 'Christine',
    'Marie', 'Janet', 'Catherine', 'Frances', 'Ann', 'Joyce',
    'Diane', 'Alice', 'Julie', 'Heather', 'Teresa', 'Doris'
]
const lengthOfCommonFemaleNames = arrayOfCommonFemaleNames.length

const arrayOfCommonLastNames = [
    'Smith', 'Johnson', 'Williams', 'Jones', 'Brown',
    'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
    'Anderson', 'Thomas', 'Jackson', 'White', 'Harris',
    'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson',
    'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker',
    'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright',
    'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker',
    'Gonzalez', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts',
    'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards',
    'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed'
]
const lengthOfCommonLastNames = arrayOfCommonLastNames.length

const arrayOfGenders = [
    'male', 'female'
]

export function getRandomGender(){
    return arrayOfGenders[Math.floor(Math.random() * arrayOfGenders.length)]
}

function getRandomGivenName(gender){
    if(gender === 'male') return getRandomMaleName()
    else return getRandomFemaleName()
}

export function getRandomMaleName(){
    return arrayOfCommonMaleNames[Math.floor(Math.random() * lengthOfCommonMaleNames)]
}

export function getRandomFemaleName(){
    return arrayOfCommonFemaleNames[Math.floor(Math.random() * lengthOfCommonFemaleNames)]
}

export function getRandomLastName(){
    return arrayOfCommonLastNames[Math.floor(Math.random() * lengthOfCommonLastNames)]
}

export function getRandomName(){
    const gender = getRandomGender()
    const numOfNames = generateRandomNumber(1, 3)
    let name = ''
    for(let i = 0; i < numOfNames; i++){
        name += getRandomGivenName(gender) + ' '
    }
    name += getRandomLastName()
    return name
}

export function generateRandomNameGendered(gender){
    const numOfNames = generateRandomNumber(1, 3)
    let name = ''
    for(let i = 0; i < numOfNames; i++){
        name += getRandomGivenName(gender) + ' '
    }
    name += getRandomLastName()
    return name
}

export function generateArrayOfNames(num, gender){
    let result = []
    for (let i = 0; i < num; i++){
        const name = generateRandomNameGendered(gender)
        result.push(name)
    }
    return result
}