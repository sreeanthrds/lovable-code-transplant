import React, { useState, useEffect } from 'react';

interface Payment {
  payment_id: string;
  order_id: string;
  amount: number;
  status: string;
  date: string;
}

export const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/billing/payments');
      const data = await response.json();
      setPayments(data.payments || []);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'captured':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'authorized':
        return 'text-amber-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Payment History</h2>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Payment History</h2>
      
      {payments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No payments found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Payment ID</th>
                <th className="text-left py-3 px-4">Order ID</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.payment_id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{payment.date}</td>
                  <td className="py-3 px-4">₹{payment.amount / 100}</td>
                  <td className={`py-3 px-4 font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </td>
                  <td className="py-3 px-4 font-mono text-sm">{payment.payment_id}</td>
                  <td className="py-3 px-4 font-mono text-sm">{payment.order_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
