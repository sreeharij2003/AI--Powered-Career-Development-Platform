import { Response } from 'express';

export const handleError = (
  res: Response,
  error: any,
  defaultMessage: string = 'An error occurred'
) => {
  console.error(error);

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(error.errors).map((err: any) => err.message)
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
      details: error.message
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate Entry',
      details: 'This record already exists'
    });
  }

  // Handle general errors
  res.status(500).json({
    error: defaultMessage,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}; 