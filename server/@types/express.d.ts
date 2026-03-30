import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string; // or uuid type if you prefer
  }
}