// Payment entity - use PostgreSQL or SQLite version based on DATABASE_URL
import { PaymentPostgres } from './payment-postgres.entity.js';
import { PaymentSQLite } from './payment-sqlite.entity.js';

const isPostgres = !!process.env.DATABASE_URL?.startsWith('postgresql');

// Export the appropriate Payment class based on database
export const Payment = isPostgres ? PaymentPostgres : PaymentSQLite;

// Export the type for TypeScript usage
export type PaymentType = InstanceType<typeof Payment>;

