import {Schema} from "./Schema.js";
import { JSONFileSync } from 'lowdb/node'
import {LowSync} from "lowdb";

class Database {
    private db: LowSync<Schema>;
    private static instance_: Database;

    private constructor() {
        this.db = new LowSync(new JSONFileSync('file.json'), {files: []})
    }

    public static instance(): Database {
        if(!this.instance_) {
            this.instance_ = new Database();
        }

        return this.instance_;
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