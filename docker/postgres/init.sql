CREATE OR REPLACE FUNCTION create_db_if_not_exists(dbname text) RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = dbname) THEN
    EXECUTE format('CREATE DATABASE %I OWNER mypg', dbname);
  END IF;
END;
$$ LANGUAGE plpgsql;

SELECT create_db_if_not_exists('mypg_internal');
SELECT create_db_if_not_exists('mypg_data');
