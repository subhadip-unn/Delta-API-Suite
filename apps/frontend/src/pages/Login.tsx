import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

      // Validate name format
    const nameRegex = /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*[a-zA-Z0-9]+$/;
    if (!nameRegex.test(name.trim())) {
      alert('Name must contain only alphanumeric characters and dots. Dots cannot be at the start or end.');
      return;
    }

    // Validate name length
    if (name.trim().length > 50) {
      alert('Name must be 50 characters or less.');
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
                        <Label htmlFor="name" className="text-white font-medium">
                          Your Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your name (alphanumeric + dots only)"
                          value={name}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Only allow alphanumeric and dots
                            if (/^[a-zA-Z0-9.]*$/.test(value) && value.length <= 50) {
                              setName(value);
                            }
                          }}
                          className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400"
                          required
                          maxLength={50}
                        />
                        {name && (
                          <p className="text-xs text-slate-400">
                            Only letters, numbers, and dots allowed. Max 50 characters.
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-white font-medium">
                          Role
                        </Label>
                        <Select value={role} onValueChange={(value: any) => setRole(value)}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-blue-400 focus:ring-blue-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                            <SelectItem value="Developer">Developer</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        type="submit"
                        disabled={!name.trim() || isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          <>
                            <span>Continue to Delta Suite</span>
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </>
                        )}
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="success"
                      className="text-center space-y-4 py-8"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <CheckCircle className="w-8 h-8 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Welcome to Delta Suite!
                        </h3>
                        <p className="text-slate-300">
                          Redirecting you to the dashboard...
                        </p>
                      </div>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto"
                      />
                    </motion.div>
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
