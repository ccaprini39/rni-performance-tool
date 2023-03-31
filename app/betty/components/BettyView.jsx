'use client'
import { MantineProvider, Tabs } from '@mantine/core'
import Cookies from 'js-cookie';
import { useState } from 'react';
import { betty, flatBetty, nestedDobBetty } from '../../../pages/api/betty';
import BettyTable from './BettyTable';

export default function BettyView({bettyInfo}) {
    //Cookies.set('adminElasticUrl', 'http://ec2-18-118-18-194.us-east-2.compute.amazonaws.com:9200')
    //bettyInfo is an array of objects that have the following properties:
    //  - index: string
    //  - es_count: number
    //  - total_count: number
    //  - innerHitsLength: number
    //  - innerHits: array of objects
    //      - _index: string
    //      - _type: string
    //      - _id: string
    //      - _score: number
    //      - _source: object

    const [activeTab, setActiveTab] = useState('all');
    const reducedBettyInfo = bettyInfo.map(index => {
        return {
            index: index.index,
            total_count: index.total_count,
            es_count: index.es_count,
            innerHitsLength: index.innerHitsLength,
        }
    })
    
    return (
        <div>
            <MantineProvider withNormalizeCSS withGlobalStyles>
                <Tabs value={activeTab} onTabChange={setActiveTab}>
                    <Tabs.List>
                        <Tabs.Tab value="all">
                            <h3>All</h3>
                        </Tabs.Tab>
                        {bettyInfo.map((index, i) => (
                            <Tabs.Tab key={i} value={index.index}>
                                <h3>{index.index}</h3>
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>
                    <Tabs.Panel value="all">
                        <BettyTable data={reducedBettyInfo}/>
                        <div
                            style={{
                                display : 'flex',
                                flexDirection : 'row',
                                justifyContent : 'space-between',
                            }} 
                        >
                            <pre>{JSON.stringify(betty, null, 2)}</pre>
                            <pre>{JSON.stringify(nestedDobBetty, null, 2)}</pre>
                            <pre>{JSON.stringify(flatBetty, null, 2)}</pre>
                        </div>
                    </Tabs.Panel>
                    {bettyInfo.map((index, i) => (
                        <TabContent key={i} object={index} value={index.index}/>
                    ))}
                </Tabs>
            </MantineProvider>
        </div>
    )
}

function TabContent({object, value}) {
    const { total_count, es_count, innerHitsLength, innerHits } = object
    return (
        <Tabs.Panel value={value}>
            <h2>Total Internal Count: {total_count}</h2>
            <h2>ES Count: {es_count}</h2>
            <h2>Inner Hits Length: {innerHitsLength}</h2>
            <BettyTable data={innerHits}/>
        </Tabs.Panel>
    )
}

function AllDataView({data, index}){
    const { es_count, total_count, innerHitsLength } = data
    const reducedData = { index: index, total_count, es_count, innerHitsLength}
    return (
        <pre>{JSON.stringify(reducedData, null, 2)}</pre>
    )
}
