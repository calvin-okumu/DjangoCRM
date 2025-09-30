
"use client";

import AuthLayout from "@/components/AuthLayout";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/api/api";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function SignUpPage() {
    const [form, setForm] = useState({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        company_name: "",
        agreeToTerms: false,
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!form.agreeToTerms) {
            setError("You must agree to the terms and conditions.");
            return;
        }

        setLoading(true);

        try {
            const data = await signup(form.email, form.password, form.first_name, form.last_name, form.company_name);

            localStorage.setItem("access_token", data.token);
            localStorage.setItem("user", JSON.stringify({
                id: data.user_id,
                email: data.email,
                first_name: data.first_name,
                last_name: data.last_name,
            }));

            setSuccess("Account created successfully! Redirecting...");
            setTimeout(() => router.push("/dashboard"), 1200);
        } catch (err: any) {
            if (err?.response?.status === 400) {
                setError(err.message || "Signup failed. Please check your details.");
            } else {
                setError("Network error. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Create your account 🚀</h2>
                <p className="text-gray-600 mb-8 text-center">
                    Get started with intelligent business management!
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* First Name */}
                    <div>
                        <label htmlFor="first_name" className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                        <input
                            id="first_name"
                            type="text"
                            placeholder="Enter your first name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            value={form.first_name}
                            onChange={(e) =>
                                setForm({ ...form, first_name: e.target.value })
                            }
                            required
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <label htmlFor="last_name" className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                        <input
                            id="last_name"
                            type="text"
                            placeholder="Enter your last name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            value={form.last_name}
                            onChange={(e) =>
                                setForm({ ...form, last_name: e.target.value })
                            }
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            value={form.email}
                            onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                            }
                            required
                        />
                    </div>

                    {/* Company Name */}
                    <div>
                        <label htmlFor="company_name" className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                        <input
                            id="company_name"
                            type="text"
                            placeholder="Enter your company name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            value={form.company_name}
                            onChange={(e) =>
                                setForm({ ...form, company_name: e.target.value })
                            }
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Create a strong password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            value={form.password}
                            onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
                            }
                            required
                        />
                    </div>

                    {/* Terms */}
                    <div className="flex items-start">
                        <input
                            id="agreeToTerms"
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                            checked={form.agreeToTerms}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    agreeToTerms: e.target.checked,
                                })
                            }
                            required
                        />
                        <label htmlFor="agreeToTerms" className="ml-3 text-sm text-gray-700">
                            I agree to the{" "}
                            <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">
                                privacy policy
                            </a>{" "}
                            and{" "}
                            <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">
                                terms of service
                            </a>
                        </label>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg">
                            <AlertCircle size={20} />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-3 p-4 bg-green-50 text-green-800 border border-green-200 rounded-lg">
                            <CheckCircle2 size={20} />
                            <span className="text-sm">{success}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Creating account...
                            </div>
                        ) : (
                            "Create account"
                        )}
                    </button>
                </form>

                <div className="mt-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-medium">Or sign up with</span>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <button
                            onClick={() => window.location.href = 'http://127.0.0.1:8000/accounts/google/login/'}
                            className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                        >
                            <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span className="ml-3">Google</span>
                        </button>
                        <button
                            onClick={() => window.location.href = 'http://127.0.0.1:8000/accounts/github/login/'}
                            className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                        >
                            <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <span className="ml-3">GitHub</span>
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-sm text-center text-gray-600">
                    Already have an account?{" "}
                    <a href="/login" className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors">
                        Sign in instead
                    </a>
                </p>
            </div>
        </AuthLayout>
    );
}
