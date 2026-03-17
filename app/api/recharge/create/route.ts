import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, message: '请先登录' }, { status: 401 });
    }

    const { amount, paymentId } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, message: '无效的金额' }, { status: 400 });
    }

    const order = await prisma.rechargeOrder.create({
      data: {
        userId: session.userId,
        amount: parseFloat(amount),
        status: 'PENDING',
        paymentId: paymentId || ''
      }
    });

    return NextResponse.json({ success: true, message: '订单提交成功，等待管理员审核', orderId: order.id });
  } catch (error: any) {
    console.error('Create Order Error:', error);
    return NextResponse.json({ success: false, message: '创建订单失败' }, { status: 500 });
  }
}
