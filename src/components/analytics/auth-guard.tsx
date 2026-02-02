"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; // Assuming configured
import { Input } from "@/components/ui/input"; // Assuming configured. If not, will use basic input.

const ACCESS_CODE = "admin123"; // Simple client-side protection for demo

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [inputCode, setInputCode] = useState("");
    const [error, setError] = useState(false);

    useEffect(() => {
        const auth = localStorage.getItem("analytics_auth");
        if (auth === "true") setIsAuthenticated(true);
    }, []);

    const handleLogin = () => {
        if (inputCode === ACCESS_CODE) {
            localStorage.setItem("analytics_auth", "true");
            setIsAuthenticated(true);
            setError(false);
        } else {
            setError(true);
        }
    };

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4">
            <div className="w-full max-w-md p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
                <h2 className="text-2xl font-bold mb-6 text-center">Analytics Access</h2>
                <div className="space-y-4">
                    <div>
                        <input
                            type="password"
                            placeholder="Enter Access Code"
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value)}
                            className="w-full p-3 rounded-lg bg-zinc-950 border border-zinc-700 focus:border-zinc-500 outline-none transition-colors"
                        />
                        {error && <p className="text-red-500 text-sm mt-2">Invalid code</p>}
                    </div>
                    <button
                        onClick={handleLogin}
                        className="w-full py-3 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition-colors"
                    >
                        Access Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
