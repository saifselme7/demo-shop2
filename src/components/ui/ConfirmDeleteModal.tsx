'use client'

import React from 'react'
import { Modal } from './Modal'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  itemName?: string
  isLoading?: boolean
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false,
}: ConfirmDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        
        <p className="text-sm text-slate-600 mb-2">{message}</p>
        
        {itemName && (
          <div className="my-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 w-full font-semibold text-slate-800 text-sm">
            "{itemName}"
          </div>
        )}
        
        <p className="text-xs text-red-500 mt-1 mb-6">
          This action is permanent and cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-3 w-full border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-red-200"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
