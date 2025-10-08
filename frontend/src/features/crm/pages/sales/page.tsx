"use client";

import React from 'react';
import { DollarSign, TrendingUp, Target, Users, Calendar, Award } from 'lucide-react';
import MetricsBar from "../../components/MetricsBar";
import Button from "../../../shared/components/ui/Button";

export default function SalesPage() {
    const metrics = [
        {
            title: "Total Revenue",
            value: 125000,
            label: "This month",
            icon: DollarSign,
        },
        {
            title: "Sales Growth",
            value: 23,
            label: "% increase",
            icon: TrendingUp,
        },
        {
            title: "Active Deals",
            value: 47,
            label: "In pipeline",
            icon: Target,
        },
        {
            title: "New Customers",
            value: 12,
            label: "This month",
            icon: Users,
        },
    ];

    const recentSales = [
        { customer: "Acme Corp", amount: 25000, date: "2024-10-01", status: "Closed" },
        { customer: "TechStart Inc", amount: 15000, date: "2024-09-28", status: "Closed" },
        { customer: "Global Solutions", amount: 35000, date: "2024-09-25", status: "Closed" },
    ];

    const upcomingTasks = [
        { task: "Follow up with XYZ Ltd", due: "Today", priority: "High" },
        { task: "Demo for NewClient Co", due: "Tomorrow", priority: "Medium" },
        { task: "Contract review", due: "Friday", priority: "Low" },
    ];

    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
                <p className="text-gray-600 mt-2">Track your sales performance and manage your pipeline</p>
            </div>

            <MetricsBar metrics={metrics} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Recent Sales */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">Recent Sales</h3>
                        <Award className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="space-y-3">
                        {recentSales.map((sale, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{sale.customer}</p>
                                    <p className="text-sm text-gray-500">{sale.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-green-600">${sale.amount.toLocaleString()}</p>
                                    <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                        {sale.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                        View All Sales
                    </Button>
                </div>

                {/* Upcoming Tasks */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">Upcoming Tasks</h3>
                        <Calendar className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="space-y-3">
                        {upcomingTasks.map((task, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{task.task}</p>
                                    <p className="text-sm text-gray-500">Due: {task.due}</p>
                                </div>
                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                    task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                    {task.priority}
                                </span>
                            </div>
                        ))}
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                        View All Tasks
                    </Button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button className="w-full">
                        <Target className="h-4 w-4 mr-2" />
                        Add New Deal
                    </Button>
                    <Button variant="outline" className="w-full">
                        <Users className="h-4 w-4 mr-2" />
                        Contact Prospect
                    </Button>
                    <Button variant="outline" className="w-full">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        View Reports
                    </Button>
                    <Button variant="outline" className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Meeting
                    </Button>
                </div>
            </div>
        </div>
    );
}
