import { Users } from 'lucide-react';

type CustomersDemographicProps = {
    totalCustomers: number;
};

export function CustomersDemographic({ totalCustomers }: CustomersDemographicProps) {
    return (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-text-secondary" />
                <h3 className="text-[16px] font-semibold text-text-primary leading-6">
                    Customers Demographic
                </h3>
            </div>

            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="text-[36px] font-semibold text-text-primary leading-[44px]">
                        {totalCustomers.toLocaleString()}
                    </div>
                    <div className="text-[14px] text-text-secondary mt-1">Total Customers</div>
                </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                    <span className="text-[14px] text-text-secondary">New this month</span>
                    <span className="text-[14px] font-medium text-text-primary">—</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[14px] text-text-secondary">Returning</span>
                    <span className="text-[14px] font-medium text-text-primary">—</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[14px] text-text-secondary">Guest checkouts</span>
                    <span className="text-[14px] font-medium text-text-primary">—</span>
                </div>
            </div>
        </div>
    );
}
