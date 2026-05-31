import { relations } from "drizzle-orm";
import { jsonb } from "drizzle-orm/pg-core";
import { boolean, integer, timestamp, text, pgTable, uuid } from "drizzle-orm/pg-core";

export type OrderStatus = "pending" | "paid" | "failed";
export type UserRole = "customer" | "support" | "admin";
export type CheckOutSessionLine  = {
    produtId : string,
    quantity  : number,
    unitPriceCents : number
}

export const users = pgTable("users",{
    id : uuid("id").defaultRandom().primaryKey(),
    clerkUserId : text("clerk_user_id").notNull().unique(),
    email : text("email").notNull().default(""),
    displayName : text("display-name"),
    role : text("role").$type<UserRole>().notNull().default("customer"),
    createdAt : timestamp("created-at",{withTimezone : true}).defaultNow().notNull(),
    updatedAt : timestamp("updated-at",{withTimezone : true}).defaultNow().notNull()
}) 


export const products = pgTable("products",{
    id : uuid("id").defaultRandom().primaryKey(),
    slug : text("slug").unique().notNull(),
    name : text("name").notNull(),
    category : text("category").notNull().default("General"),
    description : text("description").notNull().default(""),
    priceCents : integer("price_cents").notNull(),
    currency : text("currency").notNull().default("inr"),
    imageUrl : text("image-url"),
    // image 'fileId' for delete
    imageKitFileId : text("image_kit_file_id"),
    active : boolean("active").notNull().default(true),
    createdAt : timestamp("created-at",{withTimezone : true}).defaultNow().notNull(),
})

export const checkoutSessions = pgTable("checkout_sessions",{
    id : uuid("id").defaultRandom().primaryKey(),
    userId  : uuid("user_id").notNull().references(()=>users.id,{onDelete : "cascade"}) ,
    polarCheckoutId : text("polar_checkout_id").unique(),
    lines: jsonb("lines").$type<CheckOutSessionLine[]>().notNull(),
    totalCents : integer("total_cents").notNull(),
    currency : text("currency").notNull(),
    createdAt : timestamp("created-at",{withTimezone : true}).defaultNow().notNull(),
})

export const orders = pgTable("orders",{
    id : uuid("id").defaultRandom().primaryKey(),
    userId  : uuid("user_id").notNull().references(()=>users.id,{onDelete : "cascade"}),
    status : text("status").$type<(OrderStatus)>().notNull().default("pending"),
    polarCheckoutId :text("polar_checkout_id"),
    polarOrderId : text("polar_order_id").unique(),
    totalCents : integer("total_cents").notNull().default(0),
    createdAt : timestamp("created-at",{withTimezone : true}).defaultNow().notNull(),
    updatedAt : timestamp("updated-at",{withTimezone : true}).defaultNow().notNull()
})

export const orderItems = pgTable("order_items",{
    id : uuid("id").defaultRandom().primaryKey(),
    orderId  : uuid("order_id").notNull().references(()=>orders.id,{onDelete : "cascade"}),
    productId  : uuid("product_id").notNull().references(()=>products.id,{onDelete : "restrict"}),
    quantity : integer("quantity").notNull(),
    unitPriceCents : integer("unit_price_cents").notNull()
})

//cacade - "delete children when parent is deleted
// restrict = dont delete the parent if any child still points at it"


// a user can have many orders over time
export const userRelation = relations(users,({many})=>({
    orders : many(orders)
}))

// the same product can show up on many order lines
export const productsRelations = relations(products,({many})=>({
    orderItems : many(orderItems)
}))


// each order belongs to exactly one user; each order can have many line items.
export const ordersRelations = relations(orders, ({ one, many }) => ({
    user: one(users, { fields: [orders.userId], references: [users.id] }),
    items: many(orderItems),
  }));
  
  // each line item is for exactly one order and one product
  export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
    product: one(products, { fields: [orderItems.productId], references: [products.id] }),
  }));