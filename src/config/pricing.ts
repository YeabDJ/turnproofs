/**
 * TurnProofs Pricing Configuration — Single Source of Truth
 *
 * Internal tier keys (subscription_tier column in airbnb_hosts):
 *   pro        → Solo plan         (1 property)
 *   growth     → Small Team plan   (2-3 properties)
 *   elite      → Growing Portfolio (4-6 properties) ← includes API access
 *   commercial → Commercial plan   (per building)   ← includes API access
 *
 * Update prices here; import into stripe/route.ts and api-keys/route.ts.
 */

export const PRICING_TIERS = {
  pro: {
    name: 'Solo',
    internalKey: 'pro',
    monthlyPrice: 9.00,
    annualMonthly: 7.65,      // 15% off
    annualTotal: 91.80,
    propertiesLimit: 1,
    hasApiAccess: false,
    rateLimit: 0,             // no API access
  },
  growth: {
    name: 'Small Team',
    internalKey: 'growth',
    monthlyPrice: 18.99,
    annualMonthly: 16.14,
    annualTotal: 193.68,
    propertiesLimit: 3,
    hasApiAccess: false,
    rateLimit: 0,
  },
  elite: {
    name: 'Growing Portfolio',
    internalKey: 'elite',
    monthlyPrice: 35.99,      // Updated from $29.99
    annualMonthly: 30.59,     // 15% off
    annualTotal: 367.08,
    propertiesLimit: 6,
    additionalPropertyPrice: 4.99,
    hasApiAccess: true,
    rateLimit: 1000,          // requests/minute
  },
  commercial: {
    name: 'Commercial',
    internalKey: 'commercial',
    monthlyPrice: 89.99,
    annualMonthly: 76.49,
    annualTotal: 917.88,
    propertiesLimit: null,    // per building — no hard limit
    hasApiAccess: true,
    rateLimit: 5000,          // requests/minute
  },
} as const;

export type TierKey = keyof typeof PRICING_TIERS;

/** Tiers that are allowed to generate API keys and call /api/v1/ routes */
export const API_ACCESS_TIERS: readonly TierKey[] = ['elite', 'commercial'] as const;

/** Returns true if the given subscription_tier string has API access */
export function hasApiAccess(tier: string | null | undefined): boolean {
  if (!tier) return false;
  return (API_ACCESS_TIERS as readonly string[]).includes(tier);
}

/** Returns the API rate limit (req/min) for a given tier. Returns 0 for no access. */
export function getRateLimit(tier: string | null | undefined): number {
  if (!tier) return 0;
  const config = PRICING_TIERS[tier as TierKey];
  return config?.rateLimit ?? 0;
}
