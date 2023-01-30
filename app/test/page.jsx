'no cache'

import { createSearchObject, defaultOptions, getAvailableElasticUrls, getRandomElasticUrl, multiQuery, nestedDobQuery } from "../../pages/api/create-search-object"
import { multiAutoSearch } from "../../pages/api/multi-search-and-save"

async function loadData(){
    const url = await getRandomElasticUrl()
    const urls = await getAvailableElasticUrls('http://ec2-18-219-118-71.us-east-2.compute.amazonaws.com:9200')
    const randomSearch = await createSearchObject()
    const searchResult = await multiQuery(url, randomSearch)
    const nestedDobResult = await nestedDobQuery(url, randomSearch)
    const multiAutoSearchResultWindow10 = await multiAutoSearch(url, 10, 'test', 'random', {window_size: 10})
    const multiAutoSearchResultWindow100 = await multiAutoSearch(url, 10, 'test', 'random', defaultOptions)
    return { url, urls, randomSearch, searchResult, searchResult, 
        multiAutoSearchResultWindow10, multiAutoSearchResultWindow100,
        nestedDobResult
    }
}

export default async function TestPage() {

    const {
       nestedDobResult
    } = await loadData()

    // const window10NestedAvg = multiAutoSearchResultWindow10.nested_avg
    // const window10NestedDobsAvg = multiAutoSearchResultWindow10.nested_dobs_avg
    // const window10FlatAvg = multiAutoSearchResultWindow10.flat_avg

    // const window100NestedAvg = multiAutoSearchResultWindow100.nested_avg
    // const window100NestedDobsAvg = multiAutoSearchResultWindow100.nested_dobs_avg
    // const window100FlatAvg = multiAutoSearchResultWindow100.flat_avg

    // const window1000NestedAvg = multiAutoSearchResultWindow1000.nested_avg
    // const window1000NestedDobsAvg = multiAutoSearchResultWindow1000.nested_dobs_avg
    // const window1000FlatAvg = multiAutoSearchResultWindow1000.flat_avg

    return (
        <div>
            <h1>Test</h1>
            <h2>NestedDobResult Search</h2>
            <pre>{JSON.stringify(nestedDobResult, null, 2)}</pre>
    

        </div>   
    )
}