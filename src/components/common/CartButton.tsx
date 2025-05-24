"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCart } from '@/contexts/CartContext';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface CartButtonProps {
  className?: string;
}

export default function CartButton({ className = "" }: CartButtonProps) {
  const { itemCount } = useCart();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleClick = () => {
    router.push('/cart');
  };

  return (
    <button
      onClick={handleClick}
      className={`tw-relative tw-inline-flex tw-items-center tw-justify-center ${className}`}
      aria-label="Cart"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="tw-h-6 tw-w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>

      {/* Cart items counter */}
      {itemCount > 0 && (
        <span className="tw-absolute tw-top-0 tw-right-0 tw-inline-flex tw-items-center tw-justify-center tw-px-2 tw-py-1 tw-text-xs tw-font-bold tw-leading-none tw-text-white tw-transform tw-translate-x-1/2 tw--translate-y-1/2 tw-bg-red-600 tw-rounded-full">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}