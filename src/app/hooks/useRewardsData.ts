import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface RewardData {
  id: string;
  title: string;
  description: string;
  cost: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  icon: string;
  available: boolean;
  color: string;
}

export function useRewardsData() {
  const { user, guestMode } = useAuth();
  const [rewards, setRewards] = useState<RewardData[]>([]);
  const [totalCoins, setTotalCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRewards() {
      if (!user && !guestMode) {
        setLoading(false);
        return;
      }

      if (guestMode) {
        setTotalCoins(user?.coins || 100);
        setRewards([
            { id: "1", title: "$5 GrabFood Voucher", description: "Enjoy a meal on us", cost: 500, tier: "Bronze", icon: "🍔", available: true, color: "#CD7F32" },
            { id: "2", title: "$10 Popular Voucher", description: "Get your favorite books", cost: 1000, tier: "Silver", icon: "📚", available: true, color: "#C0C0C0" },
            { id: "3", title: "$15 Shopee Voucher", description: "Shop for anything you like", cost: 1500, tier: "Silver", icon: "🛍️", available: false, color: "#C0C0C0" },
        ]);
        setLoading(false);
        return;
      }

      try {
        // Fetch coin balance from ledger
        // coin_ledger columns: id, user_id, amount, reason, created_at
        if (user?.id) {
          const { data: ledger } = await supabase
            .from('coin_ledger')
            .select('amount')
            .eq('user_id', user.id);
            
          const coins = ledger?.reduce((sum, txn) => sum + txn.amount, 0) || 0;
          setTotalCoins(coins);

          // Fetch rewards
          const { data: dbRewards } = await supabase
            .from('rewards')
            .select('*')
            .eq('is_active', true)
            .order('cost', { ascending: true });

          const mappedRewards: RewardData[] = (dbRewards || []).map((r) => {
            const colors = {
              "bronze": "#CD7F32",
              "silver": "#C0C0C0",
              "gold": "#FFD700",
              "platinum": "#E5E4E2"
            };
            
            const tier = r.tier || "bronze";
            const color = colors[tier as keyof typeof colors] || "#CD7F32";

            // Capitalize first letter of tier for display
            const displayTier = tier.charAt(0).toUpperCase() + tier.slice(1);

            return {
              id: r.slug || r.id,
              title: r.title,
              description: r.description || "Earn rewards by learning.",
              cost: r.cost,
              tier: displayTier as "Bronze" | "Silver" | "Gold" | "Platinum",
              icon: r.icon || "🎁",
              available: coins >= r.cost,
              color
            };
          });

          setRewards(mappedRewards);
        }
      } catch (e) {
        console.error("Failed to load rewards data:", e);
      } finally {
        setLoading(false);
      }
    }

    if (user?.auth_id || guestMode) {
      fetchRewards();
    } else {
      setLoading(false);
    }
  }, [user?.auth_id, guestMode]);

  return { rewards, totalCoins, loading };
}
