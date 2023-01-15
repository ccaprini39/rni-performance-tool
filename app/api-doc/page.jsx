'use client'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'
import { swaggerJson } from '../../pages/api/doc'

export default function SwaggerPage(){

    return (
        <SwaggerUI spec={swaggerJson} />
    )
}
