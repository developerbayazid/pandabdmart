'use client';

import { Home, Briefcase, Heart } from 'lucide-react';
import { ShippingFormData } from '@/types/checkout';
import { getAllCountries, getDivisionsForCountry } from '@/lib/constants/countries';

type Props = {
    value: ShippingFormData;
    onChange: (value: ShippingFormData) => void;
};

const LABELS: { value: 'home' | 'work' | 'partner'; label: string; icon: React.ReactNode }[] = [
    { value: 'home', label: 'Home', icon: <Home className="w-3.5 h-3.5" /> },
    { value: 'work', label: 'Work', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { value: 'partner', label: 'Partner', icon: <Heart className="w-3.5 h-3.5" /> },
];

export function ShippingForm({ value, onChange }: Props) {
    const countries = getAllCountries();
    const divisions = getDivisionsForCountry(value.country);

    const update = (field: keyof ShippingFormData, newValue: string | boolean | 'home' | 'work' | 'partner' | null) => {
        onChange({ ...value, [field]: newValue });
    };

    const handleCountryChange = (country: string) => {
        // Reset division when country changes
        onChange({
            ...value,
            country,
            city: '',
        });
    };

    return (
        <div className="space-y-6">
            {/* Billing Details */}
            <h2 className="text-base font-semibold text-text-primary leading-6">
                Billing Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-text-primary mb-1.5">
                        First name
                    </label>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={value.firstName}
                        onChange={(e) => update('firstName', e.target.value)}
                        className="w-full bg-surface border border-border rounded-md px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                    />
                </div>

                <div>
                    <label className="block text-sm text-text-primary mb-1.5">
                        Last name
                    </label>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={value.lastName}
                        onChange={(e) => update('lastName', e.target.value)}
                        className="w-full bg-surface border border-border rounded-md px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-text-primary mb-1.5">
                        Email address
                    </label>
                    <input
                        type="email"
                        placeholder="Your email"
                        value={value.email}
                        onChange={(e) => update('email', e.target.value)}
                        className="w-full bg-surface border border-border rounded-md px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                    />
                </div>

                <div>
                    <label className="block text-sm text-text-primary mb-1.5">
                        Phone no
                    </label>
                    <input
                        type="tel"
                        placeholder="Your number"
                        value={value.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        className="w-full bg-surface border border-border rounded-md px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                    />
                </div>
            </div>

            {/* Shipping info */}
            <h2 className="text-base font-semibold text-text-primary leading-6 pt-2">
                Shipping info
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-text-primary mb-1.5">
                        Country
                    </label>
                    <div className="relative">
                        <select
                            value={value.country}
                            onChange={(e) => handleCountryChange(e.target.value)}
                            className="w-full bg-surface border border-border rounded-md px-3 py-2.5 text-sm text-text-primary appearance-none focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                        >
                            <option value="">Select country</option>
                            {countries.map((country) => (
                                <option key={country} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-text-primary mb-1.5">
                        Division
                    </label>
                    <div className="relative">
                        {divisions.length > 0 ? (
                            <select
                                value={value.city}
                                onChange={(e) => update('city', e.target.value)}
                                className="w-full bg-surface border border-border rounded-md px-3 py-2.5 text-sm text-text-primary appearance-none focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                            >
                                <option value="">Select your division</option>
                                {divisions.map((division) => (
                                    <option key={division} value={division}>
                                        {division}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                placeholder="Enter your division"
                                value={value.city}
                                onChange={(e) => update('city', e.target.value)}
                                className="w-full bg-surface border border-border rounded-md px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                            />
                        )}
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-text-primary mb-1.5">
                        District
                    </label>
                    <input
                        type="text"
                        placeholder="District"
                        value={value.district}
                        onChange={(e) => update('district', e.target.value)}
                        className="w-full bg-surface border border-border rounded-md px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                    />
                </div>

                <div>
                    <label className="block text-sm text-text-primary mb-1.5">
                        Postal code
                    </label>
                    <input
                        type="text"
                        placeholder="Postal code"
                        value={value.postalCode}
                        onChange={(e) => update('postalCode', e.target.value)}
                        className="w-full bg-surface border border-border rounded-md px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm text-text-primary mb-1.5">
                    Details address
                </label>
                <input
                    type="text"
                    placeholder="Enter your delivery address"
                    value={value.address}
                    onChange={(e) => update('address', e.target.value)}
                    className="w-full bg-surface border border-border rounded-md px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                />
            </div>

            {/* Address Label */}
            <div>
                <label className="block text-sm text-text-primary mb-2">
                    Add a label
                </label>
                <div className="flex gap-3">
                    {LABELS.map((label) => (
                        <button
                            key={label.value}
                            type="button"
                            onClick={() => update('addressLabel', value.addressLabel === label.value ? null : label.value)}
                            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                                value.addressLabel === label.value
                                    ? 'bg-surface-inverse text-text-inverse border-surface-inverse'
                                    : 'bg-surface text-text-primary border-border hover:bg-surface-secondary'
                            }`}
                        >
                            {label.icon}
                            {label.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Save info checkbox */}
            <label className="flex items-center gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={value.saveInfo}
                    onChange={(e) => update('saveInfo', e.target.checked)}
                    className="w-4 h-4 rounded border-border text-text-primary focus:ring-text-primary"
                />
                <span className="text-sm text-text-primary">
                    Save This Information for next time
                </span>
            </label>
        </div>
    );
}
