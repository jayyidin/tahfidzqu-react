import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0a120f] text-slate-800 dark:text-gray-200">
      <h2 className="text-4xl font-bold mb-4">Not Found</h2>
      <p className="mb-8">Could not find requested resource</p>
      <Link href="/" className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors">
        Return Home
      </Link>
    </div>
  )
}
