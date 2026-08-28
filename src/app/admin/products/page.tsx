import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ProductListTable } from '@/components/admin/ProductListTable'
import { Product, Category } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const supabase = createClient()

  // Fetch all products
  const { data: productsData } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .order('created_at', { ascending: false })

  // Fetch all categories for filter options
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  const products = (productsData as unknown as Product[]) || []
  const categories = (categoriesData as Category[]) || []

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Products Inventory"
        description="Add, edit, delete, and adjust prices or availability of your store products."
      />

      <div className="p-6 sm:p-8 max-w-7xl w-full">
        <ProductListTable
          initialProducts={products}
          categories={categories}
        />
      </div>
    </div>
  )
}
