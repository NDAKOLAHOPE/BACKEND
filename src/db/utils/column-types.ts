/**
 * Helper to get the appropriate date/time column type for the configured database.
 * Returns 'timestamp' for PostgreSQL and 'datetime' for SQLite.
 */
export function getDateColumnType(): 'timestamp' | 'datetime' {
  const dbUrl = process.env.DATABASE_URL;
  // If DATABASE_URL is not a PostgreSQL URL, use datetime (for SQLite fallback)
  if (!dbUrl || !dbUrl.startsWith('postgresql')) {
    return 'datetime';
  }
  return 'timestamp';
}
