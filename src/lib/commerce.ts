export type Money = {
  amount: string;
  currencyCode: string;
};

export type CommerceVariant = {
  id: string;
  title: string;
  sku: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: Money;
  selectedOptions: Array<{ name: string; value: string }>;
};

export type CommerceProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  featuredImage: { url: string; altText: string | null } | null;
  variants: CommerceVariant[];
  shippingProfile: {
    origin: string;
    estimate: string;
    returnWindow: string;
  };
  provider: {
    name: string;
    skuPrefix: string;
  };
};

const demoProducts: CommerceProduct[] = [
  {
    id: 'demo-forge-pack',
    handle: 'dark-prompt-forge-pack',
    title: 'Dark Prompt Forge Pack',
    description: 'Prompt bundles, system rituals, and reusable creative workflows delivered as a digital download.',
    vendor: 'Strange Stone Works',
    productType: 'Digital Prompt Pack',
    tags: ['Prompt Packs', 'Digital', 'Instant Delivery'],
    featuredImage: null,
    shippingProfile: { origin: 'Digital fulfillment', estimate: 'Instant email delivery', returnWindow: '14-day refund window for non-downloaded files' },
    provider: { name: 'Shopify Digital Downloads', skuPrefix: 'SSW-DIG' },
    variants: [
      {
        id: 'gid://shopify/ProductVariant/demo-forge-pack-standard',
        title: 'Standard License',
        sku: 'SSW-DIG-FORGE-STD',
        availableForSale: true,
        quantityAvailable: 999,
        price: { amount: '14.99', currencyCode: 'USD' },
        selectedOptions: [{ name: 'License', value: 'Standard' }]
      },
      {
        id: 'gid://shopify/ProductVariant/demo-forge-pack-studio',
        title: 'Studio License',
        sku: 'SSW-DIG-FORGE-STUDIO',
        availableForSale: true,
        quantityAvailable: 250,
        price: { amount: '39.99', currencyCode: 'USD' },
        selectedOptions: [{ name: 'License', value: 'Studio' }]
      }
    ]
  },
  {
    id: 'demo-workflow-templates',
    handle: 'ai-workflow-templates',
    title: 'AI Workflow Templates',
    description: 'Operations templates for creator systems, launches, automations, and repeatable AI-assisted production.',
    vendor: 'Strange Stone Works',
    productType: 'Template System',
    tags: ['Templates', 'Digital', 'Operations'],
    featuredImage: null,
    shippingProfile: { origin: 'Digital fulfillment', estimate: 'Instant email delivery', returnWindow: '14-day refund window for non-downloaded files' },
    provider: { name: 'Shopify Digital Downloads', skuPrefix: 'SSW-TPL' },
    variants: [
      {
        id: 'gid://shopify/ProductVariant/demo-workflows-basic',
        title: 'Creator Kit',
        sku: 'SSW-TPL-WORK-CREATOR',
        availableForSale: true,
        quantityAvailable: 500,
        price: { amount: '24.99', currencyCode: 'USD' },
        selectedOptions: [{ name: 'Edition', value: 'Creator' }]
      },
      {
        id: 'gid://shopify/ProductVariant/demo-workflows-operator',
        title: 'Operator Kit',
        sku: 'SSW-TPL-WORK-OPERATOR',
        availableForSale: true,
        quantityAvailable: 300,
        price: { amount: '49.99', currencyCode: 'USD' },
        selectedOptions: [{ name: 'Edition', value: 'Operator' }]
      }
    ]
  },
  {
    id: 'demo-black-book',
    handle: 'writers-black-book',
    title: "Writer's Black Book",
    description: 'Theory prompts, story architecture maps, and reusable structures for long-form creative work.',
    vendor: 'Strange Stone Works',
    productType: 'Print-on-demand Notebook',
    tags: ['Writing', 'Printful', 'Physical'],
    featuredImage: null,
    shippingProfile: { origin: 'Printful US/EU routing', estimate: '5–9 business days after production', returnWindow: '30-day damaged/defective replacement policy' },
    provider: { name: 'Printful', skuPrefix: 'SSW-PF' },
    variants: [
      {
        id: 'gid://shopify/ProductVariant/demo-book-paperback',
        title: 'Paperback',
        sku: 'SSW-PF-BLACKBOOK-PAPER',
        availableForSale: true,
        quantityAvailable: 80,
        price: { amount: '13.99', currencyCode: 'USD' },
        selectedOptions: [{ name: 'Format', value: 'Paperback' }]
      },
      {
        id: 'gid://shopify/ProductVariant/demo-book-hardcover',
        title: 'Hardcover',
        sku: 'SSW-PF-BLACKBOOK-HARD',
        availableForSale: true,
        quantityAvailable: 35,
        price: { amount: '23.99', currencyCode: 'USD' },
        selectedOptions: [{ name: 'Format', value: 'Hardcover' }]
      }
    ]
  }
];

