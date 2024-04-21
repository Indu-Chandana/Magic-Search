import { db } from '@/db'
import { Product, productsTable } from '@/db/schema'
import { vectorize } from '@/lib/vectorize'
import { Index } from '@upstash/vector'
import { sql } from 'drizzle-orm'
import { X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
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

    if (products.length === 0) {
        return (
            <div className='text-center py-4 bg-white shadow-sm rounded-b-md'>
                <X className='mx-auto h-8 w-8 text-gray-800' />
                <h3 className='mt-2 text-sm font-semibold text-gray-900'>
                    No results
                </h3>
                <p className='mt-1 text-sm mx-auto max-w-prose text-gray-500'>
                    Sorry, we couldn't find any matches for {' '}
                    <span className='text-green-600 font-medium'>{query}</span>
                </p>
            </div>
        )
    }

    if (products.length < 3) {
        console.log('trying sementic search')
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
        console.log('vectorProducts ::', vectorProducts)

        // vectorProducts :: [
        //   {
        //     id: '13',
        //     name: 'Light Jeans Jacket 1',
        //     description: 'A casual classic, this light denim jacket adds a layer of cool to any outfit, perfect for those crisp, sunny days.',
        //     price: 67,
        //     imageId: 'light_jeans_jacket_1.png'
        //   },]

        products.push(...vectorProducts)
    }

    return (
        <ul className='py-4 divide-y divide-zinc-100 bg-white shadow-md rounded-b-md'>
            {products.slice(0, 3).map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                    <li className='mx-auto py-4 px-8 flex space-x-4'>
                        {/* Image section */}
                        <div className='relative flex items-center bg-zinc-100 rounded-lg h-40 w-40'>
                            <Image
                                loading='eager'
                                fill
                                alt='product-image'
                                src={`/${product.imageId}`} // images stored at public folder
                            />
                        </div>
                        {/* product dettails */}
                        <div className='w-full flex-1 space-y-2 py-1'>
                            <h1 className='text-lg font-medium text-gray-900'>
                                {product.name}
                            </h1>
                            <p className='prose prose-sm text-gray-500 line-clamp-3'>
                                {product.description}
                            </p>
                            <p className='text-base font-medium text-gray-900'>
                                ${product.price.toFixed(2)}
                            </p>
                        </div>
                    </li>
                </Link>
            ))}
        </ul>
    )
}

export default Page