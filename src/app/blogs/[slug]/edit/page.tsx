import EditBlogPage from '@/components/EditPage'
import React from 'react'

function Page({ params }: { params: { slug: string } }) {
  return (
    <div>
        <EditBlogPage params={params}/>
    </div>
  )
}

export default Page