import { Request, Response, NextFunction } from 'express';
import * as customerService from '../services/customer.service';
import { CustomerStatus, CustomerType } from '../types/enums';

export async function getCustomers(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, status, customerType, page, limit } = req.query;
    const result = await customerService.getCustomers({
      search: search as string,
      status: status as CustomerStatus,
      customerType: customerType as CustomerType,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerById(req: Request, res: Response, next: NextFunction) {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    return res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}

export async function createCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const customer = await customerService.createCustomer(req.body);
    return res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await customerService.deleteCustomer(req.params.id);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}

export async function addFollowUp(req: Request, res: Response, next: NextFunction) {
  try {
    const followUp = await customerService.addFollowUp(req.params.id, req.body, req.user!.userId);
    return res.status(201).json({
      success: true,
      message: 'Follow-up note added successfully',
      data: followUp,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerFollowUps(req: Request, res: Response, next: NextFunction) {
  try {
    const followUps = await customerService.getCustomerFollowUps(req.params.id);
    return res.status(200).json({
      success: true,
      data: followUps,
    });
  } catch (error) {
    next(error);
  }
}
