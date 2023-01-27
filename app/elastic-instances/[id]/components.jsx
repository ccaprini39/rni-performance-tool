'use client'
import { Button, Card, CardContent, CircularProgress, FormControlLabel, FormGroup, Switch, TextField, Typography } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { AgGridReact, AgGridColumn } from "ag-grid-react"
import "ag-grid-community/dist/styles/ag-grid.css"
import "ag-grid-community/dist/styles/ag-theme-alpine.css"
import { useEffect, useState } from "react"
import { createBulkDocsInIndex, deleteIndex } from "./utils"
import { generateOneHundredBulkObjects } from "../../../pages/api/flatten-nested-identity"
import { createIndex, defaultOptions } from "../../../pages/api/create-search-object"
import { getDateTimeString, multiAutoSearch } from "../../../pages/api/multi-search-and-save"
import ResultsComparisonChart, { Test } from "../../../pages/shared-components/ResultsComparisonGraph"

export function SimpleCard({title, body, color}){
    if(title === null || title === undefined) title = 'Simple Card'
    if(body === null || title === undefined) body = 'This is a simple card'
    return (
        <Card sx={{ minWidth: 275 }}>
            <CardContent>
                <Typography sx={{ fontSize: 14}} variant="h5" component="h2">
                    {title}
                </Typography>
                <Typography color={color} variant="h5" component="div">
                    {body}
                </Typography>
            </CardContent>
        </Card>
    )
}

export function OverAllGrid({ health, plugins, indices, nodesStats, clusterStats}){
    const formatter = Intl.NumberFormat('en', {
        notation: 'compact',
        style: 'unit',
        unit: 'gigabyte',
    })
    const formatter2 = Intl.NumberFormat('en', {
        notation: 'compact',
        style: 'unit',
        unit: 'megabyte',
    })
    function getPercent(value, total){
        return Math.round((value / total) * 100)
    }
    function bytesToMB(bytes){
        return Math.round(bytes / 1000000)
    }
    function bytesToGB(bytes){
        return Math.round(bytes / 1000000000)
    }
    const jvmMemoryPercent = getPercent(clusterStats.nodes.jvm.mem.heap_used_in_bytes, clusterStats.nodes.jvm.mem.heap_max_in_bytes)
    const fileMemoryUsed = clusterStats.nodes.fs.total_in_bytes - clusterStats.nodes.fs.free_in_bytes
    const fileMemoryPercent = getPercent(fileMemoryUsed, clusterStats.nodes.fs.total_in_bytes)
    return (
        <div style={{backgroundColor: 'lightgrey', padding: '1vw'}}>
            <Grid2 container spacing={2}>
                <Grid2 xs={3}>
                    <SimpleCard title={`Cluster Health`} body={health.status} />
                </Grid2>
                <Grid2 xs={3}>
                    <SimpleCard title='Total Indices' body={indices.length} />
                </Grid2>
                <Grid2 xs={3}>
                    <SimpleCard title='Total Nodes' body={nodesStats._nodes.total} />
                </Grid2>
                <Grid2 xs={3}>
                    <SimpleCard title='Total Documents' body={clusterStats.indices.docs.count} />
                </Grid2>
                <Grid2 xs={3}>
                    <SimpleCard title='Total Data Size' body={formatter2.format(bytesToMB(clusterStats.indices.store.size_in_bytes))} />
                </Grid2>
                <Grid2 xs={3}>
                    <SimpleCard title='CPU Usage' body={clusterStats.nodes.process.cpu.percent + '%'} />
                </Grid2>
                <Grid2 xs={3}>
                    <SimpleCard title='JVM Memory Usage' body={formatter.format(bytesToGB(clusterStats.nodes.jvm.mem.heap_used_in_bytes))} />
                </Grid2>
                <Grid2 xs={3}>
                    <SimpleCard title='JVM Memory Max' body={formatter.format(bytesToGB(clusterStats.nodes.jvm.mem.heap_max_in_bytes))} />
                </Grid2>
                <Grid2 xs={3}>
                    <SimpleCard title='JVM Memory' body={jvmMemoryPercent + '%'} />
                </Grid2>
                <Grid2 xs={3}>
                    <SimpleCard title='File System' body={fileMemoryPercent + '%'} />
                </Grid2>
            </Grid2>
        </div>
    )
}

