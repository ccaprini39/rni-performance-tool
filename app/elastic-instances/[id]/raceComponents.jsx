import { Button } from "@mui/material"
import { createIndex, flatMapping, indexBulkObjects, nestedDobsMapping, nestedMapping, singleAutoSearch } from "../../../data-generation/dataGeneration"
import { deleteIndex, getMappingForIndex } from "../../../elastic-tools/elasticTools"

export const schemaIndices = [
    'rni-nested-dobs',
    'rni-nested',
    'rni-flat',
]

export async function resetIndexes(targetUrl){
    //this will delete all of th docs in the schema indices
    for await (const index of schemaIndices) {
        await deleteAndRecreateIndex(targetUrl, index)
    }
}

export async function resetIndexDocs(targetUrl, indexName){
    //this will delete all of the documents in the elasticsearch index
    let url = targetUrl + '/' + indexName + '/_delete_by_query'
    let body = {
        "query": {
            "match_all": {}
        }
    }
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }
    await fetch(url, options)
}

export async function deleteAndRecreateIndex(targetUrl, indexName){
    //this will delete the index and then recreate it, but first it will get the current mapping and then apply it to the new index
    let mapping = await getMappingForIndex(targetUrl, indexName)
    await deleteIndex(targetUrl, indexName)
    await createIndex(targetUrl, indexName, mapping)
}

export async function deleteandRecreateAllIndices(targetUrl){
    //this will delete all of the schema indices and then recreate them
    await deleteIndex(targetUrl, 'rni-nested')
    await deleteIndex(targetUrl, 'rni-flat')
    await deleteIndex(targetUrl, 'rni-nested-dobs')
    await createIndex(targetUrl, 'rni-nested', nestedMapping)
    await createIndex(targetUrl, 'rni-flat', flatMapping)
    await createIndex(targetUrl, 'rni-nested-dobs', nestedDobsMapping)
}

export function ResetIndicesButton({targetUrl, toggle}){
    async function handleClick(){
        await deleteandRecreateAllIndices(targetUrl)
        toggle()
    }
    return (
        <Button variant="contained" onClick={handleClick}>Reset Indices</Button>
    )
}

export function BulkIndexForm({targetUrl, toggle}){
    async function handleClick(){
        await indexBulkObjects(targetUrl, 10)
        toggle()
    }
    return (
        <Button variant="contained" onClick={handleClick}>Bulk Index</Button>
    )
}

export function SingleAutoSearchButton({url}){
    async function handleClick(){
        let result = await singleAutoSearch(url, 'rni-nested')
        console.log(result)
    }
    return (
        <Button variant="contained" onClick={handleClick}>Single Auto Search</Button>
    )
}
