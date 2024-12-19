CREATE TABLE products (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    price_cents BIGINT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
-- Update the 'updated_at' column with the current timestamp
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER on_update BEFORE
UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();