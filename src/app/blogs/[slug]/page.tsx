import SingleBlogDisplay from '@/components/SingleBlogDisplayPage'
import React from 'react'

type PageProps = {
  params: { slug: string }
}

function Page({ params }: PageProps) {
  return (
    <div>
        <SingleBlogDisplay slug={params.slug} />
    </div>
  )
}

export default Page