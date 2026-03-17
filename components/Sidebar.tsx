"use client";
import { Plus, MessageSquare, Image as ImageIcon, Video, Mic, Search, Settings, User, X, LogOut, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import AuthModal from "./AuthModal";
import RechargeModal from "./RechargeModal";

export default function Sidebar({ onSelectModel, selectedModelId }: { onSelectModel: (id: string) => void, selectedModelId: string }) {
  const [models, setModels] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  useEffect(() => {
    // 调用我们自己写的后端 API 获取模型列表
    fetch('/api/models')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setModels(data.data);
        }
      });
      
    // 获取用户信息
    fetchUserInfo();
  }, []);

  const fetchUserInfo = () => {
    fetch(`/api/user?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUserInfo(data.data);
        } else {
          setUserInfo(null);
        }
      })
      .catch(() => setUserInfo(null));
  };

  const handleUserClick = () => {
    if (!userInfo) {
      setShowAuthModal(true);
    } else {
      fetchUserInfo(); // 每次打开更新一下
      setShowUserModal(true);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUserInfo(null);
    setShowUserModal(false);
  };

  return (
    <div className="w-72 bg-panel h-screen flex flex-col border-r border-gray-200 flex-shrink-0">
      {/* 头部 Logo & 新建按钮 */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
            <span className="font-black text-xl">柚</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight text-gray-900">柚子AI</span>
            <span className="text-[10px] text-gray-500">AI 大模型聚合平台</span>
          </div>
        </div>
        <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 transition-colors">
          <Plus size={16} strokeWidth={3} />
          新建对话
        </button>
      </div>

      {/* 分类 Tabs */}
      <div className="px-5 flex gap-5 text-sm text-gray-500 border-b border-gray-200 pb-3 mt-2">
        <button className="text-blue-600 border-b-2 border-blue-500 pb-3 -mb-[13px] font-medium">全部</button>
        <button className="hover:text-gray-900 transition-colors">聊天</button>
        <button className="hover:text-gray-900 transition-colors">图片</button>
        <button className="hover:text-gray-900 transition-colors">视频</button>
        <button className="hover:text-gray-900 transition-colors">音频</button>
      </div>

      {/* 模型列表区 */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-2 mt-2">
        {models.map((model) => (
          <div 
            key={model.id}
            onClick={() => onSelectModel(model.id)}
            className={`p-3 rounded-xl cursor-pointer transition-all border ${
              selectedModelId === model.id 
                ? 'bg-blue-50 border-blue-200 shadow-sm' 
                : 'bg-transparent border-transparent hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded bg-gradient-to-br ${model.color}`}></div>
                <span className="font-semibold text-sm text-gray-800">{model.name}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                model.tag === '对话' ? 'bg-blue-100 text-blue-600' : 
                model.tag === '图片' ? 'bg-purple-100 text-purple-600' :
                model.tag === '视频' ? 'bg-red-100 text-red-600' :
                'bg-orange-100 text-orange-600'
              }`}>
                {model.tag}
              </span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">
              {model.description}
            </p>
          </div>
        ))}
      </div>

      {/* 底部用户信息 */}
      <div 
        onClick={handleUserClick}
        className="p-4 border-t border-gray-200 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300 flex items-center justify-center text-gray-500">
            <User size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800">
              {userInfo ? userInfo.email.split('@')[0] : '未登录'}
            </span>
            <span className="text-xs text-green-600 flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${userInfo ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              {userInfo ? `余额: ¥${userInfo.balance.toFixed(4)}` : '点击登录/注册'}
            </span>
          </div>
        </div>
        <Settings size={18} className="text-gray-500" />
      </div>

      {/* 用户信息弹窗 */}
      {showUserModal && userInfo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">用户中心</h2>
              <div className="flex gap-2">
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-gray-500 flex items-center gap-1 text-sm"
                  title="退出登录"
                >
                  <LogOut size={18} />
                </button>
                <button 
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-5 flex-1 overflow-hidden flex flex-col gap-6">
              {/* 余额卡片 */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-md">
                <p className="text-blue-100 text-sm font-medium mb-1">当前余额 (元)</p>
                <h3 className="text-4xl font-black">¥{userInfo.balance.toFixed(4)}</h3>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-blue-100 text-xs">使用费率: 0.01元 / 1K Tokens</p>
                  <button 
                    onClick={() => {
                      setShowUserModal(false);
                      setShowRechargeModal(true);
                    }}
                    className="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow hover:bg-blue-50 transition-colors flex items-center gap-1"
                  >
                    <Wallet size={12} />
                    充值
                  </button>
                </div>
              </div>

              {/* 使用记录 */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <h3 className="font-bold text-gray-800 mb-3">使用记录 ({userInfo.usageHistory.length})</h3>
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-hide">
                  {userInfo.usageHistory.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">暂无使用记录</p>
                  ) : (
                    userInfo.usageHistory.map((record: any) => (
                      <div key={record.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-gray-800 text-sm">{record.model}</span>
                          <span className="text-red-500 font-bold text-sm">-¥{record.cost.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{new Date(record.timestamp).toLocaleString()}</span>
                          <span>{record.totalTokens} Tokens (提示: {record.promptTokens}, 完成: {record.completionTokens})</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 登录/注册弹窗 */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={() => {
            setShowAuthModal(false);
            fetchUserInfo();
          }} 
        />
      )}
      {/* 充值弹窗 */}
      {showRechargeModal && (
        <RechargeModal onClose={() => setShowRechargeModal(false)} />
      )}
    </div>
  );
}
