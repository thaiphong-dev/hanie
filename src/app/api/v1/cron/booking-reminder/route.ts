import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { sendNotification } from '@/lib/notifications';

// Cron endpoint: gọi mỗi 30 phút bởi Vercel Cron hoặc pg_cron
// Tìm các booking confirmed có scheduled_at trong [now+105min, now+135min]
// → nhắc customer trước ~2 giờ
//
// Bảo vệ bằng CRON_SECRET header để không bị gọi tùy tiện.
// Vercel Cron dùng GET; manual/pg_cron có thể dùng POST — cả hai đều được hỗ trợ.

async function runReminder(req: NextRequest): Promise<NextResponse> {
  const secret = req.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServerClient();
    const now = new Date();
    const windowStart = new Date(now.getTime() + 105 * 60_000); // now + 1h45m
    const windowEnd   = new Date(now.getTime() + 135 * 60_000); // now + 2h15m

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, customer_id, customer_name, scheduled_at')
      .eq('status', 'confirmed')
      .gte('scheduled_at', windowStart.toISOString())
      .lte('scheduled_at', windowEnd.toISOString())
      .not('customer_id', 'is', null);

    if (error) throw new Error(error.message);
    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ data: { reminded: 0 }, error: null });
    }

    await Promise.allSettled(
      bookings.map((b) =>
        sendNotification({
          userIds: b.customer_id!,
          type: 'booking_reminder',
          title: 'Nhắc lịch hẹn',
          body: `Bạn có lịch hẹn tại Hanie lúc ${new Date(b.scheduled_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`,
          data: { booking_id: b.id },
          url: `/history?booking_id=${b.id}`,
        }),
      ),
    );

    return NextResponse.json({ data: { reminded: bookings.length }, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[cron/booking-reminder]', message);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 },
    );
  }
}

// Vercel Cron Jobs send GET requests — expose both methods
export const GET  = runReminder;
export const POST = runReminder;
