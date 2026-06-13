'use client';

import { useState, useCallback, createContext, useContext, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

type Toast = {
    id: string;
    message: string;
    type: ToastType;
};

type ToastContextType = {
    showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const variants = {
        success: 'bg-success-light text-success-foreground border-success',
        error: 'bg-error-light text-error-foreground border-error',
        warning: 'bg-warning-light text-warning-foreground border-warning',
        info: 'bg-info-light text-info-foreground border-info',
    };

    return (
        <div
            className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-md border shadow-lg min-w-[300px] max-w-md',
                'animate-in slide-in-from-right-4 fade-in duration-300',
                variants[toast.type],
            )}
        >
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button onClick={onClose} className="p-1 hover:opacity-70 transition-opacity" aria-label="Dismiss">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
