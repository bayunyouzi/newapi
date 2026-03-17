"use client";
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/recharge?password=${password}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setIsLoggedIn(true);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('获取失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (orderId: string, action: 'approve' | 'reject') => {
    if (!confirm(action === 'approve' ? '确定通过此订单并充值吗？' : '确定拒绝此订单吗？')) return;
    
    try {
      const res = await fetch('/api/admin/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, orderId, action })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchOrders();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('操作失败');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">管理员登录</h1>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="请输入管理员密码"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
          />
          <button
            onClick={fetchOrders}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
          >
            登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">充值订单管理</h1>
          <button 
            onClick={fetchOrders}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            刷新列表
          </button>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold text-gray-600">时间</th>
                <th className="p-4 font-semibold text-gray-600">用户</th>
                <th className="p-4 font-semibold text-gray-600">金额</th>
                <th className="p-4 font-semibold text-gray-600">支付备注</th>
                <th className="p-4 font-semibold text-gray-600">状态</th>
                <th className="p-4 font-semibold text-gray-600 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-800">
                    {order.user?.email}
                  </td>
                  <td className="p-4 text-lg font-bold text-blue-600">
                    ¥{order.amount}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {order.paymentId || '-'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                      order.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {order.status === 'PENDING' ? '待审核' :
                       order.status === 'APPROVED' ? '已通过' : '已拒绝'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAction(order.id, 'approve')}
                          className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                        >
                          通过
                        </button>
                        <button
                          onClick={() => handleAction(order.id, 'reject')}
                          className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                          拒绝
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    暂无订单数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