export default function IndexTable({ indices, id }) {
    const [hiddenStatus, setHiddenStatus] = useState(true)
    const [currentIndices, setCurrentIndices] = useState(indices)

    useEffect(() => {
        if (hiddenStatus) {
            setCurrentIndices(indices.filter((index) => index.index[0] !== '.'))
        }
        else {
            setCurrentIndices(indices)
        }
    }, [hiddenStatus])

    const defaultColDef = {
        flex: 1,
        minWidth: 150,
        resizable: true,
        sortable: true,
        filter: true,
    }

    return (
        <div>
            <FormControlLabel 
                control={<Switch checked={!hiddenStatus} onChange={() => setHiddenStatus(!hiddenStatus)} />}
                label="Show Hidden Indices"
                labelPlacement="start"
            />
            
            <AgGridReact 
                className="ag-theme-alpine" 
                rowData={currentIndices}
                domLayout="autoHeight"
                defaultColDef={defaultColDef}
                suppressFieldDotNotation={true}
            >
                <AgGridColumn field="index" cellRenderer={(params) => <IndexLinkComponent id={id} value={params.value} />}></AgGridColumn>
                <AgGridColumn field="pri.store.size"></AgGridColumn>
                <AgGridColumn field="count"></AgGridColumn>
                <AgGridColumn headerName="Total Docs" field="docs.count"></AgGridColumn>
                <AgGridColumn field="docs.deleted"></AgGridColumn>
                <AgGridColumn field="store.size"></AgGridColumn>
            </AgGridReact>
        </div>
    )
}

/**
 * helper function, used to be a link, may one day be a link again, but for now it's just a p tag
 * @param {object} object with value and id 
 * @returns a react component to show th name of the index
 */
function IndexLinkComponent({ value, id }) {
    if (!value) return 'null'
    return (
        <p>{value}</p>
    )
}

/**
 * Recreates the testing indices
 * @param {object} props
 * @param {string} props.url the url of the elasticsearch instance
 * @param {string} props.index the name of the index to recreate
 * @returns a button that recreates the testing indices
 * @example
 * <RecreateIndexButton url="http://localhost:9200" index="rni-nested" />
 */
export const RecreateTestingIndicesButton = ({ url, toggle }) => {
    async function handleClick() {
        const exist = await checkThatTestingIndicesExist(url)
        if (exist) await deleteTestingIndices(url)
        await createTestingIndices(url)
        toggle()
    }
    return (
        <Button variant="outlined" color="secondary" onClick={handleClick}>Recreate Testing Indices</Button>
    )
}

/**
 * gets the mapping for a given index
 * @param {string} url the url of the elasticsearch instance
 * @param {string} indexName the name of the index to get the mapping for
 * @returns the mapping for the given index
 * @example
 * const mapping = await getMappingForIndex('http://localhost:9200', 'rni-nested')
 */
export function getMappingForTestIndex(indexName) {
    switch (indexName) {
        case 'rni-nested':
            return rniNestedMapping
        case 'rni-nested-dobs':
            return rniNestedDobMapping
        case 'rni-flat':
            return rniFlatMapping
        default:
            return null
    }
}

/**
 * mapping for the rni-nested index
 * @type {object}
 */
export const rniNestedMapping = 
{
    "mappings" : {
        "properties" : {
            "uuid" : {
                "type" : "keyword"
            },
            "aliases" : {
                "type" : "nested",
                "properties" : {
                    "primary_name" : {
                        "type" : "rni_name"
                    }
                }
            },
            "birth_dates" : {
                "type" : "nested",
                "properties" : {
                    "birth_date" : {
                        "type" : "rni_date"
                    }
                }
            }
        }
    }
}

/**
 * mapping for the rni-nested-dobs index
 * @type {object}
 */
export const rniNestedDobMapping =
{
    "mappings" : {
        "properties" : {
            "ucn" : {
                "type" : "keyword"
            },
            "primary_name" : {
                "type" : "rni_name"
            },
            "birth_dates" : {
                "type" : "nested",
                "properties" : {
                    "birth_date" : {
                        "type" : "rni_date"
                    }
                }
            }
        }
    }
}

/**
 * mapping for the rni-flat index
 * @type {object}
 */
export const rniFlatMapping =
{
    "mappings": {
      "properties": {
        "birth_date": {
          "type": "rni_date"
        },
        "primary_name": {
          "type": "rni_name"
        },
        "ucn": {
          "type": "keyword"
        }
      }
    }
}

/**
 * verifies that an index exists
 * @param {string} url the url of the elasticsearch instance
 * @param {string} indexName the name of the index to check
 * @returns true if the index exists, false if it does not
 * @example
 * const indexExists = await checkThatIndexExists('http://localhost:9200', 'rni-nested')
 * console.log(indexExists) // true
 */
export async function checkThatIndexExists(url, indexName){
    const indexExists = await fetch(url + '/' + indexName, {timeout: 1000})
    if (indexExists.status === 404) {
        return false
    }
    return true
}

/**
 * creates the indices used for testing
 * @param {string} url the url of the elasticsearch instance
 */
