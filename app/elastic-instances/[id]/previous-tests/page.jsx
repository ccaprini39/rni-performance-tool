'use client'

import { Refresh } from "@mui/icons-material"
import { IconButton } from "@mui/material"
import Cookies from "js-cookie"
import { useEffect, useState } from "react"
import LoadingComponent from "../../../../components/LoadingComponent"
import { sleep } from "../../../../pages/api/create-search-object"
import { getPreviousTests } from "../../../../pages/api/fetch-previous-tests"
import { AutoSearchForm, checkThatTestingIndicesExist, DeleteTestingIndicesButton, RecreateTestingIndicesButton } from "../components"
import { CreateDocsForm, getAvailableUrlById, headerStyle } from "../page"
import { PreviousTestsTable } from "./previous-tests-components"

export default function PreviousTestsPage({params}){

    const [url, setUrl] = useState(null)
    const [name, setName] = useState(null)
    const [loading, setLoading] = useState(true)
    const [tests, setTests] = useState([])
    const [value, setValue] = useState(0)
    const toggleValue = () => setValue(value === 0 ? 1 : 0)
    const [testingIndiciesExist, setTestingIndiciesExist] = useState(false)

    useEffect(() => {
        async function loadTests(){
            setLoading(true)
            const {url, name} = await getAvailableUrlById(params.id)
            setTestingIndiciesExist(await checkThatTestingIndicesExist(url))
            setUrl(url)
            setName(name)
            const cookiesUrl = await Cookies.get('adminElasticUrl')
            console.log(cookiesUrl)
            const tests = await getPreviousTests(cookiesUrl, url)
            setTests(tests)
            sleep(500)
            setLoading(false)
        }
        loadTests()
    },[value])


    if(loading) return <LoadingComponent />
    else return (
        <div>
            <span>
                <div style={headerStyle}>
                    <h1>{name}</h1>
                    <h3>Instance Url: {url}</h3>
                    <IconButton size="large" color="success" onClick={toggleValue}>
                        <Refresh />
                    </IconButton>
                </div>
            </span>

            {testingIndiciesExist ?
                //the indices exist
                <>
                    <span>
                        <CreateDocsForm toggle={toggleValue} url={url} />
                        <br />
                    </span>
                    <span>
                        <AutoSearchForm toggle={toggleValue} url={url} urlName={name} /> 
                    </span>
                    <br />
                    <span>
                        <DeleteTestingIndicesButton toggle={toggleValue} url={url} />
                        <RecreateTestingIndicesButton toggle={toggleValue} url={url} />
                    </span>
                </>
                :
                <>
                    <CreateTestingIndicesButton toggle={toggleValue} url={url} />
                </>
            }
            <br />
            <h4>Tests</h4>
            <PreviousTestsTable data={tests} toggle={toggleValue} />
        </div>
    )
}