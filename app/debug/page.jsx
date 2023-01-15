import { getRandomDobDateObject, getRandomDobString } from "../../pages/api/dob-gen"
import { generateNumberOfDobs } from "../../pages/api/dob-number-gen"
import { getRandomName } from "../../pages/api/name-gen"
import { generateNumberOfNames } from "../../pages/api/name-number-gen"
import { getNestedIdentity } from "../../pages/api/nested-identity-gen"
'no cache'

async function loadData(){
    const nameSizes = await getArrayOfNumberOfNameLengths(100)
    const name = await getRandomName()
    const dobSizes = await getArrayOfNubmerOfDobLengths(100)
    const dob = await getRandomDobString()
    const nestedObject = await getNestedIdentity()
    return { nameSizes, name, dobSizes, dob, nestedObject }
}


export default async function DebugPage() {
    const { nameSizes, name, dobSizes, dob, nestedObject } = await loadData()
    const { average, min, max } = await getAverageMinMaxFromArrayOfNumbers(nameSizes)
    const { average: dobAverage, min: dobMin, max: dobMax } = await getAverageMinMaxFromArrayOfNumbers(dobSizes)
    return (
        <div>
            <h1>Debug</h1>
            
            <h2>Names</h2>
            <p>Avg: {average}</p>
            <p>Min: {min}</p>
            <p>Max: {max}</p>
            <p>name: {name}</p>

            <h2>DOBs</h2>
            <p>Avg: {dobAverage}</p>
            <p>Min: {dobMin}</p>
            <p>Max: {dobMax}</p>
            <p>dob: {dob}</p>

            <h2>Nested Object</h2>
            <pre>{JSON.stringify(nestedObject, undefined, 2)}</pre>

        </div>   
    )
}

/**
 * 
 * @param {int} number of names
 * @returns 
 */
export async function getArrayOfNumberOfNameLengths(number) {
    let namesSizes = []
    for await (const _ of Array(number).keys()) {
        await namesSizes.push(generateNumberOfNames())
    }
    return namesSizes
}

export async function getArrayOfNubmerOfDobLengths(number) {
    let dobSizes = []
    for await (const _ of Array(number).keys()) {
        await dobSizes.push(generateNumberOfDobs())
    }
    return dobSizes
}

/**
 * Basic sleep function used for testing and debouncing
 * @param {int} ms the number of miliseconds to sleep for
 * @returns a promise used to sleep the program
 * @example await sleep(1000) // sleep for 1 second
 */
export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 
 * @param {[]} array of numbers
 * @returns {average, min, max}
 * @example getAverageMinMaxFromArrayOfNumbers([1,2,3,4,5]) // {average: 3, min: 1, max: 5}
 */
export async function getAverageMinMaxFromArrayOfNumbers(array){
    const min = Math.min(...array)
    const max = Math.max(...array)
    let total = 0
    for await (const number of array) {
        total += number
    }

    const average = total / array.length

    return {average, min, max}
}