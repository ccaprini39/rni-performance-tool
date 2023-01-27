import { createSearchObject, defaultOptions, getAvailableElasticUrls, getRandomElasticUrl, multiQuery } from "../../pages/api/create-search-object"
import { generateNumberOfDobs } from "../../pages/api/dob-number-gen"
import { multiAutoSearch } from "../../pages/api/multi-search-and-save"
import { generateNumberOfNames } from "../../pages/api/name-number-gen"

'no cache'

async function loadData(){
    const urls = await await getAvailableElasticUrls('http://ec2-18-219-118-71.us-east-2.compute.amazonaws.com:9200')
    const randomSearch = await createSearchObject()
    const randomUrl = await getRandomElasticUrl()
    const searchResult = await multiQuery(randomUrl, randomSearch)
    const multiAutoSearchResult = await multiAutoSearch(randomUrl, 100, 'test', 'testId', 'random', defaultOptions)
    const multiAutoSearchResultWindow1000 = await multiAutoSearch(randomUrl, 100, 'test', 'testId', 'random', {window_size: 1000})
    const multiAutoSearchResultsWindow10000 = await multiAutoSearch(randomUrl, 100, 'test', 'testId', 'random', {window_size: 10000})
    return {
        randomUrl, searchResult, urls, 
        multiAutoSearchResult, multiAutoSearchResultWindow1000, multiAutoSearchResultsWindow10000,
    }
}


export default async function DebugPage() {
    const {
        randomUrl, urls,
        multiAutoSearchResult, multiAutoSearchResultWindow1000, multiAutoSearchResultsWindow10000
    } = await loadData()

    const regularNestedAvg = multiAutoSearchResult.nested_avg
    const regularNestedDobsAvg = multiAutoSearchResult.nested_dobs_avg
    const regularFlatAvg = multiAutoSearchResult.flat_avg

    const window1000NestedAvg = multiAutoSearchResultWindow1000.nested_avg
    const window1000NestedDobsAvg = multiAutoSearchResultWindow1000.nested_dobs_avg
    const window1000FlatAvg = multiAutoSearchResultWindow1000.flat_avg

    const window10000NestedAvg = multiAutoSearchResultsWindow10000.nested_avg
    const window10000NestedDobsAvg = multiAutoSearchResultsWindow10000.nested_dobs_avg
    const window10000FlatAvg = multiAutoSearchResultsWindow10000.flat_avg

    return (
        <div>
            <h1>Debug</h1>
        
            <h2>Urls</h2>
            <pre>{JSON.stringify(urls, null, 2)}</pre>

            <h2>Url</h2>
            <pre>{randomUrl}</pre>

            <h2>Auto Search</h2>
            <pre>{JSON.stringify(multiAutoSearchResult, undefined, 2)}</pre>

            <h2>Auto Search With Window</h2>
            <pre>{JSON.stringify(multiAutoSearchResultWithWindow, undefined, 2)}</pre>

            <h2>Averages: </h2>

            <h4>Regular Nested {regularNestedAvg}</h4>
            <h4>Regular Nested Dob {regularNestedDobsAvg}</h4>
            <h4>Regular Flat {regularFlatAvg}</h4>
            <br/>

            <h4>1000 Window Nested {window1000NestedAvg}</h4>
            <h4>1000 Window Nested Dobs {window1000NestedDobsAvg}</h4>
            <h4>1000 Window Flat {window1000FlatAvg}</h4>
            <br/>

            <h4>10000 Window Nested {window10000NestedAvg}</h4>
            <h4>10000 Window Nested Dobs {window10000NestedDobsAvg}</h4>
            <h4>10000 Window Flat {window10000FlatAvg}</h4>
            <br/>

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