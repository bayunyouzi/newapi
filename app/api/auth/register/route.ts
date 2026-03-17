import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password, code } = await request.json();

    if (!email || !password || !code) {
      return NextResponse.json({ success: false, message: '请填写完整信息' }, { status: 400 });
    }

    // 验证邮箱验证码
    const validCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!validCode) {
      return NextResponse.json({ success: false, message: '验证码错误或已过期' }, { status: 400 });
    }

    // 检查邮箱是否已注册
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ success: false, message: '该邮箱已注册' }, { status: 400 });
    }

    // 创建用户，默认赠送100元
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        balance: 100.0 // 赠送100元
      }
    });

    // 标记验证码已使用 (可以选择删除它)
    await prisma.verificationCode.deleteMany({ where: { email } });

    // 登录：生成 Session Token
    const sessionToken = await encrypt({ userId: user.id, email: user.email });
    cookies().set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return NextResponse.json({ success: true, message: '注册成功并已登录', user: { id: user.id, email: user.email, balance: user.balance } });
  } catch (error: any) {
    console.error('Register Error:', error);
    return NextResponse.json({ success: false, message: '注册失败' }, { status: 500 });
  }
}
