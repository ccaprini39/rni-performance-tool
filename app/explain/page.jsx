import { clearEsCache, createSearchObject, flatQuery, nestedDobQuery, nestedQuery, sleep } from '../../pages/api/create-search-object'

async function loadStuff(){
    const searchObject1 = await createSearchObject()
    const searchObject2 = await createSearchObject()
    const searchObject3 = await createSearchObject()
    const url = 'http://ec2-18-216-150-137.us-east-2.compute.amazonaws.com:9200'
    const queryNoExplain = await nestedDobQuery(url, searchObject1, 0)
    await sleep(10)
    await clearEsCache(url)
    const queryExplain = await nestedDobQuery(url, searchObject1, 1)
    await sleep(10)
    await clearEsCache(url)
    const queryExplainApi = await nestedDobQuery(url, searchObject1, 2)
    await sleep(10)
    await clearEsCache(url)
    return {
      queryNoExplain, queryExplain, queryExplainApi
    }
}

export default async function Page() {
    const {
      queryNoExplain, queryExplain, queryExplainApi
    } = await loadStuff()
    const noExplainTook = queryNoExplain.took
    const explainTook = queryExplain.took
    const explainApiTook = queryExplainApi.took
    const flagDiff = getPercentDiff(noExplainTook, explainTook)
    const apiDiff = getPercentDiff(noExplainTook, explainApiTook)
    function getPercentDiff(a,b){
        return 100 * Math.abs((a - b) / ((a + b) / 2))
    }

  return(
    <div>
        <h1>tooks</h1>
        No explain: {queryNoExplain.took}
        <br/>
        Explain: {queryExplain.took}
        <br/>
        Explain Api: {queryExplainApi.took}
        <br/>
        Flag diff: {flagDiff}% slower
        <br/>
        Api diff: {apiDiff}% slower
        <br/>
        <h1>No Explain</h1>
        <pre>{JSON.stringify(queryNoExplain, null, 2)}</pre>
        <h1>Explain</h1>
        <pre>{JSON.stringify(queryExplain, null, 2)}</pre>

    </div>
  )
}