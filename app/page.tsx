import { GradientButton } from "@/components/gradient-button";
import { LatestEvents } from "@/components/latest-events";
import { ReferralTracker } from "@/components/referral-tracker";
import { createClient } from "@/lib/supabase/server";
export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  return (
    <main className="flex-1">
      <ReferralTracker />
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-pink-50 via-yellow-50 to-pink-100 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-pink-300 to-yellow-300 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-yellow-300 to-pink-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
            <div className="absolute top-10 left-10 w-32 h-32 bg-pink-200 rounded-full opacity-30"></div>
            <div className="absolute bottom-32 right-32 w-48 h-48 bg-yellow-200 rounded-full opacity-30"></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block p-1 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full mb-8">
            <div className="bg-white rounded-full px-6 py-2">
              <span className="text-transparent bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text font-bold text-sm uppercase tracking-wider">
                ✨ Discover Amazing Events
              </span>
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
            Discover Events
            <span className="block text-transparent bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text">
              Join the Fun
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Browse exciting events and sign up to start creating your own viral
            experiences.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <GradientButton
              href={user ? "/events/create" : "/auth/sign-up"}
              className="text-xl px-12 py-5 text-lg font-bold"
            >
              🚀 Start Creating
            </GradientButton>
          </div>

          {/* Stats or Social Proof */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-black text-transparent bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text mb-2">
                10K+
              </div>
              <div className="text-gray-600 font-medium">Events Created</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-black text-transparent bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text mb-2">
                50K+
              </div>
              <div className="text-gray-600 font-medium">Active Users</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-black text-transparent bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text mb-2">
                99%
              </div>
              <div className="text-gray-600 font-medium">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Events Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Latest Events
            </h2>
            <p className="text-xl text-gray-600">
              Check out what's happening in your community
            </p>
          </div>
          <LatestEvents />
        </div>
      </section>
    </main>
  );
}
