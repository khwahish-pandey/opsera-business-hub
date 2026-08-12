import { Request, Response, NextFunction } from 'express';
import * as challanService from '../services/challan.service';
import { ChallanStatus } from '../types/enums';

export async function createChallan(req: Request, res: Response, next: NextFunction) {
  try {
    const challan = await challanService.createChallan(req.body, req.user!.userId);
    return res.status(201).json({
      success: true,
      message: 'Draft challan created successfully',
      data: challan,
    });
  } catch (error) {
    next(error);
  }
}

export async function getChallans(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, status, customerId, startDate, endDate, page, limit } = req.query;
    const result = await challanService.getChallans({
      search: search as string,
      status: status as ChallanStatus,
      customerId: customerId as string,
      startDate: startDate as string,
      endDate: endDate as string,
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

export async function getChallanById(req: Request, res: Response, next: NextFunction) {
  try {
    const challan = await challanService.getChallanById(req.params.id);
    return res.status(200).json({
      success: true,
      data: challan,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateChallan(req: Request, res: Response, next: NextFunction) {
  try {
    const challan = await challanService.updateChallan(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Challan updated successfully',
      data: challan,
    });
  } catch (error) {
    next(error);
  }
}

export async function confirmChallan(req: Request, res: Response, next: NextFunction) {
  try {
    const challan = await challanService.confirmChallan(req.params.id, req.user!.userId);
    return res.status(200).json({
      success: true,
      message: `Challan ${challan.challanNumber} confirmed successfully. Inventory stock updated.`,
      data: challan,
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelChallan(req: Request, res: Response, next: NextFunction) {
  try {
    const challan = await challanService.cancelChallan(req.params.id, req.user!.userId);
    return res.status(200).json({
      success: true,
      message: `Challan ${challan.challanNumber} cancelled. Stock restored if previously confirmed.`,
      data: challan,
    });
  } catch (error) {
    next(error);
  }
}