const productsQuery = `#graphql
  query Products($first: Int!) {
    products(first: $first) {
      nodes {
        id
        handle
        title
        description
        vendor
        productType
        tags
        featuredImage { url altText }
        variants(first: 50) {
          nodes {
            id
            title
            sku
            availableForSale
            quantityAvailable
            price { amount currencyCode }
            selectedOptions { name value }
          }
        }
      }
    }
  }
`;

const cartCreateMutation = `#graphql
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

function shopifyEndpoint() {
  const domain = import.meta.env.SHOPIFY_STORE_DOMAIN ?? import.meta.env.PUBLIC_SHOPIFY_STORE_DOMAIN;
  if (!domain) return null;
  const cleanDomain = String(domain).replace(/^https?:\/\//, '').replace(/\/$/, '');
  return `https://${cleanDomain}/api/2025-04/graphql.json`;
}

function storefrontToken() {
  return import.meta.env.SHOPIFY_STOREFRONT_TOKEN ?? import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? null;
}

async function shopifyRequest<T>(query: string, variables: Record<string, unknown>): Promise<T | null> {
  const endpoint = shopifyEndpoint();
  const token = storefrontToken();
  if (!endpoint || !token) return null;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': String(token)
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    throw new Error(`Shopify Storefront API returned ${response.status}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error: { message: string }) => error.message).join('; '));
  }

  return payload.data as T;
}

function withOperationalMetadata(product: CommerceProduct): CommerceProduct {
  const physical = /physical|print|apparel|book/i.test(`${product.productType} ${product.tags.join(' ')}`);
  const providerName = physical ? 'Printful / DSers mapped SKU' : 'Shopify Digital Downloads';
  const skuPrefix = product.variants[0]?.sku?.split('-').slice(0, 2).join('-') || 'SSW';

  return {
    ...product,
    shippingProfile: physical
      ? { origin: 'Dropship provider routing', estimate: '5–9 business days after production', returnWindow: '30-day damaged/defective replacement policy' }
      : { origin: 'Digital fulfillment', estimate: 'Instant email delivery', returnWindow: '14-day refund window for non-downloaded files' },
    provider: { name: providerName, skuPrefix }
  };
}

export async function getProducts(): Promise<CommerceProduct[]> {
  const data = await shopifyRequest<{ products: { nodes: Array<Omit<CommerceProduct, 'variants' | 'shippingProfile' | 'provider'> & { variants: { nodes: CommerceVariant[] } }> } }>(productsQuery, { first: 24 });
  if (!data) return demoProducts;

  return data.products.nodes.map((product) => withOperationalMetadata({
    ...product,
    variants: product.variants.nodes,
    shippingProfile: demoProducts[0].shippingProfile,
    provider: demoProducts[0].provider
  }));
}

export async function getProductByHandle(handle: string) {
  const safeHandle = handle.replace(/[^a-z0-9-]/gi, '').toLowerCase();
  const products = await getProducts();
  return products.find((product) => product.handle === safeHandle) ?? null;
}

export async function createCheckout(lines: Array<{ merchandiseId: string; quantity: number }>) {
  const products = await getProducts();
  const allowedVariants = new Map(products.flatMap((product) => product.variants.map((variant) => [variant.id, variant])));
  const verifiedLines = lines
    .map((line) => ({ merchandiseId: String(line.merchandiseId), quantity: Math.min(Math.max(Number(line.quantity) || 1, 1), 25) }))
    .filter((line) => allowedVariants.get(line.merchandiseId)?.availableForSale);

  if (!verifiedLines.length) {
    throw new Error('No available products were found in the cart.');
  }

  const data = await shopifyRequest<{ cartCreate: { cart: { checkoutUrl: string } | null; userErrors: Array<{ message: string }> } }>(cartCreateMutation, {
    input: { lines: verifiedLines }
  });

  if (!data) {
    const encodedLines = encodeURIComponent(JSON.stringify(verifiedLines));
    return { checkoutUrl: `/store/checkout-demo?lines=${encodedLines}` };
  }

  if (data.cartCreate.userErrors.length || !data.cartCreate.cart) {
    throw new Error(data.cartCreate.userErrors.map((error) => error.message).join('; ') || 'Shopify checkout could not be created.');
  }

  return { checkoutUrl: data.cartCreate.cart.checkoutUrl };
}

export function formatMoney(money: Money) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: money.currencyCode }).format(Number(money.amount));
}
