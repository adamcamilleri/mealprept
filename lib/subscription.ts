export interface Subscription {
  plan_type: string;
  status: string;
  current_period_end?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
}

export function hasProAccess(subscription: Subscription | null): boolean {
  if (!subscription) return false;
  if (subscription.plan_type !== 'pro') return false;
  if (subscription.status === 'active') return true;
  if (subscription.status === 'canceled' && subscription.current_period_end) {
    return new Date(subscription.current_period_end) > new Date();
  }
  return false;
}
