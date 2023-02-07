import { deleteIndex } from "../../app/elastic-instances/[id]/utils"
import { createIndex } from "./create-search-object"

export async function createWindowSizeIndex(url){
    const indexExists = await checkThatIndexExistsLocal(url, 'window-size')
    if(indexExists) await deleteIndex(url, 'window-size')
    let response = await createIndex(url, 'window-size', windowFeatureMapping) 
    return response
}

export const windowFeatureMapping = {
    "properties": {
        "primary_name": {
            "type": "rni_name",
        },
        "similarity": {
            "type": "float"
        }
    }
}