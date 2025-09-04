import { sequelize } from '../database/connection';
import { WeeklySettlement, WeeklySettlementOrder } from '../database/models';

export interface WeekRange {
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string;   // YYYY-MM-DD (Sunday)
  yearWeek: number;  // ISO YEARWEEK(created_at, 3)
}

export class WeeklySettlementService {
  static computeYearWeek(weekStart: string): number {
    // Compute ISO year-week number as YYYYWW from weekStart (YYYY-MM-DD)
    const date = new Date(weekStart + 'T00:00:00Z');
    // ISO week: Thursday determines the year
    const target = new Date(date);
    const dayNr = (target.getUTCDay() + 6) % 7; // Monday=0..Sunday=6
    target.setUTCDate(target.getUTCDate() - dayNr + 3); // Thursday
    const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
    const firstDayNr = (firstThursday.getUTCDay() + 6) % 7;
    firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNr + 3);
    const weekNo = 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000));
    const year = target.getUTCFullYear();
    return year * 100 + weekNo;
  }
  static getCommissionRate(): number {
    const rate = parseFloat(process.env['SETTLEMENT_COMMISSION_RATE'] || '10');
    return isNaN(rate) ? 10 : rate;
  }

  static async previewWeekAggregates(week: WeekRange) {
    const [rows] = await sequelize.query(
      `
      SELECT
        ri.id AS restaurant_id,
        ri.restaurant_name,
        COUNT(*) AS order_count,
        SUM(o.grand_total_user) AS gross_amount
      FROM orders o
      JOIN restaurant_information ri ON ri.id = o.restaurant_id
      WHERE o.status = 'Delivered'
        AND DATE(o.created_at) BETWEEN ? AND ?
      GROUP BY ri.id, ri.restaurant_name
      ORDER BY gross_amount DESC
      `,
      { replacements: [week.weekStart, week.weekEnd] }
    );

    const commissionRate = this.getCommissionRate();
    return (rows as any[]).map(r => ({
      restaurantId: r.restaurant_id,
      restaurantName: r.restaurant_name,
      orderCount: Number(r.order_count) || 0,
      grossAmount: parseFloat(r.gross_amount || '0'),
      commissionRate,
      commissionAmount: parseFloat(((parseFloat(r.gross_amount || '0') * commissionRate) / 100).toFixed(2)),
      netAmount: parseFloat((parseFloat(r.gross_amount || '0') * (1 - commissionRate / 100)).toFixed(2)),
    }));
  }

  static async upsertWeeklySettlements(week: WeekRange) {
    const preview = await this.previewWeekAggregates(week);
    const t = await sequelize.transaction();
    try {
      const yearWeek = week.yearWeek && week.yearWeek > 0 ? week.yearWeek : this.computeYearWeek(week.weekStart);
      for (const p of preview) {
        const [settlement] = await WeeklySettlement.findOrCreate({
          where: { restaurant_id: p.restaurantId, yearweek: yearWeek },
          defaults: {
            restaurant_id: p.restaurantId,
            yearweek: yearWeek,
            week_start_date: week.weekStart as unknown as Date,
            week_end_date: week.weekEnd as unknown as Date,
            order_count: p.orderCount,
            gross_amount: p.grossAmount,
            commission_rate: p.commissionRate,
            commission_amount: parseFloat(((p.grossAmount * p.commissionRate) / 100).toFixed(2)),
            net_amount: parseFloat((p.netAmount).toFixed(2)),
            status: 'pending',
            due_date: WeeklySettlementService.computeDueDate(week.weekEnd),
          },
          transaction: t,
        });

        const [orderRows] = await sequelize.query(
          `
          SELECT o.order_id
          FROM orders o
          WHERE o.restaurant_id = ?
            AND o.status = 'Delivered'
            AND DATE(o.created_at) BETWEEN ? AND ?
          `,
          { replacements: [p.restaurantId, week.weekStart, week.weekEnd], transaction: t }
        );

        for (const or of orderRows as any[]) {
          await WeeklySettlementOrder.findOrCreate({
            where: { weekly_settlement_id: (settlement as any).id, order_id: or.order_id },
            defaults: { weekly_settlement_id: (settlement as any).id, order_id: or.order_id },
            transaction: t,
          });
        }
      }
      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
  }

  static computeDueDate(weekEnd: string): Date {
    const end = new Date(weekEnd + 'T00:00:00Z');
    const due = new Date(end);
    due.setDate(end.getDate() + 3);
    return new Date(due.toISOString().slice(0, 10));
  }
}


