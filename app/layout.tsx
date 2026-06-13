import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

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

export const metadata: Metadata = {
    title: "PandaBD Mart",
    description: "Your trusted online store in Bangladesh",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${generalSans.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col">
                <AppProviders>{children}</AppProviders>
            </body>
        </html>
    );
}
