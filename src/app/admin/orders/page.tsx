import OrderList from '@/components/admin/orders/OrderList'

export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Orders</h1>
      <OrderList />
    </div>
  )
}