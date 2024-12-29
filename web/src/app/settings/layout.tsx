'use client';

import { usePathname } from "next/navigation";
import { settingsSidebar } from "@/config/sidebar";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const sidebar = settingsSidebar.find((item) => item.href === pathname);
    if (!sidebar) {
        return <div>{children}</div>;
    }
    return (
        <div className="flex w-full h-screen">
            <div className="flex flex-col items-start gap-2 p-2 h-full w-64 border-r">
                <Link href="/" className="flex items-center gap-2 mb-4">
                    <Icons.logo />
                    <span className="text-lg font-semibold">Settings</span>
                </Link>
                {settingsSidebar.map((item) => (
                    <Link key={item.href} href={item.href} className={cn("flex items-center w-full gap-2 p-2 rounded-md", pathname === item.href && "bg-gray-100")}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                    </Link>
                ))}
            </div>
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}