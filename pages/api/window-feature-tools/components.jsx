'use client'

import { Card, CardContent, Typography } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"

export function IndexInfo({indexInfo}){
    const {count, size, index} = indexInfo
    return (
        <div style={{backgroundColor: 'lightgrey', padding: '1vw'}}>
            <h2>Index Info API</h2>
            <Grid2 container spacing={2}>
                <Grid2 xs={4}>
                    <SimpleInfoCard title="index" body={index} />
                </Grid2>
                <Grid2 xs={4}>
                    <SimpleInfoCard title="count" body={count} />
                </Grid2>
                <Grid2 xs={4}>
                    <SimpleInfoCard title="size" body={size} />
                </Grid2>

            </Grid2>
        </div>
    )
}

function SimpleInfoCard({title, body, color}){
    if(title === null || title === undefined) title = 'Simple Card'
    if(body === null || title === undefined) body = 'This is a simple card'
    if(color === null || color === undefined) color = 'black'
    return (
        <Card sx={{ minWidth: 200 }}>
            <CardContent>
                <Typography sx={{ fontSize: 14}} variant="h5" component="h2">
                    {title}
                </Typography>
                <Typography color={color} variant="h5" component="div">
                    {body}
                </Typography>
            </CardContent>
        </Card>
    )
}