// Defines whitch kind of data structures live in our database
import { doublePrecision, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const productsTable = pgTable("products", {
    id: text("id").primaryKey().default('uuid_generate_v4()'), // this generate id automatically
    name: text("name").notNull(),
    imageId: text("imageId").notNull(),
    price: doublePrecision("price").notNull(),  // floating point num
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
})

export type Product = typeof productsTable.$inferSelect