'use client'
import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'
import { createSwaggerSpec } from 'next-swagger-doc'

const SwaggerUI = dynamic({
  loader: () => import('swagger-ui-react'),
})

export default function ApiDoc({ spec }) {
  return <SwaggerUI spec={spec} />
}

export const getStaticProps = async () => {
  const spec = createSwaggerSpec({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Next Swagger API Example',
        version: '1.0',
      },
    },
  })

  return {
    props: {
      spec,
    },
  }
}
