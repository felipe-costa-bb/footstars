import { sqliteRepo } from './sqlite.js';

// In the future, we can switch this based on env vars
// import { postgresRepo } from './postgres.js';

export const dbRequest = sqliteRepo;
