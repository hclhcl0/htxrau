import type { Metadata } from 'next';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { unstable_cache } from 'next/cache';
import { OrderForm } from './OrderForm';

export const metadata: Metadata = {
  title: 'Đặt Hàng Rau An Toàn — HTX Rau Túy Loan',
  description:
    'Đặt mua rau củ quả tươi sạch VietGAP từ HTX Rau Túy Loan. Giao hàng tận nơi tại Đà Nẵng. COD hoặc chuyển khoản.',
};

const getProducts = unstable_cache(
  async () => {
    try {
      const payload = await getPayload({ config: configPromise });
      const res = await payload.find({
        collection: 'products',
        where: { status: { not_equals: 'out_of_stock' } },
        sort: 'name',
        limit: 200,
        depth: 0,
      });
      return res.docs.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        unit: p.unit || 'kg',
        slug: p.slug,
      }));
    } catch (e) {
      console.warn('Failed to fetch products for order page, using empty fallback.');
      return [];
    }
  },
  ['products-for-order'],
  { revalidate: 300, tags: ['products'] },
);

const getSiteSettings = unstable_cache(
  async () => {
    try {
      const payload = await getPayload({ config: configPromise });
      const s = (await payload.findGlobal({ slug: 'site-settings', depth: 0 })) as any;
      return {
        phone: s?.header?.hotline?.phone || '0905 559 206',
        bankName: s?.payment?.bankName || '',
        bankAccount: s?.payment?.bankAccount || '',
        bankOwner: s?.payment?.bankOwner || '',
        qrImageUrl: s?.payment?.qrImageUrl || '',
      };
    } catch (e) {
      console.warn('Failed to fetch site-settings for order page, using default fallback.');
      return {
        phone: '0905 559 206',
        bankName: '',
        bankAccount: '',
        bankOwner: '',
        qrImageUrl: '',
      };
    }
  },
  ['site-settings-order'],
  { revalidate: 300, tags: ['site-settings'] },
);

export default async function DatHangPage() {
  const [products, settings] = await Promise.all([getProducts(), getSiteSettings()]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 pb-20">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-green-600 text-white py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-3">🥦</div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
            ĐẶT HÀNG RAU AN TOÀN TÚY LOAN
          </h1>
          <p className="text-emerald-100 text-sm md:text-base">
            Rau tươi sạch VietGAP — Giao tận nơi tại Đà Nẵng · Gọi{' '}
            <a href={`tel:${settings.phone}`} className="font-bold underline">
              {settings.phone}
            </a>
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 mt-8">
        <OrderForm
          products={products}
          hotline={settings.phone}
          bankName={settings.bankName}
          bankAccount={settings.bankAccount}
          bankOwner={settings.bankOwner}
          qrImageUrl={settings.qrImageUrl}
        />
      </div>
    </div>
  );
}
