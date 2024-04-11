import { redirect } from 'next/navigation'
import React from 'react'

interface pageProps {
    searchParams: {
        [key: string]: string | string[] | undefined
    }
}

const Page = ({ searchParams }: pageProps) => {
    const query = searchParams.query

    if (Array.isArray(query) || !query) {
        return redirect('/')
    }

    return (
        <div>Page</div>
    )
}

export default Page