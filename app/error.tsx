'use client'
 
import { useEffect } from 'react'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])
 
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0a120f] text-slate-800 dark:text-gray-200">
      <h2 className="text-4xl font-bold mb-4">Something went wrong!</h2>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
