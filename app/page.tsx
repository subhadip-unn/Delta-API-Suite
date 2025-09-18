'use client';

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { AnimatedCard, AnimatedCardContent } from '@/components/ui/animated-card'
import { ThemeToggle } from '@/components/theme-toggle'
import { DeltaLogo, CricbuzzLogo } from '@/components/delta-logo'
import { 
  Zap, 
  Globe, 
  FileText, 
  ArrowRight, 
  Code, 
  Play, 
  Download,
  Shield,
  Sparkles
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CricbuzzLogo size="xl" />
              <div className="h-6 w-px bg-border" />
              <DeltaLogo size="xl" animated />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold gradient-text">Delta API Suite</h1>
                <p className="text-xs text-muted-foreground">Professional API Testing</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <motion.main
        className="container mx-auto px-6 py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div className="text-center mb-20" variants={itemVariants}>
          <motion.div 
            className="flex items-center justify-center space-x-4 mb-8"
          >
            <DeltaLogo size="xl" animated />
            <div className="text-left">
              <h1 className="text-6xl font-bold gradient-text mb-2">
                Delta API Suite
              </h1>
              <p className="text-2xl text-muted-foreground font-medium">
                Professional API Testing & Comparison
              </p>
            </div>
          </motion.div>
          
          <motion.p 
            className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed"
            variants={itemVariants}
          >
            Advanced API testing and comparison tool with intelligent semantic analysis, 
            order-insensitive matching, and world-class diff visualization. Built for 
            <span className="text-cricbuzz-500 font-semibold"> Cricbuzz</span> by developers, for developers.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            variants={itemVariants}
          >
            <Link href="/deltapro">
              <Button size="lg" className="px-8 py-4 text-lg button-glow">
                <Zap className="w-5 h-5 mr-2" />
                Launch DeltaPro+
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
              <Download className="w-5 h-5 mr-2" />
              View Documentation
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          variants={containerVariants}
        >
          <AnimatedCard delay={0.1} glow>
            <AnimatedCardContent
              title="API Journey"
              description="Explore and test APIs from your configuration with dynamic parameter control"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-cricbuzz-100 dark:bg-cricbuzz-900 rounded-xl flex items-center justify-center mb-4">
                  <Code className="w-6 h-6 text-cricbuzz-600 dark:text-cricbuzz-400" />
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-cricbuzz-500 rounded-full" />
                    <span>Browse comprehensive API catalog</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-cricbuzz-500 rounded-full" />
                    <span>Dynamic parameter filling</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-cricbuzz-500 rounded-full" />
                    <span>Platform & version switching</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-cricbuzz-500 rounded-full" />
                    <span>Environment comparison</span>
                  </li>
                </ul>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.2} glow>
            <AnimatedCardContent
              title="Ad-hoc Compare"
              description="Build custom requests with Postman-like interface and cURL import"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-delta-100 dark:bg-delta-900 rounded-xl flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-delta-600 dark:text-delta-400" />
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-delta-500 rounded-full" />
                    <span>Custom request builder</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-delta-500 rounded-full" />
                    <span>cURL import support</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-delta-500 rounded-full" />
                    <span>Headers & body editing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-delta-500 rounded-full" />
                    <span>Method selection</span>
                  </li>
                </ul>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.3} glow>
            <AnimatedCardContent
              title="Paste Response"
              description="Compare responses directly by pasting JSON data without network calls"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    <span>Direct JSON pasting</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    <span>Instant validation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    <span>Offline comparison</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    <span>Export capabilities</span>
                  </li>
                </ul>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          className="text-center mb-20"
          variants={itemVariants}
        >
          <h2 className="text-4xl font-bold gradient-text mb-8">
            Why Choose Delta API Suite?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Secure", desc: "CORS-free proxy with enterprise security" },
              { icon: Sparkles, title: "Intelligent", desc: "AI-powered semantic comparison" },
              { icon: Play, title: "Fast", desc: "Real-time testing and instant results" },
              { icon: Code, title: "Developer-First", desc: "Built by developers, for developers" }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.4 + index * 0.1 }}
              >
                <feature.icon className="w-8 h-8 mx-auto mb-4 text-cricbuzz-500" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="text-center bg-gradient-to-r from-cricbuzz-500/10 to-delta-500/10 rounded-2xl p-12 border border-cricbuzz-200/20 dark:border-cricbuzz-800/20"
          variants={itemVariants}
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready to revolutionize your API testing?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of developers who trust Delta API Suite for their API testing needs.
          </p>
          <Link href="/deltapro">
            <Button size="lg" className="px-12 py-4 text-lg button-glow">
              <Zap className="w-5 h-5 mr-2" />
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </motion.main>
    </div>
  )
}
