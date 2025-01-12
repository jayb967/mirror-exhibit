'use client'
import { useSelector } from "react-redux";
import EmptyBag from "./EmptyBag";
import CartArea from "./CartArea";



const ShoppingBagArea = () => {
  const productItem = useSelector((state: any) => state.cart.cart);
  
  let content = null;
  if (productItem.length === 0) content = <EmptyBag />
  if (productItem.length > 0) content = <CartArea />;

  return (
    <>
      <section className="wishlist-area pt-80 pb-80">
        <div className="container">{content}</div>
      </section>
    </>
  );
};

export default ShoppingBagArea;