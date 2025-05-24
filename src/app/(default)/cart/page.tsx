'use client';

import CartPage from '@/app/cart/CartPage';
import Breadcrumb from '@/components/common/Breadcrumb';

export default function Page() {
  return (
    <>
      <Breadcrumb title='Shopping Cart' subtitle='Cart' />
      <CartPage />
    </>
  );
}
