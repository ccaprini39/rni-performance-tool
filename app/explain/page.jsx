import { clearEsCache, createSearchObject, flatQuery, nestedDobQuery, nestedQuery, sleep } from '../../pages/api/create-search-object'

async function loadStuff(){
    const searchObject1 = await createSearchObject()
    const searchObject2 = await createSearchObject()
    const searchObject3 = await createSearchObject()
    const url = 'http://ec2-18-216-150-137.us-east-2.compute.amazonaws.com:9200'
    const queryNoExplain = await nestedDobQuery(url, searchObject1, 0)
    //const queryNoExplain = await flatQuery(url, searchObject1, 0)
    await sleep(10)
    await clearEsCache(url)
    const queryExplain = await nestedDobQuery(url, searchObject2, 1)
    //const queryExplain = await flatQuery(url, searchObject2, 1)
    await sleep(10)
    await clearEsCache(url)
    const queryExplainApi = await nestedDobQuery(url, searchObject3, 2)
    //const queryExplainApi = await flatQuery(url, searchObject3, 2)
    await sleep(10)
    await clearEsCache(url)
    return {
      queryNoExplain, queryExplain, queryExplainApi
    }
}

function getPercentDiff(a,b){
  return 100 * Math.abs((a - b) / ((a + b) / 2))
}

async function average100queries(){
  let results = {
    queryNoExplainTooks: [],
    queryExplainTooks: [],
    queryExplainApiTooks: [],
    queryNoExplainMetrics : {
      average: 0,
      min: 0,
      max: 0,
      percentDiff: 0,
    },
    queryExplainMetrics : {
      average: 0,
      min: 0,
      max: 0,
      percentDiff: 0,
    },
    queryExplainApiMetrics : {
      average: 0,
      min: 0,
      max: 0,
      percentDiff: 0,
    }
  }
  let x = 1
  for await (const _ of Array(10).keys()) {
    await loadStuff()//10 warmup queries
  }
  for await (const _ of Array(10).keys()) {
    const { queryNoExplain, queryExplain, queryExplainApi} = await loadStuff()
    results.queryNoExplainTooks.push(queryNoExplain.took)
    results.queryExplainTooks.push(queryExplain.took)
    results.queryExplainApiTooks.push(queryExplainApi.took)
    console.log(x)
    x ++
  }
  results.queryNoExplainMetrics.average = results.queryNoExplainTooks.reduce((a,b) => a + b, 0) / results.queryNoExplainTooks.length
  results.queryExplainMetrics.average = results.queryExplainTooks.reduce((a,b) => a + b, 0) / results.queryExplainTooks.length
  results.queryExplainApiMetrics.average = results.queryExplainApiTooks.reduce((a,b) => a + b, 0) / results.queryExplainApiTooks.length
  results.queryNoExplainMetrics.min = Math.min(...results.queryNoExplainTooks)
  results.queryExplainMetrics.min = Math.min(...results.queryExplainTooks)
  results.queryExplainApiMetrics.min = Math.min(...results.queryExplainApiTooks)
  results.queryNoExplainMetrics.max = Math.max(...results.queryNoExplainTooks)
  results.queryExplainMetrics.max = Math.max(...results.queryExplainTooks)
  results.queryExplainApiMetrics.max = Math.max(...results.queryExplainApiTooks)
  results.queryNoExplainMetrics.percentDiff = getPercentDiff(results.queryNoExplainMetrics.average, results.queryNoExplainMetrics.average) + '%'
  results.queryExplainMetrics.percentDiff = getPercentDiff(results.queryNoExplainMetrics.average, results.queryExplainMetrics.average) + '%'
  results.queryExplainApiMetrics.percentDiff = getPercentDiff(results.queryNoExplainMetrics.average, results.queryExplainApiMetrics.average) + '%'

  const { queryNoExplainMetrics, queryExplainMetrics, queryExplainApiMetrics } = results
  return { queryNoExplainMetrics, queryExplainMetrics, queryExplainApiMetrics }
}

export default async function Page() {
    const {
      queryNoExplain, queryExplain, queryExplainApi
    } = await loadStuff()
    const results = await average100queries()
    const noExplainTook = queryNoExplain.took
    const explainTook = queryExplain.took
    const explainApiTook = queryExplainApi.took
    const flagDiff = getPercentDiff(noExplainTook, explainTook)
    const apiDiff = getPercentDiff(noExplainTook, explainApiTook)

  return(
    <div>
        <h1>tooks</h1>
        No explain: {queryNoExplain.took}
        <br/>
        Explain (query with flag): {queryExplain.took}
        <br/>
        Explain Api: {queryExplainApi.took}
        <br/>
        Flag diff: {flagDiff}% slower
        <br/>
        Api diff: {apiDiff}% slower
        <br/>
        <h1>100 queries</h1>
        <pre>{JSON.stringify(results, null, 2)}</pre>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <h1>No Explain</h1>
        <pre>{JSON.stringify(queryNoExplain, null, 2)}</pre>
        <h1>Explain</h1>
        <pre>{JSON.stringify(queryExplain, null, 2)}</pre>

    </div>
  )
}