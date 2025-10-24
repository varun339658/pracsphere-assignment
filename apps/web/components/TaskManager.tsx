'use client';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@repo/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui';

// Define types
type Task = {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  images?: string[];
};

// Icon Components
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"></rect>
    <rect x="14" y="3" width="7" height="7" rx="1"></rect>
    <rect x="14" y="14" width="7" height="7" rx="1"></rect>
    <rect x="3" y="14" width="7" height="7" rx="1"></rect>
  </svg>
);

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// Changed component name
export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
    setLoading(false);
  };

  // ... (useMemo stats and helper functions - unchanged) ...
    // Calculate statistics
    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
    
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const pendingTasks = tasks.filter(t => t.status === 'pending').length;
        const overdueTasks = tasks.filter(t => {
          const dueDate = new Date(t.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate < today && t.status === 'pending';
        }).length;
    
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
        // Tasks due today
        const todayTasks = tasks.filter(t => {
          const dueDate = new Date(t.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() === today.getTime() && t.status === 'pending';
        }).length;
    
        // Tasks due this week
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const weekTasks = tasks.filter(t => {
          const dueDate = new Date(t.dueDate);
          return dueDate >= today && dueDate <= weekEnd && t.status === 'pending';
        }).length;
    
        // Priority breakdown
        const highPriority = tasks.filter(t => t.priority === 'high' && t.status === 'pending').length;
        const mediumPriority = tasks.filter(t => t.priority === 'medium' && t.status === 'pending').length;
        const lowPriority = tasks.filter(t => t.priority === 'low' && t.status === 'pending').length;
    
        return {
          totalTasks,
          completedTasks,
          pendingTasks,
          overdueTasks,
          completionRate,
          todayTasks,
          weekTasks,
          highPriority,
          mediumPriority,
          lowPriority
        };
      }, [tasks]);
    
      // Get upcoming tasks
      const upcomingTasks = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return tasks
          .filter(t => t.status === 'pending')
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          .slice(0, 5);
      }, [tasks]);
    
      // Get recent completed tasks
      const recentCompleted = useMemo(() => {
        return tasks
          .filter(t => t.status === 'completed')
          // Sort by completion date if available, otherwise just slice
          .slice(0, 5);
      }, [tasks]);
    
      // Get high priority tasks
      const highPriorityTasks = useMemo(() => {
        return tasks
          .filter(t => t.priority === 'high' && t.status === 'pending')
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          .slice(0, 5);
      }, [tasks]);
    
      // Calculate productivity score
      const productivityScore = useMemo(() => {
        if (stats.totalTasks === 0) return 0;
        
        let score = stats.completionRate * 0.5; // 50% weight to completion rate
        
        // Deduct points for overdue tasks
        const overdueRatio = stats.overdueTasks / stats.totalTasks;
        score -= overdueRatio * 30;
        
        // Add points for completing high priority tasks (assuming completed high priority tasks are tracked)
        // For simplicity, let's add points based on current high priority tasks that are completed
        const highPriorityCompleted = tasks.filter(t => t.priority === 'high' && t.status === 'completed').length;
        score += highPriorityCompleted * 2; // Arbitrary points
        
        return Math.max(0, Math.min(100, Math.round(score)));
      }, [stats, tasks]);
    
      const isOverdue = (task: Task) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(task.dueDate) < today && task.status === 'pending';
      };
    
      const isDueToday = (task: Task) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      };
    
      const getPriorityColor = (priority?: string) => {
        switch (priority) {
          case 'high': return 'text-red-500 bg-red-100';
          case 'medium': return 'text-yellow-600 bg-yellow-100';
          case 'low': return 'text-green-600 bg-green-100';
          default: return 'text-gray-600 bg-gray-100';
        }
      };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]"> {/* Adjust height */}
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full"> {/* Changed min-h-screen */}
      <div className="max-w-7xl mx-auto"> {/* Removed padding, handled by layout */}
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-teal-400 to-teal-600 text-white p-3 rounded-xl shadow-lg">
              <DashboardIcon />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-1">Dashboard</h1>
              <p className="text-sm text-slate-500">
                Welcome back! Here's your task overview
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {(['today', 'week', 'month'] as const).map((range) => (
              <Button
                key={range}
                onClick={() => setTimeRange(range)}
                variant={timeRange === range ? 'teal' : 'outline'}
                size="sm"
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-3 rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
                {/* Optional: Add dynamic stat change indicator */}
                {/* <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                  <TrendingUpIcon />
                  <span>+12%</span>
                </div> */}
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-3xl font-bold text-slate-800 mb-1">{stats.totalTasks}</h3>
              <p className="text-slate-500 text-sm font-medium">Total Tasks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-3 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="text-slate-600 text-sm font-medium">
                  {stats.completionRate}%
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-3xl font-bold text-slate-800 mb-1">{stats.completedTasks}</h3>
              <p className="text-slate-500 text-sm font-medium">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white p-3 rounded-lg">
                  <span className="text-2xl">⏳</span>
                </div>
                <div className="text-slate-600 text-sm font-medium">
                  {stats.todayTasks} today
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-3xl font-bold text-slate-800 mb-1">{stats.pendingTasks}</h3>
              <p className="text-slate-500 text-sm font-medium">Pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="bg-gradient-to-br from-red-400 to-red-600 text-white p-3 rounded-lg">
                  <span className="text-2xl">⚠️</span>
                </div>
                {stats.overdueTasks > 0 && (
                  <div className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                    ACTION NEEDED
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-3xl font-bold text-slate-800 mb-1">{stats.overdueTasks}</h3>
              <p className="text-slate-500 text-sm font-medium">Overdue</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 shadow-xl text-white lg:col-span-1"> {/* Adjusted grid span */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Productivity Score</h3>
              <span className="text-3xl">🎯</span>
            </div>
            <div className="mb-3">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold">{productivityScore}</span>
                <span className="text-2xl mb-1">/100</span>
              </div>
            </div>
            <div className="bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${productivityScore}%` }}
              />
            </div>
            <p className="text-purple-100 text-sm mt-3">
              {productivityScore >= 80 ? '🔥 Excellent work!' : productivityScore >= 60 ? '💪 Good progress!' : '📈 Keep going!'}
            </p>
          </div>

          <Card className="lg:col-span-1"> {/* Adjusted grid span */}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>This Week</CardTitle>
                <CalendarIcon />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-sm">Due this week</span>
                <span className="font-bold text-slate-800 text-lg">{stats.weekTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-sm">Due today</span>
                <span className="font-bold text-orange-500 text-lg">{stats.todayTasks}</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="text-xs text-slate-500 mb-2">Completion Rate</div>
                <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-400 to-teal-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1"> {/* Adjusted grid span */}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Priority Tasks</CardTitle>
                <span className="text-xl">🎯</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-700">High</span>
                </div>
                <span className="font-bold text-red-600 text-lg">{stats.highPriority}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-700">Medium</span>
                </div>
                <span className="font-bold text-yellow-600 text-lg">{stats.mediumPriority}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-700">Low</span>
                </div>
                <span className="font-bold text-green-600 text-lg">{stats.lowPriority}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>📅 Upcoming Tasks</CardTitle>
                <span className="text-xs text-slate-500">{upcomingTasks.length} tasks</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-4xl mb-2">🎉</p>
                  <p className="text-sm">No upcoming tasks!</p>
                </div>
              ) : (
                upcomingTasks.map((task) => (
                  <div
                    key={task._id}
                    className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                      isOverdue(task)
                        ? 'border-red-300 bg-red-50'
                        : isDueToday(task)
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0"> {/* Ensure content wraps */}
                        <h4 className="font-semibold text-slate-800 mb-1 truncate">{task.title}</h4> {/* Add truncate */}
                        <p className="text-xs text-slate-500 mb-2 line-clamp-2">{task.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                            {(task.priority || 'low').toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-600">
                            📅 {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          {isOverdue(task) && (
                            <span className="text-xs px-2 py-1 bg-red-500 text-white rounded-full font-bold">
                              OVERDUE
                            </span>
                          )}
                          {isDueToday(task) && (
                            <span className="text-xs px-2 py-1 bg-orange-500 text-white rounded-full font-bold">
                              TODAY
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Optional: Add action button */}
                      {/* <Button variant="outline" size="sm">View</Button> */}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>🔥 High Priority</CardTitle>
                <span className="text-xs text-slate-500">{highPriorityTasks.length} tasks</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {highPriorityTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-4xl mb-2">✨</p>
                  <p className="text-sm">No high priority tasks!</p>
                </div>
              ) : (
                highPriorityTasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-4 rounded-lg border-2 border-red-200 bg-red-50 transition-all hover:shadow-md hover:border-red-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                     <div className="flex-1 min-w-0"> {/* Ensure content wraps */}
                        <h4 className="font-semibold text-slate-800 mb-1 truncate">{task.title}</h4> {/* Add truncate */}
                        <p className="text-xs text-slate-500 mb-2 line-clamp-2">{task.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-600">
                            HIGH PRIORITY
                          </span>
                          <span className="text-xs text-slate-600">
                            📅 {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          {isOverdue(task) && (
                            <span className="text-xs px-2 py-1 bg-red-600 text-white rounded-full font-bold animate-pulse">
                              OVERDUE!
                            </span>
                          )}
                        </div>
                      </div>
                       {/* Optional: Add action button */}
                      {/* <Button variant="outline" size="sm">View</Button> */}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🕒 Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCompleted.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-4xl mb-2">📝</p>
                <p className="text-sm">No recent completions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCompleted.map((task) => (
                  <div key={task._id} className="flex items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                      ✓
                    </div>
                    <div className="flex-1 min-w-0"> {/* Ensure content wraps */}
                      <h4 className="font-medium text-slate-800 truncate">{task.title}</h4> {/* Add truncate */}
                      <p className="text-xs text-slate-500">Completed</p>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Done</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}