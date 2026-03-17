import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: '请提供邮箱' }, { status: 400 });
    }

    // 生成6位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟有效期

    // 存入数据库
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        expiresAt
      }
    });

    // 发送邮件
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.qq.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER || '2725167164@qq.com',
        pass: process.env.SMTP_PASS || 'joytkoyqdhbxdhec',
      },
    });

    await transporter.sendMail({
      from: `"柚子AI" <${process.env.SMTP_USER || '2725167164@qq.com'}>`,
      to: email,
      subject: '柚子AI - 您的注册验证码',
      text: `您的注册验证码是：${code}。该验证码在10分钟内有效，请勿泄露给他人。`,
      html: `<div style="padding: 20px; background-color: #f5f5f5; border-radius: 10px;">
              <h2 style="color: #333;">欢迎注册柚子AI</h2>
              <p style="font-size: 16px; color: #555;">您的验证码是：</p>
              <div style="font-size: 24px; font-weight: bold; color: #4F46E5; padding: 10px; background: #fff; display: inline-block; border-radius: 5px; margin: 10px 0;">${code}</div>
              <p style="font-size: 14px; color: #999;">该验证码在10分钟内有效，请勿泄露给他人。</p>
             </div>`
    });

    return NextResponse.json({ success: true, message: '验证码发送成功' });
  } catch (error: any) {
    console.error('Send Code Error:', error);
    return NextResponse.json(
      { success: false, message: '验证码发送失败' },
      { status: 500 }
    );
  }
}
