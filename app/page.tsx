import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import dynamic from 'next/dynamic'

// Simple icon components to avoid hydration issues
const Zap = ({ className }: { className?: string }) => <span className={className}>⚡</span>;
const Globe = ({ className }: { className?: string }) => <span className={className}>🌐</span>;
const FileText = ({ className }: { className?: string }) => <span className={className}>📄</span>;
const ArrowRight = ({ className }: { className?: string }) => <span className={className}>→</span>;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Delta API Suite
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional API testing and comparison tool with advanced semantic analysis, 
            intelligent order-insensitive matching, and world-class diff visualization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>API Journey</CardTitle>
              <CardDescription>
                Explore and test APIs from your configuration with dynamic parameter control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Browse API catalog</li>
                <li>• Dynamic parameter filling</li>
                <li>• Platform & version switching</li>
                <li>• Environment comparison</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Ad-hoc Compare</CardTitle>
              <CardDescription>
                Build custom requests with Postman-like interface and cURL import
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Custom request builder</li>
                <li>• cURL import support</li>
                <li>• Headers & body editing</li>
                <li>• Method selection</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Paste Response</CardTitle>
              <CardDescription>
                Compare responses directly by pasting JSON data without network calls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Direct JSON pasting</li>
                <li>• Instant validation</li>
                <li>• Offline comparison</li>
                <li>• Export capabilities</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/deltapro">
            <Button size="lg" className="px-8 py-3">
              <Zap className="w-5 h-5 mr-2" />
              Launch DeltaPro+
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
