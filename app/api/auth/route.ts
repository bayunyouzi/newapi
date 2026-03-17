import { NextResponse } from 'next/server';

// 这是一个模拟的登录接口
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 这里未来连接数据库验证
    if (username === 'admin' && password === 'admin') {
      return NextResponse.json({ 
        success: true, 
        token: 'mock-jwt-token-12345',
        user: { name: 'Admin User', role: 'admin' }
      });
    }

    return NextResponse.json(
      { success: false, message: '账号或密码错误' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '请求格式错误' },
      { status: 400 }
    );
  }
}
