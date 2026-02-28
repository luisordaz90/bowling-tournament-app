// app/page.tsx
'use client';

import { useUser } from '@auth0/nextjs-auth0';
import Link from 'next/link';
import { Trophy, Users, UserPlus, Calendar, BarChart3, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-20 pb-16 text-center">
            <div className="mx-auto max-w-4xl">
              <Trophy className="h-20 w-20 text-blue-600 mx-auto mb-8" />
              <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
                Bowling Tournament
                <span className="text-blue-600"> Manager</span>
              </h1>
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                Streamline your bowling league management with comprehensive tournament tracking, 
                team organization, player statistics, and match scheduling.
              </p>
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                <a
                  href="/auth/login"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors inline-flex items-center justify-center"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="py-16">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Everything you need to manage bowling tournaments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard
                  icon={Trophy}
                  title="Tournament Management"
                  description="Create and manage multiple tournaments with customizable formats and scheduling options."
                />
                <FeatureCard
                  icon={Users}
                  title="Team Organization"
                  description="Register teams, assign players, and track team performance throughout the tournament."
                />
                <FeatureCard
                  icon={Calendar}
                  title="Match Scheduling"
                  description="Schedule matches, track scores, and manage game sessions with ease."
                />
                <FeatureCard
                  icon={BarChart3}
                  title="Detailed Statistics"
                  description="Comprehensive player and team statistics with real-time standings and rankings."
                />
                <FeatureCard
                  icon={UserPlus}
                  title="Player Profiles"
                  description="Maintain detailed player profiles with handicaps, averages, and performance history."
                />
                <FeatureCard
                  icon={Trophy}
                  title="Live Standings"
                  description="Real-time tournament standings and leaderboards for players and teams."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome back, {user.name}!
        </h1>
        <p className="text-xl text-gray-600">
          Ready to manage your bowling tournaments?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          href="/tournaments"
          icon={Trophy}
          title="Tournaments"
          description="Create and manage bowling tournaments"
          color="blue"
        />
        <DashboardCard
          href="/teams"
          icon={Users}
          title="Teams"
          description="Organize and register teams"
          color="green"
        />
        <DashboardCard
          href="/players"
          icon={UserPlus}
          title="Players"
          description="Manage player profiles and statistics"
          color="purple"
        />
        <DashboardCard
          href="/matches"
          icon={Calendar}
          title="Matches"
          description="Schedule and track match results"
          color="orange"
        />
        <DashboardCard
          href="/statistics"
          icon={BarChart3}
          title="Statistics"
          description="View comprehensive tournament analytics"
          color="red"
        />
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
      <Icon className="h-12 w-12 text-blue-600 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

interface DashboardCardProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

function DashboardCard({ href, icon: Icon, title, description, color }: DashboardCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
    green: 'text-green-600 bg-green-50 hover:bg-green-100',
    purple: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
    orange: 'text-orange-600 bg-orange-50 hover:bg-orange-100',
    red: 'text-red-600 bg-red-50 hover:bg-red-100',
  };

  return (
    <Link href={href}>
      <div className={`bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-gray-200 ${colorClasses[color]}`}>
        <Icon className="h-12 w-12 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <ArrowRight className="h-5 w-5 text-gray-400" />
      </div>
    </Link>
  );
}