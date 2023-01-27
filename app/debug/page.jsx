import { createSearchObject, getAvailableElasticUrls, getRandomElasticUrl, multiQuery } from "../../pages/api/create-search-object"
import { getRandomDobString } from "../../pages/api/dob-gen"
import { generateNumberOfDobs } from "../../pages/api/dob-number-gen"
import { generateBulkObjectGivenNested, generateObjectWithAll, generateOneHundredBulkObjects } from "../../pages/api/flatten-nested-identity"
import { getRandomName } from "../../pages/api/name-gen"
import { generateNumberOfNames } from "../../pages/api/name-number-gen"

'no cache'

async function loadData(){
    const urls = await await getAvailableElasticUrls('http://ec2-18-219-118-71.us-east-2.compute.amazonaws.com:9200')
    const nameSizes = await getArrayOfNumberOfNameLengths(1000)
    const name = await getRandomName()
    const dobSizes = await getArrayOfNubmerOfDobLengths(1000)
    const dob = await getRandomDobString()
    const all = await generateObjectWithAll()
    const bulkString = await generateBulkObjectGivenNested(all.nestedIdentity)
    const bigBulkString = await generateOneHundredBulkObjects()
    const randomSearch = await createSearchObject()
    const randomSearchWithWindow = await createSearchObject({window_size: 1000})
    const randomSearchNameOnly = await createSearchObject({primary_name: true})
    const randomSearchDobOnly = await createSearchObject({birth_date: true})
    const randomSearchNameAndDob = await createSearchObject({primary_name: true, birth_date: true})
    const randomSearchNameAndDobWithWindow = await createSearchObject({primary_name: true, birth_date: true, window_size: 1000})
    const randomSearchDobWithWindow = await createSearchObject({birth_date: true, window_size: 1000})
    const randomSearchNameWithWindow = await createSearchObject({primary_name: true, window_size: 1000})
    const randomUrl = await getRandomElasticUrl()
    const searchResult = await multiQuery(randomUrl, randomSearch)
    return { nameSizes, name, dobSizes, dob, all, bulkString, bigBulkString, 
        randomSearch, randomSearchWithWindow, randomSearchNameOnly, randomSearchDobOnly, 
        randomSearchNameAndDob, randomSearchNameAndDobWithWindow, randomSearchDobWithWindow, randomSearchNameWithWindow,
        randomUrl, searchResult, urls
    }
}


export default async function DebugPage() {
    const { nameSizes, name, dobSizes, dob, all, bulkString, bigBulkString,
        randomSearch, randomSearchWithWindow, randomSearchNameOnly, randomSearchDobOnly,
        randomSearchNameAndDob, randomSearchNameAndDobWithWindow, randomSearchDobWithWindow, randomSearchNameWithWindow,
        randomUrl, searchResult, urls
    } = await loadData()
    const { average, min, max } = await getAverageMinMaxFromArrayOfNumbers(nameSizes)
    const { average: dobAverage, min: dobMin, max: dobMax } = await getAverageMinMaxFromArrayOfNumbers(dobSizes)

    return (
        <div>
            <h1>Debug</h1>
        
            <h2>Urls</h2>
            <pre>{JSON.stringify(urls, null, 2)}</pre>

            <h2>Nested and Flattened</h2>
            <pre>{JSON.stringify(all, undefined, 2)}</pre>

            <h2>Bulk String</h2>
            <pre>{bulkString}</pre>

            {/* <h2>Big Bulk String</h2>
            <pre>{bigBulkString}</pre> */}

            <h2>Url</h2>
            <pre>{randomUrl}</pre>

            <h2>Random Search</h2>
            <pre>{JSON.stringify(randomSearch, undefined, 2)}</pre>
            <h6>result: </h6>
            <pre>{JSON.stringify(searchResult, undefined, 2)}</pre>

            <h2>Random Search With Window</h2>
            <pre>{JSON.stringify(randomSearchWithWindow, undefined, 2)}</pre>

            <h2>Random Search Name Only</h2>
            <pre>{JSON.stringify(randomSearchNameOnly, undefined, 2)}</pre>

            <h2>Random Search Dob Only</h2>
            <pre>{JSON.stringify(randomSearchDobOnly, undefined, 2)}</pre>

            <h2>Random Search Name And Dob</h2>
            <pre>{JSON.stringify(randomSearchNameAndDob, undefined, 2)}</pre>

            <h2>Random Search Name And Dob With Window</h2>
            <pre>{JSON.stringify(randomSearchNameAndDobWithWindow, undefined, 2)}</pre>

            <h2>Random Search Dob With Window</h2>
            <pre>{JSON.stringify(randomSearchDobWithWindow, undefined, 2)}</pre>

            <h2>Random Search Name With Window</h2>
            <pre>{JSON.stringify(randomSearchNameWithWindow, undefined, 2)}</pre>

        </div>   
    )
}

/**
 * 
 * @param {int} number of names
 * @returns 
 */
export async function getArrayOfNumberOfNameLengths(number) {
    let namesSizes = []
    for await (const _ of Array(number).keys()) {
        await namesSizes.push(generateNumberOfNames())
    }
    return namesSizes
}

export async function getArrayOfNubmerOfDobLengths(number) {
    let dobSizes = []
    for await (const _ of Array(number).keys()) {
        await dobSizes.push(generateNumberOfDobs())
    }
    return dobSizes
}

/**
 * 
 * @param {[]} array of numbers
 * @returns {average, min, max}
 * @example getAverageMinMaxFromArrayOfNumbers([1,2,3,4,5]) // {average: 3, min: 1, max: 5}
 */
export async function getAverageMinMaxFromArrayOfNumbers(array){
    const min = Math.min(...array)
    const max = Math.max(...array)
    let total = 0
    for await (const number of array) {
        total += number
    }

    const average = total / array.length

    return {average, min, max}
}