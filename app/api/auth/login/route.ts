import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: '请提供邮箱和密码' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, message: '用户不存在或密码错误' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: '用户不存在或密码错误' }, { status: 401 });
    }

    // 登录成功，生成 Session Token
    const sessionToken = await encrypt({ userId: user.id, email: user.email });
    cookies().set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return NextResponse.json({ 
      success: true, 
      message: '登录成功',
      user: { id: user.id, email: user.email, balance: user.balance }
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ success: false, message: '登录失败' }, { status: 500 });
  }
}
