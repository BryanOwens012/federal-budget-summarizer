import { Sql } from "postgres";

export const listProductsQuery = `-- name: ListProducts :many
SELECT id, name, pricecents, createdat, updatedat
FROM products`;

export interface ListProductsRow {
    id: number;
    name: string;
    pricecents: number | null;
    createdat: Date | null;
    updatedat: Date | null;
}

export async function listProducts(sql: Sql): Promise<ListProductsRow[]> {
    return (await sql.unsafe(listProductsQuery, []).values()).map(row => ({
        id: row[0],
        name: row[1],
        pricecents: row[2],
        createdat: row[3],
        updatedat: row[4]
    }));
}

export const getProductQuery = `-- name: GetProduct :one
SELECT id, name, pricecents, createdat, updatedat
FROM products
WHERE id = $1`;

export interface GetProductArgs {
    id: number;
}

export interface GetProductRow {
    id: number;
    name: string;
    pricecents: number | null;
    createdat: Date | null;
    updatedat: Date | null;
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
        pricecents: row[2],
        createdat: row[3],
        updatedat: row[4]
    };
}

export const createProductQuery = `-- name: CreateProduct :one
INSERT INTO products (name, pricecents)
VALUES ($1, $2)
RETURNING id, name, pricecents, createdat, updatedat`;

export interface CreateProductArgs {
    name: string;
    pricecents: number | null;
}

export interface CreateProductRow {
    id: number;
    name: string;
    pricecents: number | null;
    createdat: Date | null;
    updatedat: Date | null;
}

export async function createProduct(sql: Sql, args: CreateProductArgs): Promise<CreateProductRow | null> {
    const rows = await sql.unsafe(createProductQuery, [args.name, args.pricecents]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        name: row[1],
        pricecents: row[2],
        createdat: row[3],
        updatedat: row[4]
    };
}

