// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';


import CustomerList from '@/components/admin/customers/CustomerList'

export default function CustomersPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Customers</h1>
      <CustomerList />
    </div>
  )
}