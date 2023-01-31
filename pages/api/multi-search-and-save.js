import { createSearchObject, multiQuery } from "./create-search-object"


/**
 * Function that executes multiple searches, gathers the results, and gives results to be saved to the previous-tests index
 * note that this function doesn't actually save the results to the previous-tests index
 * @param {string} url the url of the ElasticSearch instance
 * @param {number} number 
 * @param {string} description used to identify the test later
 * @param {string} urlName the name associated with the url
 * @param {object} searchOptions for the query, see createSearchObject
 * @returns a promise that resolves to an object with the results of the test
 */
export async function multiAutoSearch(url, number, description, urlName, searchOptions){
    //warmup function: executes 5 iterations of the search to warm up the cache

    for await (const _ of Array(5).keys()){
        const randomSearch = await createSearchObject(searchOptions)
        await multiQuery(url, randomSearch)
    }
    const name = urlName //name associated with the elastic url
    let array = [...Array(number).keys()] //array to keep track of the number of searches
    let nested_tooks = [] //array of the times of the searches for the nested index
    let nested_dobs_tooks = [] //array of the times of the searches for the nested-dobs index
    let flat_tooks = [] //array of the times of the searches for the flat index
    let nested_index_count = await getCountOfDocsInIndex(url, 'rni-nested') 
    let nested_dobs_index_count = await getCountOfDocsInIndex(url, 'rni-nested-dobs') //number of docs in the nested-dobs index
    let flat_index_count = await getCountOfDocsInIndex(url, 'rni-flat') //number of docs in the flat index
    let time = getDateTimeString('simple')
    for await(const _ of array){
        const randomSearch = await createSearchObject(searchOptions)
        let {nestedResult, nestedDobResult, flatResult} = await multiQuery(url, randomSearch)
        nested_tooks.push(nestedResult.took)
        nested_dobs_tooks.push(nestedDobResult.took)
        flat_tooks.push(flatResult.took)
    }
    const result = {
        url : url,
        urlName : name,
        window: searchOptions.windowSize,
        timeExecuted : time,
        description : description,
        nestedIndexCount : nested_index_count,
        nestedDobsIndexCount : nested_dobs_index_count,
        flatIndexCount : flat_index_count,
        nestedTooks : nested_tooks,
        nestedDobsTooks : nested_dobs_tooks,
        flatTooks : flat_tooks,
        nested_avg : nested_tooks.reduce((a, b) => a + b, 0) / nested_tooks.length,
        nested_dobs_avg : nested_dobs_tooks.reduce((a, b) => a + b, 0) / nested_dobs_tooks.length,
        flat_avg : flat_tooks.reduce((a, b) => a + b, 0) / flat_tooks.length,
        nested_min : Math.min(...nested_tooks),
        nested_dobs_min : Math.min(...nested_dobs_tooks),
        flat_min : Math.min(...flat_tooks),
        nested_max : Math.max(...nested_tooks),
        nested_dobs_max : Math.max(...nested_dobs_tooks),
        flat_max : Math.max(...flat_tooks),
        numberOfQueries : number,
    }
    return result
}

export function getDateTimeString(format = 'ISO'){
    const date = new Date()
    if(format === 'ISO') return date.toISOString()
    if(format === 'simple') return date.toDateString() + `(${date.toLocaleTimeString()})`
    else return date.toString()
}

/**
 * gets the count of documents in an index
 * @param {string} url the url of the ElasticSearch instance 
 * @param {string} index the name of the index to query
 * @returns the count of documents in the index
 */
export async function getCountOfDocsInIndex(url, index){
    const res = await fetch(`${url}/${index}/_count`, {
        method: 'GET'
    })
    const data = await res.json()
    return data.count
}
