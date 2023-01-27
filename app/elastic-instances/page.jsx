'use client'
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import LoadingComponent from "../../components/LoadingComponent";
import { getAvailableElasticUrls, sleep } from "../../pages/api/create-search-object";
import AdminUrl from "./components/AdminUrl";
import UrlList from "./components/UrlList";

//this is a react component that will check to see if the database url is set in the cookies
//if it is, it will display the list of elastic instances from the index 'available-urls'
//if it is not, it will display the AdminUrl component
//the AdminUrl component will allow the user to set the database url in the cookies


export default function ElasticInstances({}) {
    const [cookiesUrl, setCookiesUrl] = useState(false)
    const [instances, setInstances] = useState([])
    const [loading, setLoading] = useState(true)
    const [value, setValue] = useState(0)
    const toggleValue = () => value === 0 ? setValue(1) : setValue(0)

    useEffect(() => {
        async function loadElasticInstances(){
            setLoading(true)
            await sleep(1000)
            const cookiesUrl = await Cookies.get('adminElasticUrl')
            if(!cookiesUrl){
                setCookiesUrl(false)
                setInstances([])
                setLoading(false)
                return
            }
            const instances = await getAvailableElasticUrls()
            setCookiesUrl(cookiesUrl)
            setInstances(instances)
            setLoading(false)
        }
        loadElasticInstances()
    },[value])

    if(loading) return <LoadingComponent />
    else return (
        <div>
            <h1>Elastic Instances</h1>
            {cookiesUrl ? 
                <>
                    <h3>Admin Url: {cookiesUrl}</h3>
                    <UrlList urlObjects={instances} toggle={toggleValue}/>
                </>
                : 
                <>
                    <AdminUrl toggle={toggleValue} />
                    <AdminInstructionsNoCookie />
                </>
            }
        </div>
    )

}



function AdminInstructionsNoCookie(){
    return (
        <div>
            <h3>Admin Instructions</h3>
            <p>You have not yet configured a url</p>
            <p>This application uses an instance of elasticsearch as a database</p>
            <p>Once a valid url is provided, the indexes it needs will be created in that instance</p>
            <p>Set the admin url in the cookies by entering the url in the input field above.</p>
            <p>Once the admin url is set, you can add and remove elastic instances from the list.</p>
        </div>
    )
}

