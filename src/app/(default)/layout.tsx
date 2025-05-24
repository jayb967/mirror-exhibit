'use client';

import DefaultLayout from '@/layouts/DefaultLayout';

export default function DefaultTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DefaultLayout>{children}</DefaultLayout>;
}
