import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  UserCheck, 

  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const Privacy: React.FC = () => {
  const privacyPrinciples = [
    {
      icon: Shield,
      title: 'Data Protection',
      description: 'Your personal information is encrypted and securely stored using industry-standard protocols.'
    },
    {
      icon: Lock,
      title: 'Privacy by Design',
      description: 'Privacy considerations are built into every feature from the ground up.'
    },
    {
      icon: Eye,
      title: 'Transparency',
      description: 'We clearly explain what data we collect and how it\'s used in plain language.'
    },
    {
      icon: UserCheck,
      title: 'User Control',
      description: 'You have full control over your data and can modify or delete it at any time.'
    }
  ];

  const dataTypes = [
    { type: 'Profile Information', description: 'Name, email, profile picture, and cycling preferences', required: true },
    { type: 'Activity Data', description: 'Routes, distances, times, and cycling statistics', required: false },
    { type: 'Location Data', description: 'GPS coordinates for route tracking (only when actively using the app)', required: false },
    { type: 'Social Interactions', description: 'Posts, comments, likes, and messages with other users', required: false },
    { type: 'Device Information', description: 'Device type, operating system, and app version for technical support', required: true },
    { type: 'Usage Analytics', description: 'Anonymous data about app usage to improve features', required: false }
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
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-app-text-primary mb-4">Privacy Policy</h1>
          <p className="text-xl text-app-text-muted max-w-2xl mx-auto">
            Your privacy is our priority. Learn how we protect and handle your data.
          </p>
          <p className="text-sm text-app-text-muted mt-2">Last updated: January 2024</p>
        </motion.div>

        {/* Privacy Principles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-app-text-primary mb-6">Our Privacy Principles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {privacyPrinciples.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <motion.div
                  key={principle.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="bg-app-card-surface rounded-xl p-6 border border-app-borders"
                >
                  <div className="w-12 h-12 bg-app-primary-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-app-primary-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-app-text-primary mb-2">{principle.title}</h3>
                  <p className="text-app-text-muted">{principle.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Data Collection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-app-card-surface rounded-xl p-8 mb-8 border border-app-borders"
        >
          <h2 className="text-2xl font-bold text-app-text-primary mb-6 flex items-center gap-3">
            <Database className="w-6 h-6 text-app-primary-accent" />
            What Data We Collect
          </h2>
          <div className="space-y-4">
            {dataTypes.map((data, index) => (
              <motion.div
                key={data.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-lg bg-app-background/50"
              >
                <div className="flex-shrink-0 mt-1">
                  {data.required ? (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-app-text-primary mb-1">{data.type}</h4>
                  <p className="text-app-text-muted text-sm">{data.description}</p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                    data.required 
                      ? 'bg-orange-500/10 text-orange-500' 
                      : 'bg-green-500/10 text-green-500'
                  }`}>
                    {data.required ? 'Required' : 'Optional'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Your Rights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-app-card-surface rounded-xl p-8 mb-8 border border-app-borders"
        >
          <h2 className="text-2xl font-bold text-app-text-primary mb-6 flex items-center gap-3">
            <UserCheck className="w-6 h-6 text-app-primary-accent" />
            Your Rights
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-app-text-primary mb-2">Access & Download</h3>
              <p className="text-app-text-muted text-sm">Request a copy of all your data in a portable format.</p>
            </div>
            <div>
              <h3 className="font-semibold text-app-text-primary mb-2">Correction</h3>
              <p className="text-app-text-muted text-sm">Update or correct any inaccurate personal information.</p>
            </div>
            <div>
              <h3 className="font-semibold text-app-text-primary mb-2">Deletion</h3>
              <p className="text-app-text-muted text-sm">Request permanent deletion of your account and data.</p>
            </div>
            <div>
              <h3 className="font-semibold text-app-text-primary mb-2">Opt-out</h3>
              <p className="text-app-text-muted text-sm">Disable data collection for analytics and marketing.</p>
            </div>
          </div>
        </motion.div>

        {/* Data Sharing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-app-primary-accent/10 to-orange-500/10 rounded-xl p-8 mb-8 border border-app-primary-accent/20"
        >
          <h2 className="text-2xl font-bold text-app-text-primary mb-4">Data Sharing Policy</h2>
          <p className="text-app-text-muted mb-4">
            We never sell your personal data to third parties. We only share data in the following limited circumstances:
          </p>
          <ul className="space-y-2 text-app-text-muted">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>With your explicit consent for specific features</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Anonymized analytics to improve app performance</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>When required by law or to protect user safety</span>
            </li>
          </ul>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-app-card-surface rounded-xl p-8 border border-app-borders text-center"
        >
          
          <h2 className="text-2xl font-bold text-app-text-primary mb-4">Privacy Settings & Questions</h2>
          <p className="text-app-text-muted mb-6">
            Manage your privacy preferences in the Settings page or contact our privacy team with any questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-app-primary-accent text-white rounded-lg hover:bg-app-primary-accent/90 transition-colors">
              Privacy Settings
            </button>
            <button className="px-6 py-3 border border-app-borders text-app-text-primary rounded-lg hover:bg-app-background transition-colors">
              Contact Privacy Team
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
