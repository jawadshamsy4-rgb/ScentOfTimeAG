import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DeliveryCharges {
  inside: number;
  outside: number;
}

const DEFAULTS: DeliveryCharges = { inside: 60, outside: 120 };

export const fetchDeliveryCharges = async (): Promise<DeliveryCharges> => {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["delivery_charge_inside", "delivery_charge_outside"]);

  if (error || !data?.length) return DEFAULTS;

  const map: Record<string, number> = {};
  for (const row of data) {
    map[row.key] = typeof row.value === "number" ? row.value : Number(row.value);
  }

  return {
    inside: map["delivery_charge_inside"] ?? DEFAULTS.inside,
    outside: map["delivery_charge_outside"] ?? DEFAULTS.outside,
  };
};

export const useDeliveryCharges = () => {
  return useQuery({
    queryKey: ["delivery-charges"],
    queryFn: fetchDeliveryCharges,
    staleTime: 60_000,
  });
};
