import ProductForm from '@/components/admin/products/ProductForm'

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Edit Product</h1>
      <ProductForm productId={params.id} />
    </div>
  )
}