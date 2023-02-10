import { deleteIndex } from "../../app/elastic-instances/[id]/utils"
import { createIndex } from "./create-search-object"
import { checkThatIndexExistsLocal } from "./fetch-previous-tests"
import { getCountOfDocsInIndex } from "./multi-search-and-save"

export async function createWindowSizeIndex(url){
    const indexExists = await checkThatIndexExistsLocal(url, 'window-test')
    if(indexExists) await deleteIndex(url, 'window-test')
    let response = await createIndex(url, 'window-test', windowFeatureMapping) 
    return response
}

export const windowFeatureMapping = {
    "mappings": {
        "properties": {
            "primary_name": {
                "type": "rni_name",
            },
            "similarity": {
                "type": "float"
            }
        }
    }
}

export const indexInfoDefault = {
    count: 0,
    index: "window-test",
}

export async function getIndexInfo(url, index){
    let response = await fetch(`${url}/_cat/indices/${index}?format=json`)
    let data = await response.json()
    const size = data[0]['store.size']
    const count = await getCountOfDocsInIndex(url, index)

    return {count, size, index}
}