export async function createTestingIndices(url){
    const indices = ['rni-nested', 'rni-nested-dobs', 'rni-flat']
    for await (const index of indices) {
        const mapping = getMappingForTestIndex(index)
        await createIndex(url, index, mapping)
    }
}

/**
 * checks that the testing indices exist
 * @param {string} url the url of the elasticsearch instance
 * @returns true if all the testing indices exist, false if one or more do not
 * @example
 * const indicesExist = await checkThatTestingIndicesExist('http://localhost:9200')
 * console.log(indicesExist) // true
 */
export async function checkThatTestingIndicesExist(url){
    const indices = ['rni-nested', 'rni-nested-dobs', 'rni-flat']
    for await (const index of indices) {
        const exists = await checkThatIndexExists(url, index)
        if (!exists) {
            return false
        }
    }
    return true
}

/**
 * deletes the testing indices
 * @param {string} url the url of the elasticsearch instance
 * @example
 * await deleteTestingIndices('http://localhost:9200')
 */
export async function deleteTestingIndices(url){
    const indices = ['rni-nested', 'rni-nested-dobs', 'rni-flat']
    for await (const index of indices) {
        await deleteIndex(url, index)
    }
}

/**
 * Button for deleting testing indices
 * @param {string} url the url of the elasticsearch instance
 * @returns a button that deletes testing indices
 * @example
 * <DeleteTestingIndicesButton url='http://localhost:9200' />
 */
export function DeleteTestingIndicesButton({ url, toggle }) {
    async function handleClick() {
        await deleteTestingIndices(url)
        toggle()
    }
    return (
        <Button variant="contained" color="error" onClick={handleClick}>Delete Testing Indices</Button>
    )
}

/**
 * Button for creating testing indices
 * @param {string} url the url of the elasticsearch instance
 * @returns a button that creates testing indices
 * @example
 * <CreateTestingIndicesButton url='http://localhost:9200' />
 */
export function CreateTestingIndicesButton({ url, toggle }) {
    async function handleClick() {
        await createTestingIndices(url)
        toggle()
    }
    return (
        <Button variant="contained" color="success" onClick={handleClick}>Create Testing Indices</Button>
    )
}

/**
 * Button to create 100 nested documents in the rni-nested index and the corresponding documents in the rni-nested-dobs and rni-flat indices
 * @param {string} url the url of the elasticsearch instance
 * @returns a button that creates 100 nested documents
 * @example
 * <Create100NestedDocumentsButton url='http://localhost:9200' />
 */
export function CreateOneHundredDocsButton({ url, toggle }){
    async function handleClick() {
        await createOneHundredDocs(url)
        toggle()
    }
    return (
        <Button variant="contained" color="success" onClick={handleClick}>Create 100 Docs</Button>
    )
}

/**
 * creates 100 nested docs and the corresponding flattened docs
 * @param {string} url the url of the elasticsearch instance
 */
export async function createOneHundredDocs(url){
    const string = await generateOneHundredBulkObjects()
    await createBulkDocsInIndex(url, string)
}

//This is a function that will have a form with 2 inputs, one for the window size and one for the number of queries to run for each index
export function AutoSearchForm({ url, urlName }){
    const [windowSize, setWindowSize] = useState(100)
    const [numQueries, setNumQueries] = useState(10)
    const [description, setDescription] = useState(getDateTimeString('simple'))
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event){
        event.preventDefault()
        setLoading(true)
        const results = await multiAutoSearch(
            url, 
            numQueries,
            description,
            urlName,
            {windowSize : windowSize}
            )
        setResults(results)
        setLoading(false)
    }

    if(loading){ return <CircularProgress /> }
    else return (
        <>
            <FormGroup style={{display : 'flex'}} row>
                <TextField
                    style={{flex : 1}}
                    label="Window Size"
                    type="number"
                    value={windowSize}
                    onChange={(event) => setWindowSize(event.target.value)}
                />
                <TextField
                    style={{flex : 1}}
                    label="Number of Queries"
                    type="number"
                    value={numQueries}
                    onChange={(event) => setNumQueries(event.target.value)}
                />
                <TextField
                    style={{flex : 3}}
                    label="Description"
                    type="text"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />
                <Button variant="contained" color="success" onClick={handleSubmit}>Auto Search</Button>
            </FormGroup>
            {results && //if there are results, make the chart available
                <ResultsComparisonChart data={results} />
            }
        </>

    )
}

export function AutoSearchButton({ url, options }){
    if (!options) {
        options = defaultOptions
    }
    async function handleClick() {
        await autoSearch(url, options)
    }
    return (
        <Button variant="contained" color="success" onClick={handleClick}>Run Queries</Button>
    )
}

AutoSearchButton.defaultProps = {
    options : defaultOptions
}