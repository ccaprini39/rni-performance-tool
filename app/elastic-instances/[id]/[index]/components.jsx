'use client'
import { Card, CardContent, Typography } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { AgGridReact, AgGridColumn } from "ag-grid-react"
import "ag-grid-community/dist/styles/ag-grid.css"
import "ag-grid-community/dist/styles/ag-theme-alpine.css"
import Link from "next/link"

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

    const defaultColDef = {
        flex: 1,
        minWidth: 150,
        resizable: true,
        sortable: true,
        filter: true,
    }

    return (
        <div>
            <AgGridReact 
                className="ag-theme-alpine" 
                rowData={indices}
                domLayout="autoHeight"
                defaultColDef={defaultColDef}
                suppressFieldDotNotation={true}
            >
                <AgGridColumn field="index" cellRenderer={(params) => <IndexLinkComponent id={id} value={params.value} />}></AgGridColumn>
                <AgGridColumn field="pri.store.size"></AgGridColumn>
                <AgGridColumn field="docs.count"></AgGridColumn>
                <AgGridColumn field="docs.deleted"></AgGridColumn>
                <AgGridColumn field="store.size"></AgGridColumn>
            </AgGridReact>
        </div>
    )
}

function IndexLinkComponent({ value, id }) {
    if (!value) return 'null'
    return (
        <Link className="mui-link" href={`/elastic-instances/${id}/${value}`}>{value}</Link>
    )
}