import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { message, model, history } = await request.json();

    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, message: '请先登录' }, { status: 401 });
    }

    const userId = session.userId;

    // Ensure user has enough balance
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: false, message: '用户不存在' }, { status: 404 });
    }

    if (user.balance <= 0) {
      return NextResponse.json(
        { success: false, message: '余额不足，请充值' },
        { status: 403 }
      );
    }

    // 你的 API 密钥
    const API_KEY = 'sk-qc9BnnhoXm6nWFyYzqXsb2hhxELTv746MvJIcoCT7t8LEtqG';
    const API_URL = 'https://api.bltcy.ai/v1/chat/completions';
    
    // Default to gpt-5.4 if not provided
    const selectedModel = model || 'gpt-5.4';

    // Construct messages with history
    const messages = [];
    if (history && Array.isArray(history)) {
      messages.push(...history.map(msg => ({ role: msg.role, content: msg.content })));
    }
    messages.push({ role: 'user', content: message });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(errorData.error?.message || 'API Request Failed');
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;
    const usage = data.usage;

    console.log('API Response Usage:', usage);

    // Deduct balance
    if (usage) {
      const promptTokens = usage.prompt_tokens || 0;
      const completionTokens = usage.completion_tokens || 0;
      // 计费翻倍逻辑：乘以 2
      const totalTokens = (promptTokens + completionTokens) * 2;
      const cost = (totalTokens / 1000) * 0.01;

      // Update balance and create record
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { balance: { decrement: cost } }
        }),
        prisma.usageRecord.create({
          data: {
            userId: userId,
            model: selectedModel,
            promptTokens,
            completionTokens,
            totalTokens,
            cost
          }
        })
      ]);
    } else {
      console.warn('No usage data returned from API');
    }

    return NextResponse.json({ success: true, reply, usage });

  } catch (error: any) {
    console.error('Chat Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || '聊天服务暂不可用' },
      { status: 500 }
    );
  }
}
