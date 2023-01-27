'use client'
import { Button, Collapse } from "@mui/material"
import { useState } from "react"
import { VictoryBar, VictoryLabel } from "victory"

export default function ResultsComparisonChart({ data }){
    const [open, setOpen] = useState(false)
    const toggleOpen = () => setOpen(!open)

    let chartData = processData(data)
    function getFill(dataPoint){
        return dataPoint.fill
    }

    return (
        <>
            <Button fullWidth onClick={toggleOpen}>{open ? 'Close Graph' : 'Open Graph'}</Button>
            <Collapse in={open}>
                <div style={{width: '90%', height:'100%', margin: 'auto'}}>
                    <VictoryBar 
                        data={chartData}
                        labelComponent={<VictoryLabel style={{fontSize : 8}}/>}
                        style={{data: {fill: ({datum}) => getFill(datum)}}}
                    />
                </div>
            </Collapse>
        </>
    )
}

function processData(data){
    return [
        {
            x : 1,
            y : data.nested_avg,
            fill : '#EC9C9D',
            label : 'Nested',
            index : 'rni-nested'
        },
        {
            x : 2,
            y : data.nested_dobs_avg,
            fill : '#00876C',
            label : 'Flat Names, Nested Dobs',
            index : 'rni-nested-dobs'
        },
        {
            x : 3,
            y : data.flat_avg,
            fill : '#D43D51',
            label : 'Flat',
            index : 'rni-flat'
        }
    ]
}

export function getPercentDiff(a,b){
    return 100 * Math.abs((a - b) / ((a + b) / 2))
}

export function Test({data}){
    return (
        <pre>
            {JSON.stringify(data, null, 2)}
        </pre>
    )
}