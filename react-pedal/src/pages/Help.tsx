import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Search, 
  Book,
  Video,
  Users,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const Help: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqItems = [
    {
      question: "How do I start tracking my rides?",
      answer: "To start tracking, tap the 'Start Ride' button on the home screen or use the GPS tracking feature in the Maps section. Make sure location permissions are enabled for accurate tracking."
    },
    {
      question: "Can I use PEDAL offline?",
      answer: "Yes! PEDAL offers comprehensive offline functionality. You can access downloaded routes, track rides, and view cached content even without an internet connection. Sync occurs automatically when you're back online."
    },
    {
      question: "How do I join cycling groups and communities?",
      answer: "Visit the Community section to browse local cycling groups, join discussions, and participate in events. You can search by location, cycling style, or interests to find the perfect group for you."
    },
    {
      question: "Is my location data private and secure?",
      answer: "Absolutely. Your location data is encrypted and only used for route tracking and safety features. You have full control over what data is shared and can adjust privacy settings at any time."
    },
    {
      question: "How do I report a bug or technical issue?",
      answer: "Use the 'Report Issue' button below or contact our support team directly. Include details about your device, app version, and steps to reproduce the issue for faster resolution."
    },
    {
      question: "Can I export my cycling data?",
      answer: "Yes, you can export your ride data in various formats (GPX, TCX, CSV) from the Profile section. This allows you to backup your data or use it with other cycling applications."
    }
  ];

  const supportChannels = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      availability: "24/7",
      action: "Start Chat"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      availability: "Response within 24h",
      action: "Send Email"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our team",
      availability: "Mon-Fri 9AM-6PM EST",
      action: "Call Now"
    },
    {
      icon: Users,
      title: "Community Forum",
      description: "Get help from other cyclists",
      availability: "Always active",
      action: "Visit Forum"
    }
  ];

  const resources = [
    {
      icon: Book,
      title: "User Guide",
      description: "Complete guide to using PEDAL",
      link: "#"
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step video instructions",
      link: "#"
    },
    {
      icon: AlertCircle,
      title: "Safety Tips",
      description: "Essential cycling safety information",
      link: "#"
    },
    {
      icon: CheckCircle,
      title: "Best Practices",
      description: "Tips for getting the most out of PEDAL",
      link: "#"
    }
  ];

  const filteredFaqs = faqItems.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-app-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-app-primary-accent to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-app-text-primary mb-4">Help & Support</h1>
          <p className="text-xl text-app-text-muted max-w-2xl mx-auto">
            We're here to help you get the most out of your PEDAL experience.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-app-text-muted" />
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-app-card-surface border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted focus:outline-none focus:border-app-primary-accent"
            />
          </div>
        </motion.div>

        {/* Support Channels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-app-text-primary mb-6">Get Support</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {supportChannels.map((channel, index) => {
              const Icon = channel.icon;
              return (
                <motion.div
                  key={channel.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-app-card-surface rounded-xl p-6 border border-app-borders hover:border-app-primary-accent/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-app-primary-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-app-primary-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-app-text-primary mb-2">{channel.title}</h3>
                      <p className="text-app-text-muted mb-2">{channel.description}</p>
                      <p className="text-sm text-app-primary-accent mb-4">{channel.availability}</p>
                      <button className="px-4 py-2 bg-app-primary-accent text-white rounded-lg hover:bg-app-primary-accent/90 transition-colors">
                        {channel.action}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-app-text-primary mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-app-card-surface rounded-xl border border-app-borders overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-app-background/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-app-text-primary pr-4">{faq.question}</h3>
                  {expandedFaq === index ? (
                    <ChevronDown className="w-5 h-5 text-app-text-muted flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-app-text-muted flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-app-text-muted leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-app-text-primary mb-6">Helpful Resources</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <motion.a
                  key={resource.title}
                  href={resource.link}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-app-card-surface rounded-xl p-6 border border-app-borders hover:border-app-primary-accent/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-app-primary-accent/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-app-primary-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-app-text-primary mb-1 group-hover:text-app-primary-accent transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-app-text-muted">{resource.description}</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-app-text-muted group-hover:text-app-primary-accent transition-colors" />
                  </div>
                </motion.a>
              );
            })}
          </div>
        </motion.div>

        {/* Emergency Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl p-8 border border-red-500/20 text-center"
        >
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-app-text-primary mb-4">Emergency Support</h2>
          <p className="text-app-text-muted mb-6">
            If you're experiencing a safety-related issue while cycling or need immediate assistance, 
            use the emergency features in the app or contact local emergency services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              Emergency SOS
            </button>
            <button className="px-6 py-3 border border-app-borders text-app-text-primary rounded-lg hover:bg-app-background transition-colors">
              Safety Features
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Help;
