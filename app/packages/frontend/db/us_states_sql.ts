import { Sql } from "postgres";

export const listUSStatesQuery = `-- name: ListUSStates :many
SELECT id, name, createdat, updatedat
FROM us_states`;

export interface ListUSStatesRow {
    id: number;
    name: string | null;
    createdat: Date | null;
    updatedat: Date | null;
}

export async function listUSStates(sql: Sql): Promise<ListUSStatesRow[]> {
    return (await sql.unsafe(listUSStatesQuery, []).values()).map(row => ({
        id: row[0],
        name: row[1],
        createdat: row[2],
        updatedat: row[3]
    }));
}

export const getUSStateQuery = `-- name: GetUSState :one
SELECT id, name, createdat, updatedat
FROM us_states
WHERE id = $1`;

export interface GetUSStateArgs {
    id: number;
}

export interface GetUSStateRow {
    id: number;
    name: string | null;
    createdat: Date | null;
    updatedat: Date | null;
}

export async function getUSState(sql: Sql, args: GetUSStateArgs): Promise<GetUSStateRow | null> {
    const rows = await sql.unsafe(getUSStateQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        name: row[1],
        createdat: row[2],
        updatedat: row[3]
    };
}

export const createUSStateQuery = `-- name: CreateUSState :one
INSERT INTO us_states (name)
VALUES ($1)
RETURNING id, name, createdat, updatedat`;

export interface CreateUSStateArgs {
    name: string | null;
}

export interface CreateUSStateRow {
    id: number;
    name: string | null;
    createdat: Date | null;
    updatedat: Date | null;
}

export async function createUSState(sql: Sql, args: CreateUSStateArgs): Promise<CreateUSStateRow | null> {
    const rows = await sql.unsafe(createUSStateQuery, [args.name]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        name: row[1],
        createdat: row[2],
        updatedat: row[3]
    };
}

