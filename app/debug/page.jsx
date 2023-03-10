import { createNestedQueryObject, createSearchObject } from '../../pages/api/create-search-object'
import { generateBulkNestedOnly } from '../../pages/api/flatten-nested-identity'
import { getNestedIdentity } from '../../pages/api/nested-identity-gen'

async function loadStuff(){
    const nestedIdentity = await getNestedIdentity()
    const searchObject = await createSearchObject()
    const nestedQuery = await createNestedQueryObject()
    const nestedIndex = await generateBulkNestedOnly()
    return {
        nestedIdentity,
        nestedQuery,
        nestedIndex
    }
}

export default async function DebugPage(){
    const {
        nestedIdentity, 
        nestedQuery,
        nestedIndex
    } = await loadStuff()

    return(
        <div>
            <h1>Debug Page</h1>
            <pre>{JSON.stringify(nestedIndex, null, 2)}</pre>
        </div>
    )
}