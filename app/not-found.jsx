import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-black text-white flex-col space-y-4">
      <h2 className="text-4xl font-semibold">404</h2>
      <p className="text-lg">This page could not be found.</p>
      <Link href="/" className="text-blue-500 underline">
        Return Home
      </Link>
    </div>
  );
}
