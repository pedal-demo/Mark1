import React from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Download, 
  Star, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Bug,
  Plus,
  Wrench
} from 'lucide-react';

const Version: React.FC = () => {
  const currentVersion = "2.4.1";
  const buildNumber = "241025";
  const releaseDate = "October 25, 2024";

  const versionHistory = [
    {
      version: "2.4.1",
      date: "Oct 25, 2024",
      type: "patch",
      changes: [
        "Fixed notification badge counter accuracy",
        "Improved offline mode stability",
        "Enhanced route sharing performance",
        "Minor UI improvements for dark mode"
      ]
    },
    {
      version: "2.4.0",
      date: "Oct 15, 2024",
      type: "minor",
      changes: [
        "New achievement system with 50+ badges",
        "Enhanced community features",
        "Improved map rendering performance",
        "Added weather integration",
        "New privacy controls"
      ]
    },
    {
      version: "2.3.2",
      date: "Sep 30, 2024",
      type: "patch",
      changes: [
        "Fixed GPS tracking accuracy issues",
        "Resolved crash on older Android devices",
        "Improved battery optimization",
        "Updated security protocols"
      ]
    },
    {
      version: "2.3.0",
      date: "Sep 10, 2024",
      type: "minor",
      changes: [
        "Introduced offline mode functionality",
        "New route discovery algorithm",
        "Enhanced social sharing options",
        "Redesigned profile interface",
        "Added support for cycling computers"
      ]
    }
  ];

  const systemInfo = [
    { label: "Platform", value: "Progressive Web App" },
    { label: "Minimum iOS", value: "iOS 14.0+" },
    { label: "Minimum Android", value: "Android 8.0 (API 26)" },
    { label: "Web Browsers", value: "Chrome 90+, Safari 14+, Firefox 88+" },
    { label: "Storage Required", value: "~150 MB" },
    { label: "Network", value: "Online/Offline capable" }
  ];

  const getVersionIcon = (type: string) => {
    switch (type) {
      case 'major': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'minor': return <Plus className="w-4 h-4 text-blue-500" />;
      case 'patch': return <Wrench className="w-4 h-4 text-green-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

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
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-app-text-primary mb-4">Version Information</h1>
          <p className="text-xl text-app-text-muted max-w-2xl mx-auto">
            Stay up to date with the latest features, improvements, and technical details.
          </p>
        </motion.div>

        {/* Current Version */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-app-primary-accent/10 to-orange-500/10 rounded-xl p-8 mb-8 border border-app-primary-accent/20"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-app-text-primary mb-2">PEDAL v{currentVersion}</h2>
            <p className="text-app-text-muted mb-4">Build {buildNumber} • Released {releaseDate}</p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="w-4 h-4" />
                <span>Latest Version</span>
              </div>
              <div className="flex items-center gap-2 text-app-text-muted">
                <Download className="w-4 h-4" />
                <span>Auto-updates enabled</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* System Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-app-card-surface rounded-xl p-8 mb-8 border border-app-borders"
        >
          <h2 className="text-2xl font-bold text-app-text-primary mb-6 flex items-center gap-3">
            <Zap className="w-6 h-6 text-app-primary-accent" />
            System Requirements
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {systemInfo.map((info, index) => (
              <motion.div
                key={info.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex justify-between items-center p-4 rounded-lg bg-app-background/50"
              >
                <span className="text-app-text-muted">{info.label}</span>
                <span className="font-semibold text-app-text-primary">{info.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Version History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-app-card-surface rounded-xl p-8 border border-app-borders"
        >
          <h2 className="text-2xl font-bold text-app-text-primary mb-6 flex items-center gap-3">
            <Clock className="w-6 h-6 text-app-primary-accent" />
            Release History
          </h2>
          <div className="space-y-6">
            {versionHistory.map((release, index) => (
              <motion.div
                key={release.version}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="border-l-4 border-app-primary-accent/30 pl-6 pb-6 last:pb-0"
              >
                <div className="flex items-center gap-3 mb-3">
                  {getVersionIcon(release.type)}
                  <h3 className="text-lg font-semibold text-app-text-primary">
                    Version {release.version}
                  </h3>
                  <span className="text-sm text-app-text-muted">{release.date}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    release.type === 'major' ? 'bg-yellow-500/10 text-yellow-500' :
                    release.type === 'minor' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-green-500/10 text-green-500'
                  }`}>
                    {release.type}
                  </span>
                </div>
                <ul className="space-y-2">
                  {release.changes.map((change, changeIndex) => (
                    <li key={changeIndex} className="flex items-start gap-2 text-app-text-muted">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Update Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-app-card-surface rounded-xl p-8 border border-app-borders text-center"
        >
          <AlertCircle className="w-12 h-12 text-app-primary-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-app-text-primary mb-4">Stay Updated</h2>
          <p className="text-app-text-muted mb-6">
            PEDAL automatically checks for updates and will notify you when new versions are available. 
            You can also manually check for updates in the app settings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-app-primary-accent text-white rounded-lg hover:bg-app-primary-accent/90 transition-colors">
              Check for Updates
            </button>
            <button className="px-6 py-3 border border-app-borders text-app-text-primary rounded-lg hover:bg-app-background transition-colors">
              Update 
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Version;
