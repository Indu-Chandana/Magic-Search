import { db } from '@/db'
import { Product, productsTable } from '@/db/schema'
import { vectorize } from '@/lib/vectorize'
import { Index } from '@upstash/vector'
import { sql } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import React from 'react'

interface pageProps {
    searchParams: {
        [key: string]: string | string[] | undefined
    }
}

// when we getting data from vector DB doesn't contain createdAT and updatedAT. This is how say about that.
export type CoreProduct = Omit<Product, "createdAt" | "updatedAt">

const index = new Index<CoreProduct>() // hay, we know the type of metadata

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
    let products: CoreProduct[] = await db.select().from(productsTable).where(
        sql`to_tsvector('simple', lower(${productsTable.name} || ' ' || ${productsTable.description}))
        @@ to_tsquery('simple', lower(${query.trim()
                .split(' ')
                .join(' & ')
            }))
        `
    ).limit(3)

    if (products.length < 3) {
        // search products by semantic similarity
        const vector = await vectorize(query)

        const res = await index.query({
            topK: 5, // how many similar products do we want to retrieve
            vector,
            includeMetadata: true
        })
        const vectorProducts = res.filter((existingProduct) => { // why we filter ->  we can posibally get similar answers from the neonDB search
            if (
                products.some((product) => product.id === existingProduct.id) ||
                existingProduct.score < 0.9 // how similar 
            ) {
                return false
            } else {
                return true
            }
        }).map(({ metadata }) => metadata!) // we allready add types to Index, now we know, metadata type -> CoreProduct
        products.push(...vectorProducts)
    }

    return (
        <pre>{JSON.stringify(products)}</pre>
    )
}

export default Page