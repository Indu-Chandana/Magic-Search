import type { Config } from "drizzle-kit"
import * as dotenv from "dotenv"

dotenv.config({
    path: ".env"
})

export default {
    driver: 'pg',
    schema: './src/db/schema.ts', // where the schema file lived in
    dbCredentials: {
        connectionString: process.env.DATABASE_URL!,
    },
    out: './drizzle' // migrations from SQL and so on. we are not use that actually
} satisfies Config