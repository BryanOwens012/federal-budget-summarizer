CREATE TABLE us_states (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT,
    createdat TIMESTAMPTZ DEFAULT now(),
    updatedat TIMESTAMPTZ DEFAULT now()
);
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updatedat = NOW();
-- Update the 'updatedAt' column with the current timestamp
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER on_update BEFORE
UPDATE ON us_states FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();