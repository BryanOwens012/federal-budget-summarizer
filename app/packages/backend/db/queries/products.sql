-- name: ListProducts :many
SELECT *
FROM products;
-- name: GetProduct :one
SELECT *
FROM products
WHERE id = $1;
-- name: CreateProduct :one
INSERT INTO products (name, pricecents)
VALUES ($1, $2)
RETURNING *;