import Database from "../Database.js";

export default abstract class Model<S> {
    constructor(protected db: Database<S>) {

    }
}