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
        const { data: ledger } = await supabase
          .from('coin_ledger')
          .select('amount')
          .eq('user_id', user!.id);
          
        const coins = ledger?.reduce((sum, txn) => sum + txn.amount, 0) || 0;
        setTotalCoins(coins);

        // Fetch rewards
        const { data: dbRewards } = await supabase
          .from('rewards')
          .select('*')
          .eq('is_active', true)
          .order('cost', { ascending: true });

        // Map DB rewards to UI rewards
        const mappedRewards: RewardData[] = (dbRewards || []).map((r, index) => {
          // Provide some default colors and icons if not in DB
          const colors = {
            "Bronze": "#CD7F32",
            "Silver": "#C0C0C0",
            "Gold": "#FFD700",
            "Platinum": "#E5E4E2"
          };
          
          let tier = r.tier || "Bronze";
          if (!colors[tier as keyof typeof colors]) tier = "Bronze";
          
          const color = colors[tier as keyof typeof colors];

          return {
            id: r.slug || r.id,
            title: r.title,
            description: r.description || "Earn rewards by learning.",
            cost: r.cost,
            tier: tier as "Bronze" | "Silver" | "Gold" | "Platinum",
            icon: r.icon || "🎁",
            available: coins >= r.cost,
            color
          };
        });

        setRewards(mappedRewards);
      } catch (e) {
        console.error("Failed to load rewards data:", e);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id || guestMode) {
      fetchRewards();
    }
  }, [user?.id, guestMode]);

  return { rewards, totalCoins, loading };
}
