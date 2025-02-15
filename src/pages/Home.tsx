import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Trophy, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-20">
      <section className="text-center space-y-6 py-20">
        <h1 className="text-5xl font-bold tracking-tight">
          Create Viral YouTube Thumbnails
          <br />
          <span className="text-red-600">with AI</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Generate eye-catching thumbnails that drive clicks and views. Powered by advanced AI to create thumbnails that convert.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/generate"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Creating
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            View Examples
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto">
            <Zap className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold">Lightning Fast</h3>
          <p className="text-gray-600">Generate professional thumbnails in seconds, not hours.</p>
        </div>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold">Proven Templates</h3>
          <p className="text-gray-600">Use templates that are proven to drive higher CTR.</p>
        </div>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto">
            <Users className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold">Growing Community</h3>
          <p className="text-gray-600">Join thousands of creators using Fycra daily.</p>
        </div>
      </section>

      <section className="bg-gray-900 text-white -mx-4 px-4 py-20">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-bold">Ready to grow your channel?</h2>
          <p className="text-xl text-gray-300">
            Start creating thumbnails that convert. No design skills required.
          </p>
          <Link
            to="/generate"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-100"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}