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
 * Bulk index documents in ElasticSearch
 * @param {string} url 
 * @param {string} index 
 * @param {string} docsString 
 * @returns true if successful, false if not
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html
 */
export async function bulkIndexDocs(url, index, docsString) {
    const res = await fetch(`${url}/${index}/_bulk?format=json`, {
        method: 'POST',
        body: docsString
    })
    const data = await res.json()
    if(data.errors) return false
    else return true
}
