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
    "James", "John", "Robert", "Michael", "William", "David", "Richard", "Charles", "Joseph", "Thomas", "Christopher",
    "Daniel", "Matthew", "George", "Donald", "Anthony", "Paul", "Mark", "Edward", "Steven", "Kenneth", "Andrew",
    "Brian", "Joshua", "Kevin", "Ronald", "Timothy", "Jason", "Jeffrey", "Frank", "Gary", "Ryan", "Nicholas",
    "Eric", "Jacob", "Jonathan", "Scott", "Justin", "Brandon", "Raymond", "Gregory", "Samuel", "Benjamin", "Patrick",
    "Jack", "Alexander", "Dennis", "Jerry", "Tyler", "Aaron", "Henry", "Douglas", "Peter", "Jose", "Adam",
    "Nathan", "Zachary", "Walter", "Harold", "Kyle", "Carl", "Arthur", "Gerald", "Roger", "Keith", "Jeremy",
    "Terry", "Lawrence", "Sean", "Christian", "Albert", "Joe", "Ethan", "Isaac", "Dylan", "Wesley",
    "Brandon", "Juan", "Noah", "Ralph", "Larry", "Harry", "Roy", "Brendan", "Owen", "Jonathan",
    "Caleb", "Logan", "Randy", "Malcolm", "Philip", "Craig", "Todd", "Corey", "Garry",
    "Leonardo", "Lennard", "Lenny", "Leon", "Lennon", "Leonidas", "Lionel", "Lennox", "Leland",
    "Joey", "Eddie", "Jordan", "Dustin", "Corey", "Herman", "Maurice", "Vernon", "Roberto", "Clyde",
    "Glenn", "Darrell", "Jerome", "Floyd", "Leo", "Alvin", "Tim", "Wesley", "Gordon", "Dean", "Greg",
    "Jorge", "Dusty", "Pedro", "Derrick", "Dan", "Lewis", "Zachary", "Wilbur", "Everett", "Jared", "Brent", "Ramon",
    "Charlie", "Tyler", "Gilbert", "Gene", "Marc", "Reginald", "Ruben", "Brett", "Angel", "Nathan", "Milton",
    "Joel", "Dylan", "Javier", "Erick", "Stewart", "Doyle", "Darren", "Tyson", "Eli", "Damon", "Moses",
    "Donnie", "Tracy", "Trent", "Rudy", "Wade", "Stuart", "Harry", "Lane", "Jeffery", "Felix", "Branden",
    "Ely", "Kent", "Darian", "Owen", "Jimmie", "Malcolm", "Elijah", "Marcus", "Rene", "Bradford",
    "Jamaal", "Trevor", "Oliver", "Saul", "Benny", "Julian", "Winston", "Ernie", "Curt", "Quentin", "Ty"
]
  
const lengthOfCommonMaleNames = arrayOfCommonMaleNames.length

const arrayOfCommonFemaleNames = [
    "Emily", "Emma", "Madison", "Olivia", "Abigail", "Isabella", "Ava", "Sophia", "Charlotte", "Mia", "Amelia",
    "Harper", "Evelyn", "Elizabeth", "Avery", "Ella", "Chloe", "Victoria", "Aubrey", "Scarlett", "Grace", "Zoey",
    "Natalie", "Hazel", "Aaliyah", "Addison", "Brooklyn", "Lillian", "Lucy", "Audrey", "Layla", "Nora", "Savannah",
    "Eleanor", "Aurora", "Riley", "Arianna", "Camila", "Genesis", "Aria", "Penelope", "Hannah", "Ellie", "Annabelle",
    "Mila", "Claire", "Aurora", "Aurora", "Violet", "Stella", "Bella", "Elliana", "Kaylee", "Avery", "Natalie",
    "Brooklynn", "Adalynn", "Aubree", "Rylee", "Everly", "Cadence", "Kinsley", "Allie", "Nevaeh", "Paisley", "Gianna",
    "Ariana", "Aubree", "Aaliyah", "Raelynn", "Liliana", "Brielle", "Ivy", "Sadie", "Peyton", "Mackenzie", "Arielle",
    "Jocelyn", "Aurora", "London", "Brynn", "Khloee", "Harley", "Eden", "Willow", "Everleigh", "Caroline", "Natalie",
    "Leonora", "Leona", "Leandra", "Leandra", "Leann", "Leanna", "Leeann", "Leandra", "Leah", "Leila"
]
  
const lengthOfCommonFemaleNames = arrayOfCommonFemaleNames.length

const arrayOfCommonLastNames = [
    "Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris",
    "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee", "Walker", "Hall",
    "Allen","King","Wright","Scott","Green","Baker","Adams","Nelson","Carter","Mitchell","Perez",
    "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans", "Edwards", "Collins", "Stewart", "Sanchez", "Morris",
    "Rogers", "Reed", "Cook", "Bailey", "Bell", "Cooper", "Richardson", "Cox", "Howard", "Ward", "Torres",
    "Peterson", "Gray", "Ramirez", "James", "Watson", "Brooks", "Kelly", "Sanders", "Price", "Bennett", "Wood",
    "Barnes", "Ross", "Henderson", "Coleman", "Jenkins", "Perry", "Powell", "Long", "Patterson", "Hughes", "Flores",
    "Washington", "Butler", "Simmons", "Foster", "Gonzales", "Bryant", "Alexander", "Russell", "Griffin", "Diaz", "Hayes",
    "Cahoon", "Cohane", "Cohran", "Cohanoff", "Cohonoff", "Kaufman", "Kohan", "Coon",
    "Myers", "Ford", "Hamilton", "Graham", "Sullivan", "Wallace", "Woods", "Cole", "West",
    "Jordan", "Owens", "Reynolds", "Fisher", "Ellis", "Harrison", "Gibson", "Mcdonald", "Cruz", "Marshall", "Ortiz",
    "Gomez", "Murray", "Freeman", "Wells", "Webb", "Simpson", "Stevens", "Tucker", "Porter", "Hunter", "Hicks", "Crawford",
    "Henry", "Boyd", "Mason", "Morales", "Kennedy", "Warren", "Dixon", "Ramos", "Reyes", "Burns", "Gordon",
    "Shaw", "Holmes", "Rice", "Robertson", "Hunt", "Black", "Daniels", "Palmer", "Mills", "Nichols", "Grant", "Knight",
    "Ferguson", "Rose", "Stone", "Hawkins", "Dunn", "Perkins", "Hudson", "Spencer", "Gardner", "Stephens", "Payne", "Pierce", "Berry",
    "Matthews", "Arnold", "Wagner", "Willis", "Ray", "Watkins", "Olson", "Carroll", "Duncan", "Snyder", "Hart", "Cunningham", "Bradley",
    "Lane", "Andrews", "Ruiz", "Harper", "Fox", "Riley", "Armstrong", "Carpenter", "Weaver", "Greene", "Lawrence", "Elliott"
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
        result.push({primary_name : 
            {
                "data" : name,
                "entityType" : "PERSON"
            }
        })
    }
    return result
}

export function generateArrayOfNamesWithoutEntityType(num, gender){
    let result = []
    for (let i = 0; i < num; i++){
        const name = generateRandomNameGendered(gender)
        result.push({primary_name : name})
    }
    return result
}