"use client";
import { Send, Globe, Paperclip, Coins, RefreshCw, Bell, User } from "lucide-react";
import { useState } from "react";

export default function ChatArea({ selectedModelId }: { selectedModelId: string }) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    // Add user message to UI immediately
    const userMsg = message;
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setMessage("");
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, model: selectedModelId, history: chatHistory })
      });
      
      const data = await response.json();
      if (response.status === 401) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: '系统提示：您需要先登录才能使用对话功能。请点击左下角进行登录或注册。' }]);
        return;
      }
      if (response.status === 403) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: '系统提示：您的余额不足，请充值后再试。' }]);
        return;
      }

      if (data.success) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.message || '抱歉，请求失败，请稍后重试。' }]);
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: '网络错误，请检查连接。' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 bg-background flex flex-col h-screen relative">
      {/* 顶部右侧工具栏 */}
      <div className="absolute top-0 right-0 p-5 flex items-center gap-4 z-10 text-gray-500">
        <button className="hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"><RefreshCw size={20} /></button>
        <button className="hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"><Globe size={20} /></button>
        <button className="hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"><User size={20} /></button>
        <button className="hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"><Bell size={20} /></button>
      </div>

      {/* 中心聊天/欢迎区域 */}
      <div className="flex-1 overflow-y-auto p-8 pb-32 flex flex-col items-center">
        {chatHistory.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center">
            {/* 发光的星星 Logo (适配亮色模式) */}
            <div className="relative mb-12">
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-300 via-purple-300 to-green-200 rounded-full blur-2xl opacity-60 absolute inset-0"></div>
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 via-purple-500 to-green-400 mask-star relative z-10" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></div>
            </div>

            {/* 模型介绍卡片 */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl max-w-2xl text-center shadow-sm">
              <p className="text-gray-600 leading-relaxed">
                <span className="text-blue-600 font-bold">柚子AI</span> 聚合了全球顶尖的 AI 模型。支持 OpenAI、Anthropic、Google 等多种架构，为您提供最优质的智能对话体验。
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl space-y-6">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${ 
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部输入框区域 */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center w-full bg-gradient-to-t from-background via-background to-transparent">
        <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-2xl p-4 flex flex-col shadow-lg transition-all focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="w-full bg-transparent text-gray-800 outline-none resize-none min-h-[60px] max-h-[200px] text-sm placeholder-gray-400"
            placeholder="输入复杂的多模态分析、深度推理或长文稿处理任务，逻辑能力极强... (按 Enter 发送)"
            rows={2}
          ></textarea>
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            {/* 左侧选项 */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs text-gray-600 transition-colors">
                <Coins size={14} className="text-yellow-500" />
                <span className="font-medium">价格优先</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs text-gray-600 transition-colors">
                <Globe size={14} className="text-blue-500" />
                <span className="font-medium">联网搜索</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs text-gray-600 transition-colors">
                <Paperclip size={14} className="text-purple-500" />
                <span className="font-medium">深度思考</span>
              </button>
            </div>
            
            {/* 右侧发送按钮 */}
            <button 
              onClick={handleSend}
              disabled={!message.trim() || isTyping}
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors shadow-md"
            >
              <Send size={18} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
