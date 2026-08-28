import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { OrdersManager } from '@/components/admin/OrdersManager'
import { Order, OrderItem } from '@/types/database'

export const dynamic = 'force-dynamic'

export interface OrderWithItems extends Order {
  order_items: OrderItem[]
}

export default async function AdminOrdersPage() {
  const supabase = createClient()

  const { data: ordersData } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  const orders = (ordersData as unknown as OrderWithItems[]) || []

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="إدارة الطلبات"
        description="اعرض كل الطلبات وراجع إثباتات الدفع وقم بالموافقة أو الرفض."
      />
      <div className="p-6 sm:p-8 max-w-7xl w-full">
        <OrdersManager initialOrders={orders} />
      </div>
    </div>
  )
}
