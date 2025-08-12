import { Pool } from 'pg';
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite';
export declare const query: (text: string, params?: any[]) => Promise<import("pg").QueryResult<any> | {
    rows: any[];
    rowCount: number;
}>;
export declare const getClient: () => Promise<import("pg").PoolClient> | null;
declare const _default: Pool | Database<sqlite3.Database, sqlite3.Statement>;
export default _default;
//# sourceMappingURL=database.d.ts.map