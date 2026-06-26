import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { getPublicSettings } from "@/repositories/settings.repository";

const generalSans = localFont({
    src: [
        {
            path: "./fonts/GeneralSans-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/GeneralSans-Medium.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "./fonts/GeneralSans-Semibold.woff2",
            weight: "600",
            style: "normal",
        },
        {
            path: "./fonts/GeneralSans-Bold.woff2",
            weight: "700",
            style: "normal",
        },
    ],
    variable: "--font-sans",
});

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getPublicSettings();

    return {
        title: settings?.metaTitle ?? "PandaBD Mart",
        description: settings?.metaDescription ?? "Your trusted online store in Bangladesh",
        icons: settings?.faviconUrl ? { icon: settings.faviconUrl } : undefined,
    };
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    return (
        <html
            lang="en"
            className={`${generalSans.variable} h-full antialiased`}
        >
            <head>
                {supabaseUrl && (
                    <link rel="preconnect" href={supabaseUrl} />
                )}
                {supabaseUrl && (
                    <link rel="dns-prefetch" href={supabaseUrl} />
                )}
            </head>
            <body className="min-h-full flex flex-col">
                <AppProviders>{children}</AppProviders>
            </body>
        </html>
    );
}
