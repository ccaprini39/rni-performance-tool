'no cache'

import { createSearchObject, defaultOptions, getAvailableElasticUrls, getRandomElasticUrl, multiQuery } from "../../pages/api/create-search-object"
import { multiAutoSearch } from "../../pages/api/multi-search-and-save"

async function loadData(){
    const url = await getRandomElasticUrl()
    const urls = await getAvailableElasticUrls('http://ec2-18-219-118-71.us-east-2.compute.amazonaws.com:9200')
    const randomSearch = await createSearchObject()
    const searchResult = await multiQuery(url, randomSearch)
    const multiAutoSearchResultWindow10 = await multiAutoSearch(url, 10, 'test', 'random', {window_size: 10})
    const multiAutoSearchResultWindow100 = await multiAutoSearch(url, 10, 'test', 'random', defaultOptions)
    const multiAutoSearchResultWindow1000 = await multiAutoSearch(url, 10, 'test', 'random', {window_size: 1000})
    return { url, urls, randomSearch, searchResult, searchResult, 
        multiAutoSearchResultWindow10, multiAutoSearchResultWindow100, multiAutoSearchResultWindow1000
    }
}

export default async function TestPage() {

    const {
        multiAutoSearchResultWindow10, multiAutoSearchResultWindow100, multiAutoSearchResultWindow1000
    } = await loadData()

    const window10NestedAvg = multiAutoSearchResultWindow10.nested_avg
    const window10NestedDobsAvg = multiAutoSearchResultWindow10.nested_dobs_avg
    const window10FlatAvg = multiAutoSearchResultWindow10.flat_avg

    const window100NestedAvg = multiAutoSearchResultWindow100.nested_avg
    const window100NestedDobsAvg = multiAutoSearchResultWindow100.nested_dobs_avg
    const window100FlatAvg = multiAutoSearchResultWindow100.flat_avg

    const window1000NestedAvg = multiAutoSearchResultWindow1000.nested_avg
    const window1000NestedDobsAvg = multiAutoSearchResultWindow1000.nested_dobs_avg
    const window1000FlatAvg = multiAutoSearchResultWindow1000.flat_avg

    return (
        <div>
            <h1>Test</h1>

            <h2>Averages: </h2>

            <h3>Window 10</h3>
            <h4>10 Window Nested: {window10NestedAvg}</h4>
            <h4>10 Window Nested Dobs: {window10NestedDobsAvg}</h4>
            <h4>10 Window Flat: {window10FlatAvg}</h4>
            <br/>

            <h3>Window 100</h3>
            <h4>100 Window Nested: {window100NestedAvg}</h4>
            <h4>100 Window Nested Dobs: {window100NestedDobsAvg}</h4>
            <h4>100 Window Flat: {window100FlatAvg}</h4>
            <br/>
        
            <h3>Window 1000</h3>
            <h4>1000 Window Nested: {window1000NestedAvg}</h4>
            <h4>1000 Window Nested Dobs: {window1000NestedDobsAvg}</h4>
            <h4>1000 Window Flat: {window1000FlatAvg}</h4>
            <br/>

        </div>   
    )
}