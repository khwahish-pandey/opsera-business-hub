import { Request, Response, NextFunction } from 'express';
import * as reportService from '../services/report.service';

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await reportService.getDashboardStats();
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

export async function getReports(req: Request, res: Response, next: NextFunction) {
  try {
    const { startDate, endDate } = req.query;
    const summary = await reportService.getReportsSummary(startDate as string, endDate as string);
    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}
