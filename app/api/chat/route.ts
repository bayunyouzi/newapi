import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { message, model, history, images, enableDeepThink } = await request.json();

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
    const messages: any[] = [];
    if (history && Array.isArray(history)) {
      messages.push(...history.map((msg: any) => {
        if (msg.images && msg.images.length > 0) {
          // 处理历史消息中的多模态内容
          return {
            role: msg.role,
            content: [
              { type: 'text', text: msg.content },
              ...msg.images.map((img: string) => ({
                type: 'image_url',
                image_url: { url: img }
              }))
            ]
          };
        }
        return { role: msg.role, content: msg.content };
      }));
    }

    // 处理当前消息
    const currentContent: any[] = [{ type: 'text', text: message }];
    if (images && Array.isArray(images)) {
      images.forEach((img: string) => {
        currentContent.push({
          type: 'image_url',
          image_url: { url: img }
        });
      });
    }

    messages.push({ role: 'user', content: currentContent });

    // 深度思考参数处理 (假设 API 支持 enable_reasoning 或类似参数，或者通过 system prompt 开启)
    // 这里我们假设如果开启深度思考，我们在 System Prompt 中加入强提示，或者 API 有特定参数
    // 如果是 gpt-5.4，可能本身就强推理。这里我们示范加一个 System Prompt。
    if (enableDeepThink) {
      messages.unshift({
        role: 'system',
        content: 'You are a deep thinking AI. Please reason step-by-step before providing the final answer. Output your internal monologue in a <thinking> block.'
      });
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: messages,
        // 如果 API 支持特定的深度思考参数，可以在这里添加，例如：
        // reasoning_effort: enableDeepThink ? "high" : "medium" 
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
