'use client'
import { VictoryBar, VictoryLabel } from "victory"

export default function ResultsComparisonChart({ data }){
    let chartData = processData(data)
    function getFill(dataPoint){
        return dataPoint.fill
    }

    return (
        <div style={{width: '90%', height:'100%', margin: 'auto'}}>
            <VictoryBar 
                data={chartData}
                cornerRadius={5}
                labelComponent={<VictoryLabel style={{fontSize : 8}}/>}
                style={{data: {fill: ({datum}) => getFill(datum)}}}
            />
        </div>
    )
}

function processData(data){
    const { nested_avg, nested_dobs_avg, flat_avg } = data
    const { nested_avg_string, nested_dobs_avg_string, flat_avg_string } = getPercentDiffStrings(data)

    return [
        {
            x : 1,
            y : data.nested_avg,
            fill : '#EC9C9D',
            label : 'Nested' + '\n' + 
                data.nestedIndexCount + ' docs' + '\n' +
                nested_avg + 'ms' + '\n' +
                nested_avg_string,
            index : 'rni-nested'
        },
        {
            x : 2,
            y : data.nested_dobs_avg,
            fill : '#00876C',
            label : 'Flat Names, Nested Dobs' + '\n' +
                data.nestedDobsIndexCount + ' docs' + '\n' +
                nested_dobs_avg + 'ms' + '\n' +
                nested_dobs_avg_string,
            index : 'rni-nested-dobs'
        },
        {
            x : 3,
            y : data.flat_avg,
            fill : '#D43D51',
            label : 'Flat' + '\n' +
                data.flatIndexCount + ' docs' + '\n' +
                flat_avg + 'ms' + '\n' +
                flat_avg_string,
            index : 'rni-flat'
        }
    ]
}

/**
 * finds the percent difference between two numbers
 * @param {number} a first number to compare
 * @param {number} b second number to compare
 * @returns the percent difference between a and b
 */
export function getPercentDiff(a,b){
    return 100 * Math.abs((a - b) / ((a + b) / 2))
}

/**
 * Finds the percent difference between the fastest and the other two and returns a string for each for th e
 * @param {object} data
 * @param {number} data.nested_avg
 * @param {number} data.nested_dobs_avg
 * @param {number} data.flat_avg
 * @returns {object} object with the percent difference between the fastest and the other two
 * @returns {string} object.nested_avg_string
 * @returns {string} object.nested_dobs_avg_string
 * @returns {string} object.flat_avg_string
 */
export function getPercentDiffStrings({nested_avg, nested_dobs_avg, flat_avg}){
    const fastest = Math.min(nested_avg, nested_dobs_avg, flat_avg)

    let result = {
        nested_avg_string : getPercentDiff(nested_avg, fastest).toFixed(2) + '%',
        nested_dobs_avg_string : getPercentDiff(nested_dobs_avg, fastest).toFixed(2) + '%',
        flat_avg_string : getPercentDiff(flat_avg, fastest).toFixed(2) + '%'
    }
    //now I need to find the one that is the fastest and make it say 'fastest'
    if(nested_avg === fastest){
        result.nested_avg_string = 'fastest'
    } else {
        result.nested_avg_string += 'slower'
    }
    if(nested_dobs_avg === fastest){
        result.nested_dobs_avg_string = 'fastest'
    } else {
        result.nested_dobs_avg_string += 'slower'
    }
    if(flat_avg === fastest){
        result.flat_avg_string = 'fastest'
    } else {
        result.flat_avg_string += 'slower'
    }
    return result
}
