import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="text-center max-w-md">
                <h1 className="text-4xl font-semibold text-text-primary mb-2">404</h1>
                <p className="text-base text-text-secondary mb-6">
                    The page you are looking for does not exist or has been moved.
                </p>
                <Link href="/">
                    <Button variant="primary">Go home</Button>
                </Link>
            </div>
        </div>
    );
}
