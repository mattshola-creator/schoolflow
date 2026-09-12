-- SchoolFlow M0 foundation only. Business-domain tables begin in M1.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
