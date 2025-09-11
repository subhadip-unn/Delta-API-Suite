import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { LoginToDashboardTransition } from '@/components/ui/PageTransition';
import { 
  User, 
  Shield, 
  Zap, 
  Database, 
  GitCompare, 
  Activity,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

const Login = () => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'QA Engineer' | 'Developer' | 'Manager'>('QA Engineer');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [nameError, setNameError] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(''); // Clear previous errors
    
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }

    // Prevent using role names as actual names
    if (['QA Engineer', 'Developer', 'Manager'].includes(name.trim())) {
      setNameError('Please enter your actual name, not a role');
      return;
    }

    // Professional name validation: letters, dots, alphanumeric
    const nameRegex = /^[a-zA-Z]+(\.[a-zA-Z0-9]+)*[a-zA-Z0-9]*$/;
    if (!nameRegex.test(name.trim())) {
      setNameError('Name must start with a letter and can contain dots (e.g., john.doe)');
      return;
    }

    // Validate name length - max 16 characters
    if (name.trim().length > 16) {
      setNameError('Name must be 16 characters or less');
      return;
    }

    setIsLoading(true);
    
    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    login(name.trim(), role);
    setShowSuccess(true);
    
    // Redirect after success animation
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  const features = [
    {
      icon: GitCompare,
      title: 'DeltaPro+',
      description: 'Advanced API comparison with intelligent diff analysis'
    },
    {
      icon: Database,
      title: 'DeltaDB',
      description: 'Local API configuration management & storage'
    },
    {
      icon: Activity,
      title: 'DeltaMetrics',
      description: 'Real-time system health & performance monitoring'
    },
    {
      icon: Zap,
      title: 'Delta Suite',
      description: 'Complete API development toolkit'
    }
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"
          animate={{ 
            x: [0, 100, 0], 
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"
          animate={{ 
            x: [0, -80, 0], 
            y: [0, 60, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-32 left-1/4 w-40 h-40 bg-indigo-500/10 rounded-full blur-xl"
          animate={{ 
            x: [0, 60, 0], 
            y: [0, -80, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Hero & Features */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white space-y-8"
          >
            {/* Logo & Title */}
            <div className="space-y-6">
              <Logo size="lg" variant="animated" className="text-white" />
              <motion.h1 
                className="text-5xl lg:text-6xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Professional
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  API Suite
                </span>
              </motion.h1>
              <motion.p 
                className="text-xl text-slate-300 max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Enterprise-grade API development tools for modern teams. 
                Compare, test, and manage APIs with professional precision.
              </motion.p>
              

            </div>

            {/* Feature Grid */}
            <motion.div 
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -2 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{feature.title}</h3>
                      <p className="text-sm text-slate-400">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              className="flex items-center space-x-6 text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span className="text-sm">Lightning Fast</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader className="text-center space-y-4 pb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                  className="mx-auto"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
                <CardTitle className="text-2xl font-bold text-white">
                  Welcome Back
                </CardTitle>
                <p className="text-slate-300">
                  Sign in to access your Delta API Suite
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <AnimatePresence mode="wait">
                  {!showSuccess ? (
                    <motion.form
                      key="login-form"
                      onSubmit={handleSubmit}
                      className="space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white font-medium flex items-center gap-2">
                          Your Name
                          <div className="group relative">
                            <div 
                              className="w-4 h-4 bg-purple-500/20 rounded-full flex items-center justify-center cursor-help hover:bg-purple-500/30 focus:bg-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
                              aria-label="Name format help"
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  // Toggle tooltip visibility on keyboard interaction
                                }
                              }}
                            >
                              <span className="text-xs text-purple-300">?</span>
                            </div>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-lg shadow-2xl text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                              <strong>Name Format:</strong><br/>• Start with a letter<br/>• Use dots (e.g., john.doe)<br/>• Max 16 characters
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900/95"></div>
                            </div>
                          </div>
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="subhadip.das"
                          value={name}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow typing but validate and show warnings
                            setName(value);
                            
                            // Clear previous errors
                            setNameError('');
                            
                            // Check for invalid characters
                            if (value.length > 0) {
                              if (!/^[a-zA-Z.]*$/.test(value)) {
                                setNameError('Only letters and dots are allowed');
                              } else if (value.length > 16) {
                                setNameError('Name must be 16 characters or less');
                              } else if (value.startsWith('.') || value.endsWith('.')) {
                                setNameError('Name cannot start or end with a dot');
                              } else if (value.includes('..')) {
                                setNameError('Cannot use consecutive dots');
                              }
                            }
                          }}
                          className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400"
                          required
                          maxLength={16}
                        />
                        {nameError && (
                          <motion.p 
                            id="name-error"
                            className="text-xs text-red-500 bg-red-500/10 backdrop-blur-xl px-3 py-2 rounded-lg border border-red-500/30 shadow-lg"
                            role="alert"
                            aria-live="polite"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                          >
                            ❌ {nameError}
                          </motion.p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-white font-medium">
                          Role
                        </Label>
                        <Select value={role} onValueChange={(value: any) => setRole(value)}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-blue-400 focus:ring-blue-400 hover:bg-white/20 transition-colors">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800/80 backdrop-blur-xl border-slate-600/50 shadow-2xl">
                            <SelectItem 
                              value="QA Engineer" 
                              className="text-white hover:bg-purple-600/40 focus:bg-purple-600/40 cursor-pointer border-b border-slate-600/50 backdrop-blur-sm"
                            >
                              <div className="flex items-center space-x-2">
                                <span>QA Engineer</span>
                                {role === 'QA Engineer' && <CheckCircle className="w-4 h-4 text-green-400" />}
                              </div>
                            </SelectItem>
                            <SelectItem 
                              value="Developer" 
                              className="text-white hover:bg-purple-600/40 focus:bg-purple-600/40 cursor-pointer border-b border-slate-600/50 backdrop-blur-sm"
                            >
                              <div className="flex items-center space-x-2">
                                <span>Developer</span>
                                {role === 'Developer' && <CheckCircle className="w-4 h-4 text-green-400" />}
                              </div>
                            </SelectItem>
                            <SelectItem 
                              value="Manager" 
                              className="text-white hover:bg-purple-600/40 focus:bg-purple-600/40 cursor-pointer backdrop-blur-sm"
                            >
                              <div className="flex items-center space-x-2">
                                <span>Manager</span>
                                {role === 'Manager' && <CheckCircle className="w-4 h-4 text-green-400" />}
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        type="submit"
                        disabled={!name.trim() || isLoading || !!nameError}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                        aria-describedby={nameError ? "name-error" : undefined}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                            <span>Signing in...</span>
                          </div>
                        ) : (
                          <>
                            <span>Continue to Delta Suite</span>
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </>
                        )}
                      </Button>
                    </motion.form>
                  ) : (
                    <LoginToDashboardTransition />
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>



      {/* Bottom decorative elements */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      />
    </div>
  );
};

export default Login;
