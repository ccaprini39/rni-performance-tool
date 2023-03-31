'use client'

import { AgGridColumn, AgGridReact } from "ag-grid-react"

export default function BettyTable({data}){
    const keys = Object.keys(data[0])

    const defaultColDef = {
        flex: 1,
        minWidth: 150,
        resizable: true,
        sortable: true,
        filter: true,
    }

    function ViewData({value}){
        return (
            <pre>{JSON.stringify(value, null, 2)}</pre>
        )
    }

    return(
        <div>
            <AgGridReact
                className="ag-theme-alpine" 
                rowData={data}
                domLayout="autoHeight"
                defaultColDef={defaultColDef}
            >
                {keys.map((key, i) => (
                    <AgGridColumn 
                        key={i} 
                        field={key} 
                        headerName={key}
                        autoHeight={true}
                        cellRenderer={(params) => ViewData({value: params.value})}
                    />
                ))}
            </AgGridReact>
        </div>
    )
}