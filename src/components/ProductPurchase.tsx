import { useMemo, useState } from 'react';
import type { CommerceProduct } from '@/lib/commerce';
import { useCartStore } from '@/lib/store';

const money = (amount: string, currencyCode: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(Number(amount));

export default function ProductPurchase({ product }: { product: CommerceProduct }) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState('');
  const addItem = useCartStore((state) => state.addItem);
  const variant = useMemo(() => product.variants.find((item) => item.id === variantId) || product.variants[0], [product.variants, variantId]);

  if (!variant) {
    return <p className="forge-panel p-4 text-sm text-red-200">No purchasable variants are configured for this product.</p>;
  }

  function addToCart() {
    if (!variant.availableForSale) {
      setNotice('This variant is currently out of stock.');
      return;
    }

    addItem({
      productHandle: product.handle,
      productTitle: product.title,
      variantId: variant.id,
      variantTitle: variant.title,
      sku: variant.sku,
      price: variant.price,
      quantity
    });
    setNotice(`${variant.title} added to cart. Pricing is verified again before checkout.`);
  }

  return (
    <section className="forge-panel p-5">
      <div className="space-y-4">
        <label className="block">
          <span className="font-ui text-xs uppercase tracking-widest text-highlight">Variant</span>
          <select className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-3" value={variantId} onChange={(event) => setVariantId(event.currentTarget.value)}>
            {product.variants.map((item) => (
              <option key={item.id} value={item.id}>{item.title} — {money(item.price.amount, item.price.currencyCode)}</option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-bg/50 p-3">
            <div className="text-xs uppercase text-text/50">Stock</div>
            <div className="font-ui text-lg text-highlight">{variant.availableForSale ? `${variant.quantityAvailable ?? 'Limited'} available` : 'Out of stock'}</div>
          </div>
          <div className="rounded-lg border border-border bg-bg/50 p-3">
            <div className="text-xs uppercase text-text/50">Shipping</div>
            <div className="font-ui text-lg text-highlight">{product.shippingProfile.estimate}</div>
          </div>
        </div>

        <label className="block">
          <span className="font-ui text-xs uppercase tracking-widest text-highlight">Quantity</span>
          <input className="mt-2 w-28 rounded-md border border-border bg-bg px-3 py-3" min="1" max="25" type="number" value={quantity} onChange={(event) => setQuantity(Math.min(Math.max(Number(event.currentTarget.value) || 1, 1), 25))} />
        </label>

        <button className="w-full rounded-md border border-glow bg-glow/10 px-4 py-3 font-ui uppercase tracking-wider text-highlight shadow-ember transition hover:bg-glow/20 disabled:cursor-not-allowed disabled:opacity-50" disabled={!variant.availableForSale} onClick={addToCart}>
          Add to cart · {money(variant.price.amount, variant.price.currencyCode)}
        </button>
        {notice && <p className="rounded-md border border-border bg-bg/70 p-3 text-sm text-text/80">{notice}</p>}
      </div>
    </section>
  );
}
