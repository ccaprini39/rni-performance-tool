import { indexBetty } from "../../pages/api/betty";
import { executeQuery, sleep } from "../../pages/api/create-search-object";
import { deleteIndex } from "../elastic-instances/[id]/utils";
import BettyView from "./components/BettyView";

async function getInternalDocs(url, index){
    let query
    let hits = ''
    let innerHits = []
    if(index === 'betty-nested'){
        query = nestedDobsInnerHits
        const response = await executeQuery(url, index, query)
        hits = response.hits.hits
        innerHits = []
        let innerHitsHolder = hits.map(hit => hit.inner_hits.birth_dates.hits.hits)
        innerHitsHolder.forEach(innerHit => {
            innerHit.forEach(item => {
                innerHits.push(item)
            })
        })
        const newQuery = nestedAliasesInnerHits
        const newResponse = await executeQuery(url, index, newQuery)
        const newHits = newResponse.hits.hits
        let newInnerHitsHolder = newHits.map(hit => hit.inner_hits.aliases.hits.hits)
        newInnerHitsHolder.forEach(innerHit => {
            innerHit.forEach(item => {
                innerHits.push(item)
            })
        })

    } else if(index === 'betty-nested-dobs'){
        query = nestedDobsInnerHits
        const response = await executeQuery(url, index, query)
        hits = response.hits.hits
        innerHits = []
        let innerHitsHolder = hits.map(hit => hit.inner_hits.birth_dates.hits.hits)
        innerHitsHolder.forEach(innerHit => {
            innerHit.forEach(item => {
                innerHits.push(item)
            })
        })
    } else if(index === 'betty-flat'){
        query = {query: {match_all: {}}}
        const response = await executeQuery(url, index, query)
        hits = response.hits.hits
        innerHits = hits
    }
    
    // let innerHits = []
    // response.forEach(element => {
    //     innerHits.push(element.hits.)
    // });
    return innerHits
}

async function load(){
    const url = 'http://ec2-18-216-150-137.us-east-2.compute.amazonaws.com:9200'

    // const a = await indexBetty()
    let indices = await fetch(`${url}/_cat/indices?format=json`)
    //first filter out indices that don't start with betty
    indices = await indices.json()
    indices = indices.filter(index => index.index.startsWith('betty'))
    //now for each of those get the _count
    for(let i = 0; i < indices.length; i++){
        let index = indices[i]
        const count = await fetch(`${url}/${index.index}/_count`)
        const hits = await getInternalDocs(url, index.index)
        const countJson = await count.json()
        indices[i] = {
            index: index.index,
            es_count: countJson.count,
            total_count: index['docs.count'],
            innerHitsLength: hits.length,
            innerHits: hits,
        }
    }
    return {
        indices, 
    }
}

export default async function BettyPage(){
    const {
        indices,
    } = await load()

    return (
        <div>
            <BettyView bettyInfo={indices}/>
        </div>
    )

}

const nestedDobsInnerHits =
{
    "query": {
        "nested": {
            "path": "birth_dates",
            "query": {
                "match_all": {}
            },
            "inner_hits": {}
        }
    }
}

const nestedAliasesInnerHits = 
{
    "query": {
        "nested": {
            "path": "aliases",
            "query": {
              "match_all": {}
            },
            "inner_hits": {}
        }
    }
}