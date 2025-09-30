import React from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import Header from '../../components/dashboard/Header';
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
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 pl-6">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
}