import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { WeeklySettlement } from '../database/models';
import { WeeklySettlementService, WeekRange } from '../services/weeklySettlementService';
import { RazorpayXService } from '../services/razorpayXService';

const router = Router();

function getWeekRangeFromQuery(req: Request): WeekRange {
  const q = req.query as Record<string, unknown>;
  if (q['weekStart'] && q['weekEnd']) {
    const weekStart = String(q['weekStart']);
    const weekEnd = String(q['weekEnd']);
    return {
      weekStart,
      weekEnd,
      yearWeek: Number(q['yearWeek'] as string) || 0,
    };
  }

  // Default: current ISO week in IST
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day; // Monday as first day
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const weekStart = monday.toISOString().slice(0, 10);
  const weekEnd = sunday.toISOString().slice(0, 10);
  return {
    weekStart,
    weekEnd,
    yearWeek: 0,
  };
}

router.get('/weekly', authenticateToken, async (req: Request, res: Response) => {
  try {
    const week = getWeekRangeFromQuery(req);
    // Try DB first
    const yearWeek = week.yearWeek && week.yearWeek > 0 ? week.yearWeek : WeeklySettlementService.computeYearWeek(week.weekStart);
    try {
      const existing = await WeeklySettlement.findAll({ where: { yearweek: yearWeek } as any, order: [['gross_amount', 'DESC']] });
      if (existing.length > 0) {
        return res.json({ success: true, data: { week, settlements: existing } });
      }
    } catch (dbErr) {
      // Table may not exist; safely fall back to preview
      console.warn('Weekly settlements table not found or query failed, returning preview');
    }
    // Fallback to preview from orders
    const preview = await WeeklySettlementService.previewWeekAggregates(week);
    return res.json({ success: true, data: { week, settlements: preview } });
  } catch (error) {
    console.error('List weekly settlements error:', error);
    return res.status(500).json({ error: 'Failed to fetch weekly settlements' });
  }
});

router.post('/weekly/generate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { weekStart, weekEnd, yearWeek } = req.body as Partial<WeekRange>;
    if (!weekStart || !weekEnd) {
      return res.status(400).json({ error: 'weekStart and weekEnd are required (YYYY-MM-DD)' });
    }
    const week: WeekRange = { weekStart, weekEnd, yearWeek: Number(yearWeek) || 0 };
    await WeeklySettlementService.upsertWeeklySettlements(week);
    return res.json({ success: true, message: 'Weekly settlements generated/updated' });
  } catch (error) {
    console.error('Generate weekly settlements error:', error);
    return res.status(500).json({ error: 'Failed to generate weekly settlements' });
  }
});

router.get('/weekly/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const settlement = await WeeklySettlement.findByPk(id as any);
    if (!settlement) return res.status(404).json({ error: 'Settlement not found' });
    return res.json({ success: true, data: settlement });
  } catch (error) {
    console.error('Get weekly settlement error:', error);
    return res.status(500).json({ error: 'Failed to fetch settlement' });
  }
});

export default router;

// Additional endpoints for initiating and marking completion
router.post('/weekly/:id/initiate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const settlement = await WeeklySettlement.findByPk(id as any);
    if (!settlement) return res.status(404).json({ error: 'Settlement not found' });
    if (settlement.status !== 'pending') return res.status(400).json({ error: 'Settlement is not pending' });

    // For now, simulate initiation if RazorpayX env is not present
    try {
      new RazorpayXService();
      // In a real app: lookup or create contact/fund account for restaurant, then payout
      // Placeholder: not creating contacts to avoid side effects
      const payout = { id: 'pout_' + Date.now(), utr: 'UTR' + Date.now() } as any;
      await settlement.update({ status: 'processing', payout_id: payout.id, payout_reference: payout.utr });
    } catch (e) {
      // If RazorpayX not configured, still move to processing for manual testing
      await settlement.update({ status: 'processing', payout_id: 'simulated_' + Date.now(), payout_reference: 'SIMUTR' + Date.now() });
    }

    return res.json({ success: true, message: 'Settlement initiation started', data: settlement });
  } catch (error) {
    console.error('Initiate settlement error:', error);
    return res.status(500).json({ error: 'Failed to initiate settlement' });
  }
});

router.post('/weekly/:id/mark-completed', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const settlement = await WeeklySettlement.findByPk(id as any);
    if (!settlement) return res.status(404).json({ error: 'Settlement not found' });
    await settlement.update({ status: 'completed' });
    return res.json({ success: true, message: 'Settlement marked completed', data: settlement });
  } catch (error) {
    console.error('Mark settlement completed error:', error);
    return res.status(500).json({ error: 'Failed to mark settlement completed' });
  }
});


