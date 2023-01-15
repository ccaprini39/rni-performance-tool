import { getRandomName } from "../../pages/api/name-gen"
import { generateNumberOfNames } from "../../pages/api/name-number-gen"
'no cache'

async function loadData(){
    const nameSizes = await getArrayOfNumberOfNames(10000)
    const name = await getRandomName()
    return { nameSizes, name }
}


export default async function DebugPage() {
    const { nameSizes, name } = await loadData()
    const { average, min, max } = await getAverageMinMaxFromArrayOfNumbers(nameSizes)
    return (
        <div>
            <h1>Debug</h1>
            
            <p>Avg: {average}</p>
            <p>Min: {min}</p>
            <p>Max: {max}</p>
            <p>name: {name}</p>

        </div>   
    )
}

/**
 * 
 * @param {int} number of names
 * @returns 
 */
export async function getArrayOfNumberOfNames(number) {
    let namesSizes = []
    for await (const _ of Array(number).keys()) {
        await namesSizes.push(generateNumberOfNames())
    }
    return namesSizes
}

async function fetchArrayOfNumberOfNames(number) {
    let namesSizes = []
    for await (const _ of Array(number).keys()) {
        const num = await fetchNum()
        await namesSizes.push(num)
    }
    return namesSizes
}

async function fetchNum(){
    const response = await fetch("http://localhost:3000/api/name-number-gen")
    const data = await response.json()
    return data.value
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