import {BaseSchema} from "./Schema.js";
import { JSONFileSync } from 'lowdb/node'
import {LowSync} from "lowdb";
import fs from "fs";

interface SchemaConstructor<T extends BaseSchema> {
    new (...args: any[]): T;
    filename: string;
}

class Database<S extends BaseSchema> {
    private db: LowSync<S>;
    private static instances_ = new Map<string, Database<any>>();

    private constructor(ctor: SchemaConstructor<S>) {
        const dir = 'datasources';

        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        this.db = new LowSync(new JSONFileSync(`${dir}/${ctor.filename}.json`), new ctor());
    }

    public static instance<T extends BaseSchema>(ctor: SchemaConstructor<T>): Database<T> {
        const filename = ctor.filename;
        if(!this.instances_.has(filename)) {
            this.instances_.set(filename, new Database<T>(ctor));
        }

        return this.instances_.get(filename) as Database<T>;
    }

    public read() {
        this.db.read();
    }

    public write() {
        this.db.write();
    }

    public data() {
        return this.db.data;
    }
}

export default Database;