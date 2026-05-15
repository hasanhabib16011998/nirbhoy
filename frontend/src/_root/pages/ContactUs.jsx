import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail, PhoneCall, MapPin, MessageCircle, Send } from 'lucide-react';

export default function ContactUs() {
  const contactMethods = [
    {
      icon: <Mail className="w-8 h-8 text-blue-500" />,
      title: "Email Us",
      description: "For general inquiries, partnerships, and technical support.",
      detail: "support@nirbhoy.com",
      action: "mailto:support@nirbhoy.com",
      actionText: "Send an email"
    },
    {
      icon: <PhoneCall className="w-8 h-8 text-primary-500" />,
      title: "Call Us",
      description: "Our helpline is available Monday to Friday, 9am - 6pm.",
      detail: "+880 1234 567 890",
      action: "tel:+8801234567890",
      actionText: "Call now"
    },
    {
      icon: <MapPin className="w-8 h-8 text-emerald-500" />,
      title: "Visit Us",
      description: "Our headquarters.",
      detail: "Dhaka, Bangladesh",
      action: null,
      actionText: "Get directions"
    }
  ];

  return (
    // Wrapper matching the standard app layout
    <div className="flex flex-1">
      <div className="common-container">
        
        <div className="w-full max-w-5xl flex flex-col gap-12 animate-in fade-in duration-500 pb-10">
          
          {/* Hero Section */}
          <section className="w-full text-center flex flex-col items-center pt-8">
            <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-dark-4 text-light-2 border border-dark-4">
              <span className="flex w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
              We are here to listen
            </div>
            
            <h1 className="h1-bold md:h1-bold text-white tracking-tight mb-6">
              Get in <span className="text-primary-500">Touch.</span>
            </h1>
            
            <p className="text-light-2 body-medium md:base-regular max-w-2xl leading-relaxed mb-10">
              Have a question, need assistance, or want to collaborate? The Nirbhoy team is always ready to help. Reach out to us through any of the channels below.
            </p>
          </section>

          {/* Contact Methods Grid */}
          <section className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contactMethods.map((method, index) => (
                <div 
                  key={index} 
                  className="bg-dark-3 border border-dark-4 p-8 rounded-3xl flex flex-col items-start hover:bg-dark-4 transition-colors duration-300"
                >
                  <div className="mb-6 p-4 bg-dark-2 rounded-2xl">
                    {method.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{method.title}</h3>
                  <p className="text-light-3 small-regular leading-relaxed mb-6 flex-1">
                    {method.description}
                  </p>
                  
                  <div className="w-full mt-auto">
                    <p className="text-light-1 base-medium mb-4">{method.detail}</p>
                    {method.action && (
                      <a href={method.action} className="w-full block">
                        <Button variant="outline" className="w-full bg-dark-4 text-white border-dark-4 hover:bg-dark-2 flex gap-2">
                          <Send className="w-4 h-4" />
                          {method.actionText}
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* WhatsApp CTA Banner */}
          <section className="w-full pt-4">
            <div className="bg-[#122A20] border border-[#1EBE57]/30 rounded-[2.5rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              
              {/* Decorative background circle */}
              <div className="absolute -right-10 -top-10 w-64 h-64 bg-[#25D366] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

              <div className="z-10 text-center md:text-left">
                <h2 className="h2-bold text-white mb-3 flex items-center justify-center md:justify-start gap-3">
                  <MessageCircle className="w-8 h-8 text-[#25D366]" />
                  Need immediate help?
                </h2>
                <p className="text-light-2 base-regular max-w-xl">
                  Connect directly with our support team via WhatsApp. It's fast, secure, and we usually respond within minutes.
                </p>
              </div>
              
              <div className="z-10 w-full md:w-auto shrink-0">
                <a 
                  href="https://wa.me/8801876263377" // Replace with your actual WhatsApp number (include country code, no + or spaces)
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button className="bg-[#25D366] hover:bg-[#1EBE57] text-white px-8 py-7 font-bold text-base md:text-lg rounded-full w-full flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] hover:-translate-y-1">
                    <MessageCircle className="w-6 h-6 fill-current" />
                    Chat on WhatsApp
                  </Button>
                </a>
              </div>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
}