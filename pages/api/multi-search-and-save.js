/**
 * mappings for the past-tests index
 * this is used as a reference for creating and recreating the index
 */
export const pastTestMappings = 
{
    "mappings": {
      "properties": {
        "average": {
          "type": "long"
        },
        "batchId": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "index": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "indexCount": {
          "type": "long"
        },
        "max": {
          "type": "long"
        },
        "min": {
          "type": "long"
        },
        "numberOfQueries": {
          "type": "long"
        },
        "queries": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "results": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "testId": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "timeExecuted": {
          "type": "date"
        },
        "tooks": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "url": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "urlName": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        }
      }
    }
}

export async function multiAutoSearch(url, indexName, number, batchId, testId, urlName){
    const name = urlName //name associated with the elastic url
    let array = [...Array(number).keys()] //array to keep track of the number of searches
    let timesArray = [] //array of the times of the searches
    let resultsArray = []
    let queryArray = []
    let indexCount = await getCountOfDocsInIndex(url, indexName)
    indexCount = indexCount.count
    let time = getDateTimeString()
    for (let num in array){
        let result = await (url, indexName)
        let {queryObject, response} = result
        timesArray.push(response.took)
        resultsArray.push(JSON.stringify(response))
        queryArray.push(JSON.stringify(queryObject))
    }
    let result = {
        url : url,
        urlName : name,
        timeExecuted : time,
        queries: queryArray.join(),
        index : indexName,
        batchId : batchId,
        testId : testId,
        indexCount : indexCount,
        numberOfQueries : number,
        tooks: timesArray.join(),
        results: resultsArray.join(),
        average: timesArray.reduce((a, b) => a + b, 0) / timesArray.length,
        min: Math.min(...timesArray),
        max: Math.max(...timesArray)
    }
    return result
}