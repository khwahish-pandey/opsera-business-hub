import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.getUsers();
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.createUser(req.body);
    return res.status(201).json({
      success: true,
      message: 'User account created successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}
