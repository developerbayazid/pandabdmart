export function PageSpinner() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-6 h-6 border-2 border-border border-t-text-primary rounded-full animate-spin" />
        </div>
    );
}
