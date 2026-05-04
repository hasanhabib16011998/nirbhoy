import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Scale, HeartHandshake, EyeOff, MapPin, Users } from 'lucide-react';

export default function AboutUs() {
  const features = [
    {
      icon: <ShieldAlert className="w-8 h-8 text-red-500" />,
      title: "Emergency SOS",
      description: "Instant alerts with real-time location tracking to dispatch nearby verified volunteers the moment you need them."
    },
    {
      icon: <Scale className="w-8 h-8 text-blue-500" />,
      title: "Verified Legal Support",
      description: "Connect with Bar Council-verified lawyers who provide professional guidance and advocacy for survivors."
    },
    {
      icon: <EyeOff className="w-8 h-8 text-primary-500" />,
      title: "Anonymous Community",
      description: "Share your story, seek advice, and find solidarity in a secure space where your true identity remains protected."
    }
  ];

  const stats = [
    { icon: <MapPin className="w-6 h-6 text-emerald-500" />, label: "Live Tracking", sub: "Redis-powered precision" },
    { icon: <Users className="w-6 h-6 text-emerald-500" />, label: "Verified Pros", sub: "Lawyers & Volunteers" },
    { icon: <HeartHandshake className="w-6 h-6 text-emerald-500" />, label: "Safe Space", sub: "Judgment-free zone" },
  ];

  return (
    // 1. Matched the CreatePost wrapper for seamless sidebar integration
    <div className="flex flex-1">
      
      {/* 2. Added common-container to handle the app's unified scrolling and padding */}
      <div className="common-container">
        
        {/* Inner wrapper to keep the content centered and well-paced */}
        <div className="w-full max-w-5xl flex flex-col gap-12 animate-in fade-in duration-500 pb-10">
          
          {/* Hero Section */}
          <section className="w-full text-center flex flex-col items-center pt-8">
            <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-dark-4 text-light-2 border border-dark-4">
              <span className="flex w-2 h-2 rounded-full bg-primary-500 mr-2 animate-pulse"></span>
              You are never alone
            </div>
            
            <h1 className="h1-bold md:h1-bold text-white tracking-tight mb-6">
              Be <span className="text-primary-500">Nirbhoy.</span><br />
              Be Fearless.
            </h1>
            
            <p className="text-light-2 body-medium md:base-regular max-w-2xl leading-relaxed mb-10">
              Nirbhoy bridges the gap between those in distress and verified professionals ready to help. Whether you need an immediate emergency response, legal counsel, or a safe space to speak your truth, we are here for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/sign-up">
                <Button className="shad-button_primary w-full sm:w-auto px-8 py-6 text-base">
                  Join the Community
                </Button>
              </Link>
              <Link to="/pro-sign-up">
                <Button variant="outline" className="w-full sm:w-auto px-8 py-6 text-base bg-dark-4 text-white border-none hover:bg-dark-3">
                  Apply as a Volunteer/Lawyer
                </Button>
              </Link>
            </div>
          </section>

          {/* Stats/Pillars Banner */}
          <section className="w-full bg-dark-4 border border-dark-4 rounded-3xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-dark-3">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center justify-center pt-6 md:pt-0">
                  <div className="p-3 bg-dark-3 rounded-full mb-3">
                    {stat.icon}
                  </div>
                  <h3 className="text-white font-bold text-lg">{stat.label}</h3>
                  <p className="text-light-3 text-sm">{stat.sub}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Core Features Section */}
          <section className="w-full pt-8">
            <div className="text-center mb-12">
              <h2 className="h2-bold text-white mb-4">How Nirbhoy Works</h2>
              <p className="text-light-3 max-w-2xl mx-auto base-regular">
                We prioritize your physical safety, your legal rights, and your mental well-being through a seamless, secure platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-dark-3 border border-dark-4 p-8 rounded-3xl flex flex-col items-start hover:bg-dark-4 transition-colors duration-300"
                >
                  <div className="mb-6 p-4 bg-dark-2 rounded-2xl">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-light-2 small-regular leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="w-full pt-8">
            <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-[2.5rem] p-10 md:p-14 text-center">
              <h2 className="h2-bold text-white mb-4">Ready to make a difference?</h2>
              <p className="text-white/90 max-w-xl mx-auto mb-8 base-regular">
                Whether you are looking for support or offering your expertise to protect others, there is a place for you here.
              </p>
              <Link to="/sign-in">
                <Button className="bg-white text-primary-600 hover:bg-light-1 px-8 py-6 font-bold text-base rounded-full">
                  Sign In to Your Account
                </Button>
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}