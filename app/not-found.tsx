import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-4">
      <div className="w-24 h-24 bg-primary-5 rounded-full flex items-center justify-center mb-6 text-primary-1">
        <span className="text-4xl font-bold">404</span>
      </div>
      <h1 className="text-3xl font-bold text-grey-1 mb-2">Page Not Found</h1>
      <p className="text-grey-2 mb-8 max-w-md">
        We couldn&apos;t find the page you were looking for. It might have been moved or deleted.
      </p>
      <Link 
        href="/dashboard" 
        className="flex items-center gap-2 px-6 py-3 bg-primary-1 text-white rounded-xl font-medium hover:bg-primary-2 transition-colors"
      >
        <Home className="w-5 h-5" />
        Back to Dashboard
      </Link>
    </div>
  );
}
