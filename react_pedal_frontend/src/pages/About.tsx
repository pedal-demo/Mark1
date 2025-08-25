import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Users, 
  MapPin, 
  Award, 
  Zap, 
  Shield,
  Globe,
  Smartphone
} from 'lucide-react';

const About: React.FC = () => {
  const features = [
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Connect with cyclists worldwide and share your passion for riding'
    },
    {
      icon: MapPin,
      title: 'Route Tracking',
      description: 'Discover new routes and track your cycling adventures'
    },
    {
      icon: Award,
      title: 'Achievements',
      description: 'Earn badges and compete with fellow cyclists'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Get live updates on weather, traffic, and cycling conditions'
    },
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Built-in safety features and emergency support'
    },
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Join a worldwide community of cycling enthusiasts'
    }
  ];

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
            <span className="text-white font-bold text-3xl">P</span>
          </div>
          <h1 className="text-4xl font-bold text-app-text-primary mb-4">About PEDAL</h1>
          <p className="text-xl text-app-text-muted max-w-2xl mx-auto">
            The ultimate social platform for cycling enthusiasts, connecting riders worldwide through shared passion and adventure.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-app-card-surface rounded-xl p-8 mb-8 border border-app-borders"
        >
          <h2 className="text-2xl font-bold text-app-text-primary mb-4 flex items-center gap-3">
            <Heart className="w-6 h-6 text-app-primary-accent" />
            Our Mission
          </h2>
          <p className="text-app-text-muted leading-relaxed">
            PEDAL was born from a simple belief: cycling is more than just transportation or exercise—it's a way of life. 
            We created this platform to bring together cyclists from all walks of life, whether you're a weekend warrior, 
            daily commuter, or professional racer. Our mission is to foster a global community where riders can share 
            experiences, discover new routes, stay safe, and inspire each other to push their limits.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-app-text-primary mb-6 text-center">What Makes PEDAL Special</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-app-card-surface rounded-xl p-6 border border-app-borders hover:border-app-primary-accent/30 transition-colors"
                >
                  <div className="w-12 h-12 bg-app-primary-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-app-primary-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-app-text-primary mb-2">{feature.title}</h3>
                  <p className="text-app-text-muted">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-app-primary-accent/10 to-orange-500/10 rounded-xl p-8 mb-8 border border-app-primary-accent/20"
        >
          <h2 className="text-2xl font-bold text-app-text-primary mb-6 text-center">Our Growing Community</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-app-primary-accent mb-2">50K+</div>
              <div className="text-app-text-muted">Active Riders</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-app-primary-accent mb-2">2M+</div>
              <div className="text-app-text-muted">Miles Tracked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-app-primary-accent mb-2">15K+</div>
              <div className="text-app-text-muted">Routes Shared</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-app-primary-accent mb-2">120+</div>
              <div className="text-app-text-muted">Countries</div>
            </div>
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-app-card-surface rounded-xl p-8 border border-app-borders text-center"
        >
          <h2 className="text-2xl font-bold text-app-text-primary mb-4">Built by Cyclists, for Cyclists</h2>
          <p className="text-app-text-muted mb-6">
            Our team consists of passionate cyclists, experienced developers, and design enthusiasts who understand 
            the unique needs of the cycling community. We're committed to continuously improving PEDAL based on 
            your feedback and the evolving needs of our riders.
          </p>
          <div className="flex items-center justify-center gap-2 text-app-primary-accent">
            <Smartphone className="w-5 h-5" />
            <span className="font-semibold">Available on iOS, Android, and Web</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
