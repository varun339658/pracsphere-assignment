// File: apps/web/app/dashboard/profile/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route"; // Ensure path is correct
import { redirect } from "next/navigation";
import clientPromise from "../../../lib/mongodb"; // Ensure path is correct
import ProfilePictureUpload from "../../../components/ProfilePictureUpload"; // Ensure path is correct
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui"; // Import Card components

// --- Inline SVG Icons ---
const CalendarDaysIcon = () => (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const MailCheckIcon = () => (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"></path><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path><path d="m16 19 2 2 4-4"></path></svg>);
const BarChartIcon = () => (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>);
const ListChecksIcon = () => (<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 6 2 2 4-4"></path><path d="M10 14l2 2 4-4"></path><path d="M10 6H3"></path><path d="M10 12H3"></path><path d="M10 18H3"></path></svg>);
const ClockIcon = () => (<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>);
const CheckCircleIcon = () => (<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);
const AlertTriangleIcon = () => (<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
const PartyPopperIcon = () => (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.8 11.3a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1z"></path><path d="M18.2 11.3a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1z"></path><path d="M9 13.7a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"></path><path d="M16 13.7a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"></path><path d="M11.5 19.5c0-1.3 1.1-2.3 2.5-2.3s2.5 1 2.5 2.3"></path><path d="M7 19.5c0-1.3 1.1-2.3 2.5-2.3s2.5 1 2.5 2.3"></path><path d="M9 3.5c-1 1-1.5 2.5-.5 3.5s2.5.5 3.5-.5 1-3.5-.5-3.5c-.7-.5-1.5 0-2.5.5z"></path><path d="M15 3.5c1 1 1.5 2.5.5 3.5s-2.5.5-3.5-.5-1-3.5.5-3.5c.7-.5 1.5 0 2.5.5z"></path><path d="M14 10.5c-.8.8-2 .8-2.8 0s-.8-2 0-2.8 2-.8 2.8 0 .8 2 0 2.8z"></path></svg>);


// Helper: Stats Card (Uses Tailwind & Card component)
const StatCard = ({ title, value, colorClass, icon }: { title: string, value: string | number, colorClass: string, icon: React.ReactNode }) => (
    <Card className="text-center !p-0 shadow-sm hover:shadow transition-shadow">
        <CardContent className="p-4 sm:p-5">
            <div className={`p-2 inline-block rounded-full mb-1 ${colorClass.replace('text-', 'bg-')} bg-opacity-10`}>
                {icon}
            </div>
            <div className={`text-2xl font-bold mb-0.5 ${colorClass}`}>
                {value}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                {title}
            </div>
        </CardContent>
    </Card>
);

// Helper: Info Item (Uses Tailwind)
const InfoItem = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <div className="flex items-center text-sm gap-3">
        <div className="text-gray-500 w-5 h-5 flex-shrink-0">{icon}</div>
        <span className="text-gray-700">{text}</span>
    </div>
);

// --- Profile Page Component ---
export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) { redirect("/login"); }

  // --- Data Fetching ---
  let userProfileImage: string | null = session.user?.image || null;
  let stats = { total: 0, pending: 0, completed: 0, overdue: 0 };
  let joinDateStr: string | null = null;

  try {
    const client = await clientPromise;
    const db = client.db("pracsphere");
    const userProfile = await db.collection("users").findOne({ email: session.user.email });
    let userId = null;
    if (userProfile) {
      userId = userProfile._id;
      userProfileImage = userProfile.profileImage || userProfileImage;
      joinDateStr = userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null;
    }

    // Fetch Tasks using userEmail (as per previous correction)
    const tasks = await db.collection("tasks").find({ userEmail: session.user.email }).toArray();
     stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) && t.status === 'pending').length,
    };
  } catch (error) {
    console.error("Error fetching profile/task data:", error);
    stats = { total: 0, pending: 0, completed: 0, overdue: 0 };
  }

  const joinDateDisplay = joinDateStr || "N/A";
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // --- Badge Logic ---
  const getBadgeClass = () => {
    if (completionRate >= 70) return 'bg-green-100 text-green-700';
    if (completionRate >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };
  const badgeText = completionRate >= 70 ? 'Super Productive' : completionRate >= 40 ? 'Getting Things Done' : 'Keep Going';
  const badgeIcon = completionRate >= 70 ? '⭐' : completionRate >= 40 ? '🔥' : '💪';

  // --- Render ---
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center pt-4 pb-8 md:pb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">My Profile</h1>
            <p className="text-sm sm:text-base text-gray-500">Manage your account and view your activity</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* Profile Card */}
            <Card className="lg:col-span-1 h-fit lg:sticky lg:top-24 rounded-lg shadow-sm"> {/* Added rounded-lg */}
                <CardContent className="text-center pt-6 pb-6">
                    <ProfilePictureUpload currentImage={userProfileImage} userName={session.user?.name} />
                    <h2 className="text-xl font-semibold text-gray-800 mb-1 mt-5">{session.user?.name || 'User'}</h2>
                    <p className="text-sm text-gray-500 mb-4 break-words">{session.user?.email}</p>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getBadgeClass()}`}>
                        <span>{badgeIcon}</span><span>{badgeText}</span>
                    </div>
                    <div className="text-left border-t border-gray-100 pt-5 mt-5 space-y-3">
                        <InfoItem icon={<CalendarDaysIcon />} text={`Joined ${joinDateDisplay}`} />
                        <InfoItem icon={<MailCheckIcon />} text="Email Verified" />
                        <InfoItem icon={<BarChartIcon />} text={`${completionRate}% Completion Rate`} />
                    </div>
                </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="lg:col-span-2 rounded-lg shadow-sm"> {/* Added rounded-lg */}
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <BarChartIcon /> Task Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <StatCard title="Total" value={stats.total} colorClass="text-indigo-600" icon={<ListChecksIcon />} />
                        <StatCard title="Pending" value={stats.pending} colorClass="text-yellow-500" icon={<ClockIcon />} />
                        <StatCard title="Completed" value={stats.completed} colorClass="text-green-600" icon={<CheckCircleIcon />} />
                        <StatCard title="Overdue" value={stats.overdue} colorClass="text-red-500" icon={<AlertTriangleIcon />} />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                        <h4 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <BarChartIcon /> Quick Stats Summary
                        </h4>
                        <div className="space-y-3">
                            <InfoItem icon={<CheckCircleIcon />} text={`You've completed ${stats.completed} task${stats.completed !== 1 ? 's' : ''}`} />
                            <InfoItem icon={<ClockIcon />} text={`You have ${stats.pending} task${stats.pending !== 1 ? 's' : ''} in progress`} />
                            {stats.overdue > 0 && (<InfoItem icon={<AlertTriangleIcon />} text={`${stats.overdue} task${stats.overdue !== 1 ? 's' : ''} need${stats.overdue === 1 ? 's' : ''} attention`} />)}
                            {completionRate === 100 && stats.total > 0 && (<InfoItem icon={<PartyPopperIcon />} text="Amazing! All tasks completed!" />)}
                            {stats.total === 0 && (<InfoItem icon={<ListChecksIcon />} text="No tasks found." />)}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}