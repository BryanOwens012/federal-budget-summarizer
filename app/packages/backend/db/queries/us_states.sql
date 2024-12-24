-- name: ListUSStates :many
SELECT *
FROM us_states;
-- name: GetUSState :one
SELECT *
FROM us_states
WHERE id = $1;
-- name: CreateUSState :one
INSERT INTO us_states (name)
VALUES ($1)
RETURNING *;