'use client'

import { useEffect, useState } from "react"
import LoadingComponent from "../../components/LoadingComponent"
import { getArrayOfNumberOfNames, getAverageMinMaxFromArrayOfNumbers } from "./page"

export default function Client({number}){
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData(){
            const start = performance.now()
            const nameSizes = await getArrayOfNumberOfNames(number)
            const end = performance.now()
            const time = end - start
            const { average, min, max } = await getAverageMinMaxFromArrayOfNumbers(nameSizes)
            setData({ average, min, max, time })
            setLoading(false)
        }
        loadData()
    },[])
    if (loading) return <LoadingComponent />
    return (
        <div>
            <h1>Client</h1>
            <p>Avg: {data.average}</p>
            <p>Min: {data.min}</p>
            <p>Max: {data.max}</p>
            <p>time: {data.time}</p>
        </div>

    )
}