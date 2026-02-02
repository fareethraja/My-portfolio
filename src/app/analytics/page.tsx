"use client";

import { useEffect, useState } from "react";
import { getAnalyticsData, EventType } from "@/lib/analytics";
import { AuthGuard } from "@/components/analytics/auth-guard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function AnalyticsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [metrics, setMetrics] = useState({
        totalVisitors: 0,
        mobile: 0,
        desktop: 0,
        scrollDepth: 0,
        connectClicks: {},
        projectClicks: {},
    });

    useEffect(() => {
        const fetchData = async () => {
            const data = await getAnalyticsData();
            setEvents(data);
            processMetrics(data);
        };

        fetchData();
        // Refresh every 5s for "realtime" feel
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const processMetrics = (data: any[]) => {
        // Unique visitors (mock logic based on separate sessions/timestamps for now)
        // For real app, would use session_id
        const totalVisitors = data.filter(e => e.event_name === 'page_view').length;

        const mobile = data.filter(e => e.device_type === 'mobile').length;
        const desktop = data.filter(e => e.device_type === 'desktop').length;

        const scrollDepth = data.filter(e => e.event_name === 'scroll_depth').length;

        const connectClicks = data
            .filter(e => e.event_name === 'connect_click')
            .reduce((acc: any, curr) => {
                const platform = curr.event_data?.platform || 'Unknown';
                acc[platform] = (acc[platform] || 0) + 1;
                return acc;
            }, {});

        const projectClicks = data
            .filter(e => e.event_name === 'project_demo_click')
            .reduce((acc: any, curr) => {
                const project = curr.event_data?.project || 'Unknown';
                acc[project] = (acc[project] || 0) + 1;
                return acc;
            }, {});

        setMetrics({
            totalVisitors,
            mobile,
            desktop,
            scrollDepth,
            connectClicks,
            projectClicks
        });
    };

    // Prepare chart data
    const connectChartData = Object.entries(metrics.connectClicks).map(([name, count]) => ({ name, count }));
    const projectChartData = Object.entries(metrics.projectClicks).map(([name, count]) => ({ name, count }));

    return (
        <AuthGuard>
            <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 pt-24 font-sans">
                <div className="max-w-6xl mx-auto space-y-12">

                    <header>
                        <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
                        <p className="text-zinc-400">Real-time insights for Fareeth's Portfolio</p>
                    </header>

                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard title="Total Page Views" value={metrics.totalVisitors} />
                        <StatCard title="Mobile Users" value={metrics.mobile} color="text-blue-400" />
                        <StatCard title="Desktop Users" value={metrics.desktop} color="text-green-400" />
                        <StatCard title="Scrolled to Bottom" value={metrics.scrollDepth} color="text-purple-400" />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Connect Clicks */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                            <h3 className="text-xl font-semibold mb-6">Connect Interactions</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={connectChartData}>
                                        <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                                        <YAxis stroke="#71717a" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Bar dataKey="count" fill="#e4e4e7" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Project Clicks */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                            <h3 className="text-xl font-semibold mb-6">Project Demos Viewed</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={projectChartData}>
                                        <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                                        <YAxis stroke="#71717a" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}

const StatCard = ({ title, value, color = "text-white" }: { title: string, value: number, color?: string }) => (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
        <p className="text-zinc-500 text-sm font-medium mb-1 uppercase tracking-wider">{title}</p>
        <p className={`text-4xl font-bold ${color}`}>{value}</p>
    </div>
);
