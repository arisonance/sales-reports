'use client'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  isDeleting?: boolean
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-bold text-foreground uppercase tracking-wide mb-2">
            {title}
          </h3>
          <p className="text-foreground opacity-80">
            {message}
          </p>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 border-2 border-card-border rounded-lg text-foreground hover:bg-muted/50 transition-colors font-semibold uppercase tracking-wide text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold uppercase tracking-wide text-sm disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
