import { useState } from 'react';
import { X, Check, Copy } from 'lucide-react';

const AMOUNTS = [1, 5, 10, 20, 50, 100];

export default function RechargeModal({ onClose }: { onClose: () => void }) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [paymentId, setPaymentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!selectedAmount) return;
    setLoading(true);
    try {
      const res = await fetch('/api/recharge/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: selectedAmount,
          paymentId: paymentId || '扫码支付'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        alert(data.message || '提交失败');
      }
    } catch (error) {
      alert('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 z-10"
        >
          <X size={20} />
        </button>

        {success ? (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-6">
              <Check size={40} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">提交成功</h2>
            <p className="text-gray-600 mb-8">您的充值申请已提交，管理员审核通过后将自动到账。<br/>请耐心等待。</p>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              知道了
            </button>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">账户充值</h2>
              <p className="text-sm text-gray-500 mt-1">请选择充值金额，扫码支付后提交审核</p>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {!selectedAmount ? (
                <div className="grid grid-cols-3 gap-4">
                  {AMOUNTS.map(amount => (
                    <button
                      key={amount}
                      onClick={() => setSelectedAmount(amount)}
                      className="aspect-[4/3] flex flex-col items-center justify-center gap-1 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <span className="text-2xl font-black text-gray-800 group-hover:text-blue-600">¥{amount}</span>
                      <span className="text-xs text-gray-400 group-hover:text-blue-400">点击充值</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <button 
                    onClick={() => setSelectedAmount(null)}
                    className="self-start text-sm text-gray-500 hover:text-gray-800 mb-4 flex items-center gap-1"
                  >
                    ← 返回选择金额
                  </button>
                  
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-6 w-full flex flex-col items-center">
                    <p className="text-sm text-gray-500 mb-3">请使用微信/支付宝扫描下方二维码支付 <span className="text-red-500 font-bold text-lg mx-1">¥{selectedAmount}</span></p>
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                      {/* 这里假设 public 目录下有 1.jpg, 5.jpg 等 */}
                      <img 
                        src={`/${selectedAmount}.jpg`} 
                        alt={`支付 ${selectedAmount} 元`}
                        className="w-48 h-48 object-contain"
                        onError={(e) => {
                          // Fallback if jpg fails
                          (e.target as HTMLImageElement).src = `/${selectedAmount}.png`;
                        }}
                      />
                    </div>
                  </div>

                  <div className="w-full space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">支付备注 (选填)</label>
                      <input 
                        type="text" 
                        value={paymentId}
                        onChange={e => setPaymentId(e.target.value)}
                        placeholder="请输入您的支付账号或交易单号，方便审核"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/30"
                    >
                      {loading ? '提交中...' : '我已支付，提交审核'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
