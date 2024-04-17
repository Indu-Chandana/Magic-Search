import { db } from '@/db'
import { productsTable } from '@/db/schema'
import { sql } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import React from 'react'

interface pageProps {
    searchParams: {
        [key: string]: string | string[] | undefined
    }
}

const Page = async ({ searchParams }: pageProps) => {
    const query = searchParams.query

    if (Array.isArray(query) || !query) {
        return redirect('/')
    }

    // sql -> allow us to write custom sql
    // to_tsvector -> full text search
    // lower() -> convert into lower case

    // in postgress, we can not search like that -- 'bomber jacket'
    // we can do like this, --- 'bomber & jacket'

    // 'bomber & jacket' -- both needed
    // 'bomber | jacket' -- bomber or jacket
    let products = await db.select().from(productsTable).where(
        sql`to_tsvector('simple', lower(${productsTable.name} || ' ' || ${productsTable.description}))
        @@ to_tsquery('simple', lower(${query.trim().split(' ').join(' & ')}))
        `
    ).limit(3)

    return (
        <pre>{JSON.stringify(products)}</pre>
    )
}

export default Page