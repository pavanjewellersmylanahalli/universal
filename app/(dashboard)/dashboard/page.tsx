import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  CreditCard,
  AlertTriangle,
  Clock,
  Gem,
  Banknote,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Dashboard" };

interface StatCardProps {
  title: string;
  value: string;
  subvalue?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "gold" | "green" | "red" | "blue" | "default";
}

function StatCard({
  title,
  value,
  subvalue,
  icon: Icon,
  trend,
  trendValue,
  color = "default",
}: StatCardProps) {
  const iconColors = {
    gold: "bg-gold-500/20 text-gold-400",
    green: "bg-green-500/20 text-green-400",
    red: "bg-red-500/20 text-red-400",
    blue: "bg-blue-500/20 text-blue-400",
    default: "bg-zinc-800 text-zinc-400",
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
              {title}
            </p>
            <div className="text-2xl font-bold text-zinc-100 mb-1">{value}</div>
            {subvalue && (
              <p className="text-xs text-zinc-500">{subvalue}</p>
            )}
            {trend && trendValue && (
              <div
                className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                  trend === "up"
                    ? "text-green-400"
                    : trend === "down"
                    ? "text-red-400"
                    : "text-zinc-500"
                }`}
              >
                {trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : trend === "down" ? (
                  <TrendingDown className="h-3 w-3" />
                ) : null}
                {trendValue}
              </div>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${iconColors[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const businessName = session?.businessName ?? "Your Business";
  const userName = session?.user?.name ?? "User";

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 17
      ? "Good afternoon"
      : "Good evening";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            {greeting},{" "}
            <span className="text-gradient-gold">{userName.split(" ")[0]}</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {businessName} · {now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="gold" className="text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 mr-1.5 animate-pulse" />
            Live
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Girvi"
          value="—"
          subvalue="Connect database to view"
          icon={FileText}
          color="gold"
        />
        <StatCard
          title="Principal Outstanding"
          value="₹—"
          subvalue="Across all active Girvi"
          icon={Gem}
          color="gold"
        />
        <StatCard
          title="Interest Outstanding"
          value="₹—"
          subvalue="As of today"
          icon={CreditCard}
          color="blue"
        />
        <StatCard
          title="Today's Collection"
          value="₹—"
          subvalue="Cash + UPI + Bank"
          icon={Banknote}
          color="green"
          trend="up"
          trendValue="+0% from yesterday"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overdue Girvi"
          value="—"
          subvalue="Require immediate attention"
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Due Soon (7 days)"
          value="—"
          subvalue="Within next 7 days"
          icon={Clock}
          color="default"
        />
        <StatCard
          title="Total Customers"
          value="—"
          subvalue="Active customers"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Today's Redemptions"
          value="—"
          subvalue="Closed today"
          icon={ArrowUpRight}
          color="green"
        />
      </div>

      {/* Setup prompt if DB not connected */}
      <Card className="bg-gradient-to-br from-gold-500/10 to-gold-700/5 border-gold-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <Gem className="h-5 w-5 text-gold-400" />
            Phase 1 Foundation Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-400 mb-4">
            The application foundation is running. To enable live data, connect your Neon PostgreSQL database.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: "Next.js 15 + App Router", done: true },
              { label: "TypeScript + Tailwind", done: true },
              { label: "Multi-tenant architecture", done: true },
              { label: "Authentication (NextAuth v5)", done: true },
              { label: "Prisma schema", done: true },
              { label: "API middleware + RBAC", done: true },
              { label: "Dashboard UI shell", done: true },
              { label: "Neon DB connection", done: false },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 text-sm"
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    item.done
                      ? "bg-green-500/20 text-green-400"
                      : "bg-zinc-800 text-zinc-600"
                  }`}
                >
                  {item.done ? "✓" : "○"}
                </span>
                <span
                  className={item.done ? "text-zinc-300" : "text-zinc-500"}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
