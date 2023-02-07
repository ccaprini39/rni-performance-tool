import { deleteIndex } from "../../app/elastic-instances/[id]/utils"
import { createIndex } from "./create-search-object"
import { checkThatIndexExistsLocal } from "./fetch-previous-tests"

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