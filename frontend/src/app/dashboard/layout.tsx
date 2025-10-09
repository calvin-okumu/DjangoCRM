import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/dashboard/Footer';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
                <Navbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 pl-6">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
}