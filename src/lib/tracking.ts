/**
 * Meta Pixel & GTM tracking helpers.
 * All calls are safe to invoke even if fbq / dataLayer are not loaded.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

/* ── helpers ─────────────────────────────────────────────────── */

const fbq = (...args: unknown[]) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(...args);
  }
};

const pushDataLayer = (event: Record<string, unknown>) => {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
  }
};

/* ── deduplication ───────────────────────────────────────────── */

const firedEvents = new Set<string>();

const dedupeKey = (event: string, id?: string) =>
  id ? `${event}:${id}` : event;

const shouldFire = (event: string, id?: string): boolean => {
  const key = dedupeKey(event, id);
  if (firedEvents.has(key)) return false;
  firedEvents.add(key);
  return true;
};

/* ── public API ──────────────────────────────────────────────── */

export const trackViewContent = (params: {
  product_name: string;
  price: number;
  product_id: string;
}) => {
  if (!shouldFire("ViewContent", params.product_id)) return;

  fbq("track", "ViewContent", {
    content_name: params.product_name,
    content_ids: [params.product_id],
    content_type: "product",
    value: params.price,
    currency: "BDT",
  });

  pushDataLayer({
    event: "view_content",
    product_name: params.product_name,
    price: params.price,
    product_id: params.product_id,
  });
};

export const trackAddToCart = (params: {
  product_name: string;
  price: number;
  quantity: number;
  product_id: string;
}) => {
  fbq("track", "AddToCart", {
    content_name: params.product_name,
    content_ids: [params.product_id],
    content_type: "product",
    value: params.price * params.quantity,
    currency: "BDT",
    num_items: params.quantity,
  });

  pushDataLayer({
    event: "add_to_cart",
    product_name: params.product_name,
    price: params.price,
    quantity: params.quantity,
    product_id: params.product_id,
  });
};

export const trackInitiateCheckout = (params: {
  value: number;
  num_items: number;
  content_ids?: string[];
}) => {
  if (!shouldFire("InitiateCheckout")) return;

  fbq("track", "InitiateCheckout", {
    value: params.value,
    currency: "BDT",
    num_items: params.num_items,
    ...(params.content_ids ? { content_ids: params.content_ids, content_type: "product" } : {}),
  });

  pushDataLayer({
    event: "initiate_checkout",
    value: params.value,
    num_items: params.num_items,
  });
};

export const trackAddPaymentInfo = (params: {
  value: number;
}) => {
  if (!shouldFire("AddPaymentInfo")) return;

  fbq("track", "AddPaymentInfo", {
    value: params.value,
    currency: "BDT",
  });

  pushDataLayer({
    event: "add_payment_info",
    value: params.value,
  });
};

export const trackPurchase = (params: {
  product_name: string;
  quantity: number;
  total_price: number;
  currency?: string;
  order_id?: string;
  content_ids?: string[];
  num_items?: number;
}) => {
  const id = params.order_id;
  if (id && !shouldFire("Purchase", id)) return;

  fbq("track", "Purchase", {
    content_name: params.product_name,
    value: params.total_price,
    currency: params.currency || "BDT",
    num_items: params.num_items ?? params.quantity,
    ...(params.content_ids ? { content_ids: params.content_ids, content_type: "product" } : {}),
  });

  pushDataLayer({
    event: "purchase",
    product_name: params.product_name,
    quantity: params.quantity,
    total_price: params.total_price,
    currency: params.currency || "BDT",
    order_id: id,
  });
};
