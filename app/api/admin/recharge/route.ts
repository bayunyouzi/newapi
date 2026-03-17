import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { password, orderId, action } = await request.json();

    // 简易管理员密码验证
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password !== adminPassword) {
      return NextResponse.json({ success: false, message: '管理员密码错误' }, { status: 403 });
    }

    if (!orderId || !action) {
      return NextResponse.json({ success: false, message: '参数错误' }, { status: 400 });
    }

    const order = await prisma.rechargeOrder.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ success: false, message: '订单不存在' }, { status: 404 });
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json({ success: false, message: '该订单已被处理' }, { status: 400 });
    }

    if (action === 'approve') {
      // 开启事务：更新订单状态 + 增加用户余额
      await prisma.$transaction([
        prisma.rechargeOrder.update({
          where: { id: orderId },
          data: { status: 'APPROVED' }
        }),
        prisma.user.update({
          where: { id: order.userId },
          data: { balance: { increment: order.amount } }
        })
      ]);
      return NextResponse.json({ success: true, message: '订单已批准，余额已增加' });
    } else if (action === 'reject') {
      await prisma.rechargeOrder.update({
        where: { id: orderId },
        data: { status: 'REJECTED' }
      });
      return NextResponse.json({ success: true, message: '订单已拒绝' });
    }

    return NextResponse.json({ success: false, message: '无效的操作' }, { status: 400 });

  } catch (error: any) {
    console.error('Approve Order Error:', error);
    return NextResponse.json({ success: false, message: '处理失败' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // 获取所有待处理订单
  try {
    const url = new URL(request.url);
    const password = url.searchParams.get('password');
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password !== adminPassword) {
      return NextResponse.json({ success: false, message: '权限不足' }, { status: 403 });
    }

    const orders = await prisma.rechargeOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } },
      take: 100
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: '获取失败' }, { status: 500 });
  }
}
