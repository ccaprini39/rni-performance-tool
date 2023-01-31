'use client'

import { AgGridReact, AgGridColumn } from "ag-grid-react"
import "ag-grid-community/dist/styles/ag-grid.css"
import "ag-grid-community/dist/styles/ag-theme-alpine.css"
import { useState } from "react"
import { Button } from "@mui/material"
import { deletePreviousTestById, sleep } from "../../../pages/api/create-search-object"
import ResultsComparisonChart from "../../../pages/shared-components/ResultsComparisonGraph"

export function PreviousTestsTable({ data, toggle }){

    const [selectedResult, setSelectedResult] = useState(data[0])
    const [chartOpen, setChartOpen] = useState(true)

    const defaultColDef = {
        flex: 1,
        minWidth: 150,
        resizable: true,
        sortable: true,
        filter: true,
    }

    function handleRowClick(params){
        setSelectedResult(params.data)
        setChartOpen(true)
    }

    function DeleteButton({id}){
        async function handleDelete(){
            await deletePreviousTestById(id)
            await sleep(1000)
            toggle()
        }
        return (
            <Button size="small" variant="outlined" color='error' onClick={handleDelete}>Delete</Button>
        )
    }

    return (
        <>
            <AgGridReact 
                className="ag-theme-alpine" 
                onRowClicked={handleRowClick}
                rowData={data}
                domLayout="autoHeight"
                defaultColDef={defaultColDef}
                suppressFieldDotNotation={true}
            >
                <AgGridColumn field="description" headerName="Description" flex={2} />
                <AgGridColumn field="nestedIndexCount" headerName="Nested Docs" />
                <AgGridColumn field="nestedDobsIndexCount" headerName="Nested Dob Docs" />
                <AgGridColumn field="flatIndexCount" headerName="Flat Docs" />
                <AgGridColumn field="nested_avg" headerName="Nested Avg (ms)" flex={2} />
                <AgGridColumn field="nested_dobs_avg" headerName="Nested Dob Avg (ms)" flex={2} />
                <AgGridColumn field="flat_avg" headerName="Flat Avg (ms)" flex={2} />
                <AgGridColumn field="window" headerName="Window Size" flex={2} />
                <AgGridColumn field="numberOfQueries" headerName="Number of Queries" flex={2} />
                <AgGridColumn field='id' headerName='Delete' flex={1} cellRenderer={(params) => <DeleteButton id={params.value} /> } />
            </AgGridReact>
            {chartOpen && <ResultsComparisonChart data={selectedResult} />}
        </>

    )
}



const sampleData = [
    {
        description : "A Test",
        flatIndexCount : 925883,
        flatTooks : [584, 423, 398, 371, 158, 509, 429, 552, 394, 158],
        flat_avg : 397.6,
        flat_max : 584,
        flat_min : 158,
        nestedDobsIndexCount : 433990,
        nestedDobsTooks : [223, 141, 148, 133, 50, 177, 133, 210, 128, 44],
        nestedIndexCount : 99192,
        nestedTooks: [286, 238, 269, 194, 182, 249, 224, 267, 220, 217],
        nested_avg : 234.6,
        nested_dobs_avg : 138.7,
        nested_dobs_max : 223,
        nested_dobs_min : 44,
        nested_max : 286,
        nested_min : 182,
        numberOfQueries : 10,
        timeExecuted : "Mon Jan 30 2023(5:41:09 AM)",
        url : "http://ec2-18-216-150-137.us-east-2.compute.amazonaws.com:9200",
        urlName : "Demo Elastic Instance"
    }
]