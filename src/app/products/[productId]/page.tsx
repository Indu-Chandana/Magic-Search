import { db } from "@/db"
import { productsTable } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"

interface PageProps {
    params: {
        productId: string // This param need to be exaclty same folder name [productId]
    }
}

const Page = async ({ params }: PageProps) => {
    const { productId } = params

    if (!productId) return notFound()
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId))

    if (!product) return notFound()
}

export default Page