import { useMemo, useState } from 'react';
import { useCartStore } from '@/lib/store';

const money = (amount: string, currencyCode: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(Number(amount));

export default function CartPanel() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.price.amount) * item.quantity, 0), [items]);
  const currency = items[0]?.price.currencyCode || 'USD';

  async function checkout() {
    setBusy(true);
    setStatus('Verifying current prices and stock with the commerce server…');
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines: items.map((item) => ({ merchandiseId: item.variantId, quantity: item.quantity })) })
    });

    const payload = await response.json();
    if (!response.ok) {
      setBusy(false);
      setStatus(payload.error || 'Checkout could not be started.');
      return;
    }

    clearCart();
    window.location.href = payload.checkoutUrl;
  }

  return (
    <aside className="forge-panel p-4 lg:sticky lg:top-4" aria-label="Cart">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-2xl">Cart</h2>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-ui uppercase text-highlight">{items.length} lines</span>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-text/70">Your cart is empty. Add a variant to unlock hosted Shopify checkout.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {items.map((item) => (
            <div className="border-b border-border pb-3" key={item.variantId}>
              <div className="font-ui text-sm uppercase text-highlight">{item.productTitle}</div>
              <div className="text-sm text-text/70">{item.variantTitle} · SKU {item.sku}</div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <input
                  className="w-20 rounded-md border border-border bg-bg px-3 py-2"
                  min="1"
                  max="25"
                  type="number"
                  value={item.quantity}
                  onChange={(event) => updateQuantity(item.variantId, Number(event.currentTarget.value))}
                  aria-label={`Quantity for ${item.productTitle}`}
                />
                <span>{money(item.price.amount, item.price.currencyCode)}</span>
                <button className="text-xs uppercase text-text/60 hover:text-highlight" onClick={() => removeItem(item.variantId)}>Remove</button>
              </div>
            </div>
          ))}

          <div className="flex justify-between font-heading text-xl">
            <span>Subtotal</span>
            <span>{money(String(subtotal), currency)}</span>
          </div>
          <p className="text-xs text-text/60">Taxes and shipping are calculated in hosted checkout using configured Shopify tax and shipping zones.</p>
          <button
            className="w-full rounded-md border border-glow bg-glow/10 px-4 py-3 font-ui uppercase tracking-wider text-highlight shadow-ember transition hover:bg-glow/20 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={busy}
            onClick={checkout}
          >
            {busy ? 'Starting checkout…' : 'Hosted checkout'}
          </button>
        </div>
      )}
      {status && <p className="mt-3 rounded-md border border-border bg-bg/70 p-3 text-sm text-text/80">{status}</p>}
    </aside>
  );
}
