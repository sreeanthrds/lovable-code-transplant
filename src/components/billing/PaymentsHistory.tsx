import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Receipt, ChevronDown, Download } from 'lucide-react';
import type { PaymentRecord } from '@/types/billing';

interface PaymentsHistoryProps {
  payments: PaymentRecord[];
}

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'captured':
      return { text: 'Paid', class: 'bg-success/20 text-success border-success/30' };
    case 'failed':
      return { text: 'Failed', class: 'bg-destructive/20 text-destructive border-destructive/30' };
    case 'authorized':
      return { text: 'Pending', class: 'bg-warning/20 text-warning border-warning/30' };
    case 'refunded':
      return { text: 'Refunded', class: 'bg-info/20 text-info border-info/30' };
    default:
      return { text: status, class: 'bg-muted text-muted-foreground' };
  }
};

const formatAmount = (amount: number) => {
  // Amount comes in paise, convert to rupees
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount / 100);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const PaymentsHistory: React.FC<PaymentsHistoryProps> = ({ payments }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="glass-card">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10 text-info">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-medium">Payment History</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {payments.length} transaction{payments.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {payments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No payments yet
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => {
                  const statusBadge = getStatusBadge(payment.status);
                  return (
                    <div 
                      key={payment.payment_id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          {payment.description || 'Payment'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(payment.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{formatAmount(payment.amount)}</p>
                          <Badge variant="outline" className={statusBadge.class}>
                            {statusBadge.text}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
