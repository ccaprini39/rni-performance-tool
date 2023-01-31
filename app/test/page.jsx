'no cache'

import { createSearchObject, defaultOptions, getAvailableElasticUrls, getRandomElasticUrl, multiQuery, nestedDobQuery } from "../../pages/api/create-search-object"
import { multiAutoSearch } from "../../pages/api/multi-search-and-save"

async function loadData(){
    // const url = await getRandomElasticUrl()
    // const urls = await getAvailableElasticUrls('http://ec2-18-219-118-71.us-east-2.compute.amazonaws.com:9200')
    const randomSearch = await createSearchObject()
    const searchWithOptions = await createSearchObject(defaultOptions)

    return { randomSearch, searchWithOptions }
}

export default async function TestPage() {

    const {
       randomSearch, searchWithOptions
    } = await loadData()

    const nestedSearch = {"query":{"bool":{"should":[{"nested":{"path":"aliases","query":{"bool":{"should":{"match":{"aliases.primary_name":"{\"data\" : \"Cynthia Stephanie Dorothy White\", \"entityType\" : \"PERSON\"}"}}}}}},{"nested":{"path":"birth_dates","query":{"bool":{"should":{"match":{"birth_dates.birth_date":"1955-01-05"}}}}}}]}},"rescore":[{"window_size":100,"rni_query":{"rescore_query":{"nested":{"score_mode":"max","path":"aliases","query":{"function_score":{"name_score":{"field":"aliases.primary_name","query_name":{"data":"Cynthia Stephanie Dorothy White","entityType":"PERSON"}}}}}},"score_mode":"total","query_weight":0,"rescore_query_weight":1}},{"window_size":100,"rni_query":{"rescore_query":{"nested":{"score_mode":"max","path":"birth_dates","query":{"function_score":{"date_score":{"field":"birth_dates.birth_date","query_date":"1955-01-05"}}}}},"score_mode":"total","query_weight":0,"rescore_query_weight":1}}]}
    const nestedDobSearch = {"query":{"bool":{"should":[{"nested":{"path":"birth_dates","query":{"bool":{"should":{"match":{"birth_date":"1955-01-05"}}}}}},{"match":{"primary_name":"{\"data\" : \"Cynthia Stephanie Dorothy White\", \"entityType\" : \"PERSON\"}"}}]}},"rescore":[{"window_size":100,"rni_query":{"rescore_query":{"nested":{"score_mode":"max","path":"birth_dates","query":{"function_score":{"date_score":{"field":"birth_dates.birth_date","query_date":"1955-01-05"}}}}},"score_mode":"total","query_weight":0,"rescore_query_weight":1}},{"window_size":100,"rni_query":{"rescore_query":{"function_score":{"name_score":{"field":"primary_name","query_name":{"data":"Cynthia Stephanie Dorothy White","entityType":"PERSON"}}}},"score_mode":"total","query_weight":0,"rescore_query_weight":1}}]}
    const flatSeach = {"query":{"bool":{"should":[{"match":{"primary_name":"{\"data\" : \"Cynthia Stephanie Dorothy White\", \"entityType\" : \"PERSON\"}"}},{"match":{"birth_date":"1955-01-05"}}]}},"rescore":{"window_size":100,"query":{"rescore_query":{"function_score":{"doc_score":{"fields":{"primary_name":{"query_value":{"data":"Cynthia Stephanie Dorothy White","entityType":"PERSON"}},"dob":{"query_value":"1955-01-05"}}}}},"query_weight":0,"rescore_query_weight":1}}}

    return (
        <div>
            <h1>Test</h1>
            <h2>Random Search, no options</h2>
            <pre>{JSON.stringify(randomSearch, null, 2)}</pre>
            <h2>Search with default options</h2>
            <pre>{JSON.stringify(searchWithOptions, null, 2)}</pre>

            <h2>Nested Search</h2>
            <pre>{JSON.stringify(nestedSearch, null, 2)}</pre>
            <h2>Nested DOB Search</h2>
            <pre>{JSON.stringify(nestedDobSearch, null, 2)}</pre>
            <h2>Flat Search</h2>
            <pre>{JSON.stringify(flatSeach, null, 2)}</pre>
    
        </div>   
    )
}