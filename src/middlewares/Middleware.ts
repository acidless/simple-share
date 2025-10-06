import express from "express";

abstract class Middleware {
    abstract execute(req: express.Request, res: express.Response, next: express.NextFunction): void;
}

export default Middleware;