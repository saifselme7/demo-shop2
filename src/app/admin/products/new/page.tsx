import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ProductForm } from '@/components/admin/ProductForm'
import { Category } from '@/types/database'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const supabase = createClient()

  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  const categories = (categoriesData as Category[]) || []

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Add New Product"
        description="Publish a new product item directly into Supabase."
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
        <ProductForm categories={categories} isEditing={false} />
      </div>
    </div>
  )
}
