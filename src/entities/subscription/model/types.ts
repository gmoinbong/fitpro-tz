export interface WebhookEvent {
  eventId: string;
  type: string;
  createdAt: string;
  data: {
    userEmail: string;
    planName?: string;
    amount?: number;
    currency?: string;
    reason?: string;
  };
}

export interface UserSubscription {
  email: string;
  status: 'active' | 'cancelled' | 'refunded' | 'none';
  planName: string | null;
  startDate: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  refundedAmount: number | null;
  failedPaymentCount: number;
}
