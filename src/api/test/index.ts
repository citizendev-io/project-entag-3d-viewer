import { Request, Response } from 'express';

export const GET = async (req: Request, res: Response) => {
  const { query } = req;
  console.log(query);

  res.status(200).json({ message: 'Hello from the API!' });
}