import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { CategoryListManager } from '@/components/admin/CategoryListManager'
import { Category } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  const supabase = createClient()

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  const categories = (categoriesData as Category[]) || []

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Categories Management"
        description="Create, update, and manage product menu categories."
      />

      <div className="p-6 sm:p-8 max-w-7xl w-full">
        <CategoryListManager initialCategories={categories} />
      </div>
    </div>
  )
}
