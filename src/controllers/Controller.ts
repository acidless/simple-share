import {Express} from "express";

abstract class Controller {
    public constructor(private app: Express) {}
}

export default Controller;