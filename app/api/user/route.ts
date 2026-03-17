import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, message: '未登录' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        usageHistory: {
          orderBy: { timestamp: 'desc' },
          take: 50 // 只取最近50条
        }
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: '用户不存在' }, { status: 404 });
    }

    // 去除密码等敏感信息
    const { password, ...safeUser } = user;

    return NextResponse.json({ success: true, data: safeUser });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || '获取用户信息失败' },
      { status: 500 }
    );
  }
}
