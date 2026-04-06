import { ZodType } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { HTTPSTATUS } from '@/core/https.config';

type Schema = {
  body?:ZodType ;
  params?: ZodType;
  query?: ZodType;
};

export const validateRequest =
  (schema: Schema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const errors: any[] = [];

    // ----------------------
    // BODY
    // ----------------------
    if (schema.body) {
      const result = schema.body.safeParse(req.body);
      if (!result.success) {
        errors.push(
          ...result.error.issues.map((err) => ({
            field: `body.${err.path.join('.')}`,
            message: err.message,
          }))
        );
      } else {
        req.body = result.data;
      }
    }

    // ----------------------
    // PARAMS
    // ----------------------
    if (schema.params) {
      const result = schema.params.safeParse(req.params);
      if (!result.success) {
        errors.push(
          ...result.error.issues.map((err) => ({
            field: `params.${err.path.join('.')}`,
            message: err.message,
          }))
        );
      } else {
        req.params = result.data as typeof req.params;
      }
    }

    // ----------------------
    // QUERY
    // ----------------------
    if (schema.query) {
      const result = schema.query.safeParse(req.query);
      if (!result.success) {
        errors.push(
          ...result.error.issues.map((err) => ({
            field: `query.${err.path.join('.')}`,
            message: err.message,
          }))
        );
      } else {
        req.query = result.data as typeof req.query;
      }
    }

    // ----------------------
    // HANDLE ERRORS
    // ----------------------
    if (errors.length > 0) {
      res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    next();
  };