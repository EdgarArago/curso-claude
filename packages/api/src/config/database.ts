import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import { DatabaseNotInitializedError } from '@errors/DomainErrors.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class Database {
    private db: sqlite3.Database | null = null
    private dbPath: string

    constructor() {
        const env = process.env.NODE_ENV || 'development'
        if (env === 'test') {
            this.dbPath = ':memory:'
        } else {
            this.dbPath = path.join(__dirname, '../../resttek.db')
        }
    }

    public async initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            const dbInstance = new sqlite3.Database(this.dbPath, async (err) => {
                if (err) {
                    return reject(err)
                }

                this.db = dbInstance
                try {
                    await this.run('PRAGMA foreign_keys = ON')
                    await this.runInitialMigrations()
                    resolve()
                } catch (migrateErr) {
                    reject(migrateErr)
                }
            })
        })
    }

    public getDb(): sqlite3.Database {
        if (!this.db) {
            throw new DatabaseNotInitializedError()
        }
        return this.db
    }

    public async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
        return new Promise((resolve, reject) => {
            this.getDb().run(sql, params, function (err) {
                if (err) return reject(err)
                resolve(this)
            })
        })
    }

    public async all<T>(sql: string, params: any[] = []): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.getDb().all(sql, params, (err, rows) => {
                if (err) return reject(err)
                resolve(rows as T[])
            })
        })
    }

    public async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
        return new Promise((resolve, reject) => {
            this.getDb().get(sql, params, (err, row) => {
                if (err) return reject(err)
                resolve(row as T)
            })
        })
    }

    public async close(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) return reject(err)
                    this.db = null
                    resolve()
                })
            } else {
                resolve()
            }
        })
    }

    private async runInitialMigrations(): Promise<void> {
        const queries = `
            CREATE TABLE IF NOT EXISTS restaurants (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                address TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                owner_first_name TEXT NOT NULL,
                owner_last_name TEXT NOT NULL,
                logo_url TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS employees (
                id TEXT PRIMARY KEY,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                restaurant_id TEXT,
                FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
            );

            CREATE TABLE IF NOT EXISTS ingredients (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                unit TEXT NOT NULL,
                current_stock REAL NOT NULL DEFAULT 0,
                restaurant_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
            );

            CREATE TABLE IF NOT EXISTS dishes (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                category TEXT NOT NULL,
                available INTEGER NOT NULL DEFAULT 1,
                restaurant_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
            );

            CREATE TABLE IF NOT EXISTS dish_ingredients (
                dish_id TEXT NOT NULL,
                ingredient_id TEXT NOT NULL,
                quantity REAL NOT NULL,
                PRIMARY KEY(dish_id, ingredient_id),
                FOREIGN KEY(dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
                FOREIGN KEY(ingredient_id) REFERENCES ingredients(id)
            );

            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                restaurant_id TEXT NOT NULL,
                table_id TEXT,
                client_id TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
            );

            CREATE TABLE IF NOT EXISTS order_items (
                id TEXT PRIMARY KEY,
                order_id TEXT NOT NULL,
                dish_id TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                notes TEXT,
                status TEXT NOT NULL,
                FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY(dish_id) REFERENCES dishes(id)
            )
        `.split(';')

        for (const q of queries) {
            if (q.trim()) await this.run(q)
        }
    }
}

export const dbConfig = new Database()
