import { sql } from "./index";

export async function runMigrations() {
  await sql`
    CREATE TABLE IF NOT EXISTS mypg_admin_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      is_super_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS mypg_projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      db_connection_string TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS mypg_api_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID REFERENCES mypg_projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      key_hash TEXT UNIQUE NOT NULL,
      key_prefix TEXT NOT NULL,
      permissions JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      last_used_at TIMESTAMPTZ
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS mypg_collections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID REFERENCES mypg_projects(id) ON DELETE CASCADE,
      table_name TEXT NOT NULL,
      display_name TEXT NOT NULL,
      is_auth_collection BOOLEAN DEFAULT FALSE,
      enable_rls BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(project_id, table_name)
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS mypg_permissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      collection_id UUID REFERENCES mypg_collections(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      can_read BOOLEAN DEFAULT FALSE,
      can_create BOOLEAN DEFAULT FALSE,
      can_update BOOLEAN DEFAULT FALSE,
      can_delete BOOLEAN DEFAULT FALSE,
      UNIQUE(collection_id, role)
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS mypg_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID REFERENCES mypg_projects(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(project_id, email)
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS mypg_request_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID REFERENCES mypg_projects(id) ON DELETE CASCADE,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      status_code INT NOT NULL,
      duration_ms INT NOT NULL,
      ip TEXT,
      user_agent TEXT,
      user_id UUID,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS mypg_storage_files (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID REFERENCES mypg_projects(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes BIGINT NOT NULL,
      storage_path TEXT NOT NULL,
      is_public BOOLEAN DEFAULT FALSE,
      user_id UUID,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE OR REPLACE FUNCTION mypg_notify_trigger()
    RETURNS TRIGGER AS $$
    DECLARE
      payload JSONB;
      action TEXT;
    BEGIN
      IF TG_OP = 'INSERT' THEN
        action := 'create';
        payload := to_jsonb(NEW);
      ELSIF TG_OP = 'UPDATE' THEN
        action := 'update';
        payload := to_jsonb(NEW);
      ELSE
        action := 'delete';
        payload := to_jsonb(OLD);
      END IF;
      PERFORM pg_notify(
        'mypg_realtime',
        jsonb_build_object(
          'action', action,
          'collection', TG_TABLE_NAME,
          'record', payload
        )::text
      );
      RETURN COALESCE(NEW, OLD);
    END;
    $$ LANGUAGE plpgsql;
  `;
}

export async function installCollectionTrigger(tableName: string, sql: any) {
  const triggerName = `mypg_notify_${tableName}`;
  await sql`
    DROP TRIGGER IF EXISTS ${sql(triggerName)} ON ${sql(tableName)};
  `;
  await sql`
    CREATE TRIGGER ${sql(triggerName)}
    AFTER INSERT OR UPDATE OR DELETE ON ${sql(tableName)}
    FOR EACH ROW EXECUTE FUNCTION mypg_notify_trigger();
  `;
}
