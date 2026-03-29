import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <h2 className="text-4xl font-bold">404 - Not Found</h2>
      <p className="mt-4 text-gray-600">Could not find requested resource</p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
      >
        Return Home
      </Link>
    </div>
  );
}
