import Database from "../Database.js";
import {BaseSchema} from "../Schema.js";

export default abstract class Model<S extends BaseSchema> {
    constructor(protected db: Database<S>) {

    }
}