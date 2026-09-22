import {pgTable, text , integer, serial, timestamp, boolean, uuid, jsonb} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";

export type OrderStatus = "pending" | "paid" | "failed"
export type UserRole = "customer" | "admin" | "support"



export type CheckoutSessionLine = {
    productId: string,
    quantity: number,
    unitPriceCents: number,
}



export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: text("clerk_user_id").notNull().unique(),
    name: text("name"),
    email: text("email").notNull().unique(),
    role: text("role").$type<UserRole>().notNull().default("customer"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const products = pgTable("products", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),   
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    priceCents: integer("price").notNull(),
    category: text("category").notNull(),
    currency: text("currency").notNull().default("USD"),
    imageUrl: text("image_url").notNull(),
    imageKitFileId: text("imagekit_file_id").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})


// cascade delete checkout sessions when a user is deleted restrict dont delete a user if they have checkout sessions
export const checkoutSessions = pgTable("checkout_sessions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, {onDelete: "cascade"}),
    polarCheckoutId: text("polar_checkout_id").notNull().unique(),
    status: text("status").$type<OrderStatus>().notNull().default("pending"),
    lines: jsonb("lines").$type<CheckoutSessionLine[]>().notNull(),
    totalCents: integer("total_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})


export const orders = pgTable("orders", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, {onDelete: "cascade"}),
    status: text("status").$type<OrderStatus>().notNull().default("pending"),
    polarCheckoutId: text("polar_checkout_id").notNull().unique(),
    totalCents: integer("total_cents").notNull(),
    polarOrderId: text("polar_order_id").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const orderItems = pgTable("order_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull().references(() => orders.id, {onDelete: "cascade"}),
    productId: uuid("product_id").notNull().references(() => products.id, {onDelete: "restrict"}),
    quantity: integer("quantity").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})


// a user can have many orders and many checkout sessions
export const userRelations = relations(users, ({many}) => ({
    orders: many(orders),
}))

export const productRelations = relations(products, ({many}) => ({
    orderItems: many(orderItems),
}))

export const orderRelations = relations(orders, ({many, one}) => ({
    user: one(users, {
        fields: [orders.userId],
        references: [users.id],
    }),
    items: many(orderItems),
}))

export const orderItemRelations = relations(orderItems, ({one}) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
    product: one(products, {
        fields: [orderItems.productId],
        references: [products.id],
    }),
}))