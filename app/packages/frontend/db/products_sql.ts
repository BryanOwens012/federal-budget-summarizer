import { Sql } from "postgres";

export const listProductsQuery = `-- name: ListProducts :many
SELECT id, name, price_cents, created_at, updated_at
FROM products`;

export interface ListProductsRow {
    id: number;
    name: string;
    priceCents: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export async function listProducts(sql: Sql): Promise<ListProductsRow[]> {
    return (await sql.unsafe(listProductsQuery, []).values()).map(row => ({
        id: row[0],
        name: row[1],
        priceCents: row[2],
        createdAt: row[3],
        updatedAt: row[4]
    }));
}

export const getProductQuery = `-- name: GetProduct :one
SELECT id, name, price_cents, created_at, updated_at
FROM products
WHERE id = $1`;

export interface GetProductArgs {
    id: number;
}

export interface GetProductRow {
    id: number;
    name: string;
    priceCents: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export async function getProduct(sql: Sql, args: GetProductArgs): Promise<GetProductRow | null> {
    const rows = await sql.unsafe(getProductQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        name: row[1],
        priceCents: row[2],
        createdAt: row[3],
        updatedAt: row[4]
    };
}

export const createProductQuery = `-- name: CreateProduct :one
INSERT INTO products (name, price_cents)
VALUES ($1, $2)
RETURNING id, name, price_cents, created_at, updated_at`;

export interface CreateProductArgs {
    name: string;
    priceCents: string | null;
}

export interface CreateProductRow {
    id: number;
    name: string;
    priceCents: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export async function createProduct(sql: Sql, args: CreateProductArgs): Promise<CreateProductRow | null> {
    const rows = await sql.unsafe(createProductQuery, [args.name, args.priceCents]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        name: row[1],
        priceCents: row[2],
        createdAt: row[3],
        updatedAt: row[4]
    };
}

