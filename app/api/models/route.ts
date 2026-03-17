import { NextResponse } from 'next/server';

export async function GET() {
  // 根据截图提取和分类的模型列表
  const models = [
    { 
      id: 'gpt-5.4', 
      name: 'GPT-5.4', 
      provider: 'Custom', 
      tag: '对话', 
      description: '强大的最新一代 GPT 模型，速度与推理能力全面提升', 
      color: 'from-blue-500 to-indigo-400' 
    }
  ];

  return NextResponse.json({ success: true, data: models });
}
