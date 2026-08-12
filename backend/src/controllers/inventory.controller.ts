import { Request, Response, NextFunction } from 'express';
import * as inventoryService from '../services/inventory.service';
import { MovementType } from '../types/enums';

export async function getInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, category, page, limit } = req.query;
    const result = await inventoryService.getInventoryOverview({
      search: search as string,
      category: category as string,
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

export async function addStockIn(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await inventoryService.addStockIn(req.params.productId, req.body, req.user!.userId);
    return res.status(200).json({
      success: true,
      message: `Successfully added ${req.body.quantity} units to stock`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeStockOut(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await inventoryService.removeStockOut(req.params.productId, req.body, req.user!.userId);
    return res.status(200).json({
      success: true,
      message: `Successfully removed ${req.body.quantity} units from stock`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStockMovements(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId, movementType, search, page, limit } = req.query;
    const result = await inventoryService.getStockMovements({
      productId: productId as string,
      movementType: movementType as MovementType,
      search: search as string,
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
