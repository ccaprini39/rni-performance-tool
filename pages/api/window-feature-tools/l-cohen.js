import { createBulkDocsInIndex } from "../../../app/elastic-instances/[id]/utils";
import { executeQuery } from "../create-search-object";

//This is an example what the data that the window feature will use to determine if false negatives, false positives, and true positives presented in the results
export const arrayOfCohenNames = 
[
    {
      "index": 1,
      "primary_name": "Leonard Norman Cohen",
      "similarity": 1
    },
    {
      "index": 2,
      "primary_name": "Leonard Norm Cohen",
      "similarity": .95
    },
    {
      "index": 3,
      "primary_name": "Len Cohen",
      "similarity": .90
    },
    {
      "index": 4,
      "primary_name": "Leonard Cohen",
      "similarity": .95
    },
    {
      "index": 5,
      "primary_name": "Len Norman Cohen",
      "similarity": .95
    },
    {
      "index": 6,
      "primary_name": "Norman Leo Cohen",
      "similarity": .90
    },
    {
      "index": 7,
      "primary_name": "Lenny Cohen",
      "similarity": .85
    },
    {
      "index": 8,
      "primary_name": "Lenard Cohen",
      "similarity": .85
    },
    {
      "index": 9,
      "primary_name": "Norman Cohen",
      "similarity": .70
    },
    {
      "index": 10,
      "primary_name": "Leon Cohen",
      "similarity": .80
    },
    {
      "index": 11,
      "primary_name": "Lee Cohen",
      "similarity": .60
    },
    {
      "index": 12,
      "primary_name": "Leo Cohen",
      "similarity": .65
    },
    {
      "index": 13,
      "primary_name": "Lenny Norman",
      "similarity": .75
    },
    {
      "index": 14,
      "primary_name": "Leon Norman",
      "similarity": .80
    },
    {
      "index": 15,
      "primary_name": "Norman Lee",
      "similarity": .60
    },
    {
      "index": 16,
      "primary_name": "Leonard Cohan",
      "similarity": .75
    },
    {
      "index": 17,
      "primary_name": "Lenard Norman",
      "similarity": .80
    },
    {
      "index": 18,
      "primary_name": "Lenny Norman Cohen",
      "similarity": .90
    },
    {
      "index": 19,
      "primary_name": "Lee Norman Cohen",
      "similarity": .7
    },
    {
      "index": 20,
      "primary_name": "Leo Norman Cohen",
      "similarity": .80
    },
    {
      "index": 21,
      "primary_name": "Leonard Smith",
      "similarity": .60
    },
    {
      "index": 22,
      "primary_name": "Leonard Brown",
      "similarity": .60
    },
    {
      "index": 23,
      "primary_name": "Leonard Johnson",
      "similarity": .60
    },
    {
        "index": 24,
        "primary_name": "Jacob Andrew Parker",
        "similarity": 0
    },
    {
        "index": 25,
        "primary_name": "Emily Rose Thompson",
        "similarity": 0
    },
    {
        "index": 26,
        "primary_name": "Michael James Wilson",
        "similarity": 0
    },
    {
        "index": 27,
        "primary_name": "Isabella Marie Green",
        "similarity": 0
    },
    {
        "index": 28,
        "primary_name": "William David Adams",
        "similarity": 0
    },
    {
        "index": 29,
        "primary_name": "Ava Grace Collins",
        "similarity": 0
    },
    {
        "index": 30,
        "primary_name": "Benjamin Alexander Nelson",
        "similarity": 0
    },
    {
        "index": 31,
        "primary_name": "Sophia Elizabeth Davis",
        "similarity": 0
    },
    {
        "index": 32,
        "primary_name": "Ethan Matthew Young",
        "similarity": 0
    },
    {
        "index": 33,
        "primary_name": "Madison Nicole Lee",
        "similarity": 0
    },
    {
        "index": 34,
        "primary_name": "Matthew Ryan Wood",
        "similarity": 0
    },
    {
        "index": 35,
        "primary_name": "Olivia Grace Smith",
        "similarity": 0
    },
    {
        "index": 36,
        "primary_name": "Daniel Alexander Johnson",
        "similarity": 0
    },
    {
        "index": 37,
        "primary_name": "Abigail Grace Jones",
        "similarity": 0
    },
    {
        "index": 38,
        "primary_name": "Alexander James Brown",
        "similarity": 0
    },
    {
        "index": 39,
        "primary_name": "Chloe Elizabeth Miller",
        "similarity": 0
    },
    {
        "index": 40,
        "primary_name": "Elijah James Davis",
        "similarity": 0
    },
    {
        "index": 41,
        "primary_name": "Elizabeth Rose Taylor",
        "similarity": 0
    },
    {
        "index": 42,
        "primary_name": "James William Jackson",
        "similarity": 0
    },
    {
        "index": 43,
        "primary_name": "Lily Grace White",
        "similarity": 0
    },
    {
        "index": 44,
        "primary_name": "William James Harris",
        "similarity": 0
    },
    {
        "index": 45,
        "primary_name": "Samantha Marie Martin",
        "similarity": 0
    },
    {
        "index": 46,
        "primary_name": "Andrew James Thompson",
        "similarity": 0
    },
    {
        "index": 47,
        "primary_name": "Grace Elizabeth Clark",
        "similarity": 0
    },
    {
        "index": 48,
        "primary_name": "Joseph Matthew Garcia",
        "similarity": 0
    },
    {
        "index": 49,
        "primary_name": "Natalie Rose Rodriguez",
        "similarity": 0
    },
    {
        "index": 50,
        "primary_name": "Christopher James Martinez",
        "similarity": 0
    }
]


//takes in an array of objects with an index, primary_name, and similarity and maps them to a bulk index string for the window-test index
export function createBulkElasticStringOfNames(arrayOfNames){
    let bulkString = ''
    arrayOfNames.forEach((name) => {
        bulkString += JSON.stringify({ index: { _index: 'window-test', _type: 'names', _id: name.index } }) + '\n';
        bulkString += JSON.stringify({ primary_name: {
            "data" : name,
            "entityType" : "PERSON"
        }, similarity: name.similarity }) + '\n'
    })
    return bulkString
}

export async function indexLeonard(url){
    const bulkString = createBulkElasticStringOfNames(Leonard)
    const response = await createBulkDocsInIndex(url, bulkString)
    return response
}

export async function queryLeonard(url, window_size){
    let rniQuery = 
    {
        "query" : {
            "bool" : {
                "should" : [
                    {
                        "match" : {primary_name : `{"data" : "${primary_name}", "entityType" : "PERSON"}`}
                    }
                ]
            }
        }
    }
    let rescorer =  
    {
        "rescore" : {
            "window_size" : window_size,
            "query" : {
                "rescore_query" : {
                    "function_score" : {
                        "doc_score" : {
                            "fields" : {
                                "primary_name" : {"query_value" : {"data" : primary_name, "entityType" : "PERSON"}}
                            }
                        }
                    }
                },
                "query_weight" : 0.0,
                "rescore_query_weight" : 1.0
            }
        }
    }
    const query = {...rniQuery, ...rescorer}
    let response = await executeQuery(url, 'window-size', query)
    return response
}
