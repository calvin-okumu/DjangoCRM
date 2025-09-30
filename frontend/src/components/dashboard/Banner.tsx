
"use client";

import { Sparkles } from "lucide-react"; // replace with your logo if needed
import { useEffect, useState } from "react";

export default function Banner() {
    const [firstName, setFirstName] = useState("User");

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            const parsed = JSON.parse(user);
            const name = parsed.first_name || (parsed.email ? parsed.email.split('@')[0] : "User");
            setFirstName(name);
        }
    }, []);
    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-500 rounded-2xl shadow-md p-8 text-white">
                <div className="flex items-center space-x-4">
                    {/* Logo/Icon */}
                    <div className="bg-white/20 p-3 rounded-xl">
                        <Sparkles className="h-8 w-8 text-white" />
                    </div>

                    {/* Text */}
                    <div>
                        <h1 className="text-2xl font-bold">Welcome back, {firstName}!</h1>
                        <p className="text-blue-100">
                            Manage your business with AI-powered tools. Choose a service below to get started.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
