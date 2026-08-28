import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ProductForm } from '@/components/admin/ProductForm'
import { Product } from '@/types/database'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface EditProductPageProps {
  params: {
    id: string
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const supabase = createClient()
  const { id } = params

  // Fetch product to edit
  const { data: productData, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !productData) {
    notFound()
  }

  const product = productData as Product

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title={`Edit "${product.name}"`}
        description="Update pricing, stock availability, category, description, and images."
        actionButton={
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Inventory</span>
          </Link>
        }
      />

      <div className="p-6 sm:p-8 max-w-7xl w-full">
        <ProductForm
          initialData={product}
          categories={categories || []}
          isEditing={true}
        />
      </div>
    </div>
  )
}
