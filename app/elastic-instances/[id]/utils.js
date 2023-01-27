import { getPostRequestOptionsStringBody } from "../../../pages/api/create-search-object"

/**
 * Delete an index
 * @param {string} url
 * @param {string} index
 * @returns the response from ElasticSearch
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-delete-index.html
 */
export async function deleteIndex(url, index) {
    const res = await fetch(`${url}/${index}?format=json`, {
        method: 'DELETE'
    })
    const data = await res.json()
    return data
}

/**
 * Get the mapping for an index
 * @param {string} url
 * @param {string} index
 * @returns the mapping or null if no mapping
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-get-mapping.html
 */
export async function getMappingForIndex(url, index) {
    const res = await fetch(`${url}/${index}/_mapping?format=json`, {
        method: 'GET'
    })
    const data = await res.json()
    return data
}

/**
 * bulk index documents
 * @param {string} url the url of the ElasticSearch instance
 * @param {string} docsString the string of documents to index
 * @returns true if successful
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html
 * @example
 * const docsString = `{"index":{"_index":"rni-nested"}}\n${JSON.stringify(initialObject)}\n`
 */
export async function createBulkDocsInIndex(url, docsString){
    let requestOptions = getPostRequestOptionsStringBody(docsString)
    let response = await fetch(`${url}/_bulk?format=json`, requestOptions)
    return response.ok
}


