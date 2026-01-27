import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, RefreshCw, Download, Receipt, CheckCircle, XCircle, Clock, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserPaymentHistory, PaymentHistory } from '@/lib/services/payment-service';
import { PLAN_CONFIGS } from '@/types/billing';
import { format } from 'date-fns';

const UserPaymentHistoryTab: React.FC = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);

  const loadPayments = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await getUserPaymentHistory(user.id);
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [user?.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'captured':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'refunded':
        return <Undo2 className="w-4 h-4 text-yellow-500" />;
      case 'pending':
      case 'authorized':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'captured':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'refunded':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const totalSpent = payments
    .filter(p => p.status === 'captured')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-white/60">Total Payments</p>
                <p className="text-2xl font-bold text-white/95">{payments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Receipt className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-white/60">Total Spent</p>
                <p className="text-2xl font-bold text-white/95">₹{totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-white/60">Successful</p>
                <p className="text-2xl font-bold text-white/95">
                  {payments.filter(p => p.status === 'captured').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History Table */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white/95">
                <Receipt className="w-5 h-5 text-primary" />
                Payment History
              </CardTitle>
              <CardDescription className="text-white/60">
                All your transactions with TradeLayout
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadPayments}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-white/80 mb-2">No payments yet</h3>
              <p className="text-white/50">
                Your payment history will appear here after you make a purchase
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white/70">Date</TableHead>
                  <TableHead className="text-white/70">Description</TableHead>
                  <TableHead className="text-white/70">Amount</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-white/70">Payment ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="border-white/10">
                    <TableCell className="text-white/80">
                      {format(new Date(payment.created_at), 'MMM dd, yyyy')}
                      <br />
                      <span className="text-xs text-white/50">
                        {format(new Date(payment.created_at), 'HH:mm')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-white/90">
                          {payment.plan_type 
                            ? `${PLAN_CONFIGS[payment.plan_type]?.name || payment.plan_type} Plan`
                            : 'Payment'
                          }
                        </p>
                        {payment.billing_cycle && (
                          <p className="text-xs text-white/50 capitalize">
                            {payment.billing_cycle} billing
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-white/90">
                      ₹{payment.amount.toLocaleString()}
                      {payment.refund_amount && (
                        <span className="text-xs text-yellow-500 ml-2">
                          (-₹{payment.refund_amount})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <Badge variant={getStatusBadgeVariant(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded">
                        {payment.payment_id?.slice(0, 16)}...
                      </code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invoice Download Note */}
      <Card className="glass-card border-white/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 text-primary mt-1" />
            <div>
              <h4 className="font-medium text-white/90 mb-1">Need an invoice?</h4>
              <p className="text-sm text-white/60">
                Contact support@tradelayout.in with your payment ID to request a detailed invoice
                for your records or tax purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPaymentHistoryTab;
