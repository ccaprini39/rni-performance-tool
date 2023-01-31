'use client'

import { Refresh } from "@mui/icons-material"
import { IconButton, Typography } from "@mui/material"
import Cookies from "js-cookie"
import { useEffect, useState } from "react"
import LoadingComponent from "../../../../components/LoadingComponent"
import { sleep } from "../../../../pages/api/create-search-object"
import { filterHiddenIndices, getNonHiddenIndices, getPreviousTests } from "../../../../pages/api/fetch-previous-tests"
import IndexTable, { AutoSearchForm, checkThatTestingIndicesExist, DeleteTestingIndicesButton, RecreateTestingIndicesButton } from "../components"
import { CreateDocsForm, getAvailableUrlById, headerStyle } from "../page"
import { PreviousTestsTable } from "./previous-tests-components"

export default function PreviousTestsPage({params}){

    const [pageUrl, setPageUrl] = useState(null)
    const [name, setName] = useState(null)
    const [loading, setLoading] = useState(true)
    const [tests, setTests] = useState([])
    const [value, setValue] = useState(0)
    const toggleValue = () => setValue(value === 0 ? 1 : 0)
    const [testingIndiciesExist, setTestingIndiciesExist] = useState(false)
    const [indices, setIndices] = useState([])

    useEffect(() => {
        async function loadTests(){
            setLoading(true)
            const {url, name} = await getAvailableUrlById(params.id)
            setTestingIndiciesExist(await checkThatTestingIndicesExist(url))
            setPageUrl(url)
            setName(name)
            setIndices(await getNonHiddenIndices(url))
            const cookiesUrl = await Cookies.get('adminElasticUrl')
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
                    <h3>Instance Url: {pageUrl}</h3>
                    <IconButton size="large" color="success" onClick={toggleValue}>
                        <Refresh />
                    </IconButton>
                </div>
            </span>
            <CreateDocsForm toggle={toggleValue} url={pageUrl} />
            <br />
            <IndexTable indices={indices} id={params.id} />
            <br />
            {testingIndiciesExist ?
                //the indices exist
                <>
                    <span>
                        <AutoSearchForm toggle={toggleValue} url={pageUrl} urlName={name} /> 
                    </span>
                    <br />
                    <span>
                        <DeleteTestingIndicesButton toggle={toggleValue} url={pageUrl} />
                        <RecreateTestingIndicesButton toggle={toggleValue} url={pageUrl} />
                    </span>
                </>
                :
                <>
                    <CreateTestingIndicesButton toggle={toggleValue} url={pageUrl} />
                </>
            }
            <br />
            <Typography variant="h4">Previous Tests</Typography>
            <PreviousTestsTable data={tests} toggle={toggleValue} />
        </div>
    )
}