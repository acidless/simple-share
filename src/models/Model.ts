import Database from "../Database.ts";
import {BaseSchema} from "../Schema.ts";

export default abstract class Model<S extends BaseSchema> {
    constructor(protected db: Database<S>) {

    }
}