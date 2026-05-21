import type { NextFunction, Request, Response } from "express";
import fs from "fs"

const logger = (req : Request, res : Response, next : NextFunction) => {
  console.log('Time:', Date.now());
  const log = `\n method -> ${req.method} - url -> ${req.url} - time -> ${ Date.now()} \n`
  fs.appendFile('loogrr.text ' , log , (err: any) =>{
  })
  next();
}

export default logger; 