export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-border border-t-text-primary rounded-full animate-spin" />
                <p className="text-sm text-text-secondary">Loading...</p>
            </div>
        </div>
    );
}
