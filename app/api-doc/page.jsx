'use client'
import swagger from '../../public/swagger.json'
// import elastic from '../../public/elasticSwagger.json'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export default function SwaggerPage(){
    return (
        <SwaggerUI spec={swagger} />
    )
}
