'use client';

import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'setup' | 'development' | 'testing' | 'deployment' | 'documentation';
  progress: number;
  dependencies?: string[];
  notes?: string;
  lastUpdated: string;
}

interface Objective {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
}

export function ProjectTracker() {
  const [objectives] = useState<Objective[]>([
    {
      id: 'setup',
      title: '🚀 Project Setup & Infrastructure',
      description: 'Complete initial project setup, Git configuration, and CI/CD pipeline',
      status: 'completed',
      progress: 100,
      tasks: [
        {
          id: 'setup-1',
          title: 'Initialize Git Repository',
          description: 'Set up Git repository with proper branching strategy',
          status: 'completed',
          priority: 'critical',
          category: 'setup',
          progress: 100,
          lastUpdated: '2024-01-15',
          notes: 'Repository initialized with main branch protection'
        },
        {
          id: 'setup-2',
          title: 'Configure Monorepo Structure',
          description: 'Set up Turbo monorepo with npm workspaces',
          status: 'completed',
          priority: 'critical',
          category: 'setup',
          progress: 100,
          lastUpdated: '2024-01-15',
          notes: 'Turbo configured with apps/api, apps/web, and packages/ui'
        },
        {
          id: 'setup-3',
          title: 'Set up CI/CD Pipeline',
          description: 'Configure GitHub Actions for automated testing and deployment',
          status: 'completed',
          priority: 'high',
          category: 'setup',
          progress: 100,
          lastUpdated: '2024-01-15',
          notes: 'GitHub Actions workflow configured with comprehensive testing'
        }
      ]
    },
    {
      id: 'core-development',
      title: '⚙️ Core Development',
      description: 'Develop the main application features and components',
      status: 'completed',
      progress: 100,
      tasks: [
        {
          id: 'dev-1',
          title: 'Express API Backend',
          description: 'Build RESTful API with Express.js and TypeScript',
          status: 'completed',
          priority: 'high',
          category: 'development',
          progress: 100,
          lastUpdated: '2024-01-15',
          notes: 'Basic API with health, version, and items endpoints'
        },
        {
          id: 'dev-2',
          title: 'Next.js Web Application',
          description: 'Create modern web interface with Next.js 15 and React 19',
          status: 'completed',
          priority: 'high',
          category: 'development',
          progress: 100,
          lastUpdated: '2024-01-15',
          notes: 'Web app with health status display and project tracker'
        },
        {
          id: 'dev-3',
          title: 'Shared UI Components',
          description: 'Develop reusable UI component library',
          status: 'completed',
          priority: 'medium',
          category: 'development',
          progress: 100,
          lastUpdated: '2024-01-15',
          notes: 'Complete component library with 16 reusable components including Button, Input, Card, Alert, Progress, and more'
        },
        {
          id: 'dev-4',
          title: 'Project Tracker Component',
          description: 'Create comprehensive project progress tracking system',
          status: 'completed',
          priority: 'high',
          category: 'development',
          progress: 100,
          lastUpdated: '2024-01-15',
          notes: 'Full-featured tracker with objectives, tasks, and progress'
        }
      ]
    },
    {
      id: 'testing',
      title: '🧪 Testing & Quality Assurance',
      description: 'Implement comprehensive testing strategy and quality checks',
      status: 'in-progress',
      progress: 70,
      tasks: [
        {
          id: 'test-1',
          title: 'Unit Testing Setup',
          description: 'Configure Vitest for unit testing across all packages',
          status: 'completed',
          priority: 'high',
          category: 'testing',
          progress: 100,
          lastUpdated: '2024-01-15',
          notes: 'Vitest configured with test scripts'
        },
        {
          id: 'test-2',
          title: 'E2E Testing with Playwright',
          description: 'Set up end-to-end testing for web application',
          status: 'completed',
          priority: 'medium',
          category: 'testing',
          progress: 100,
          lastUpdated: '2024-01-15',
          notes: 'Playwright configured with basic health tests'
        },
        {
          id: 'test-3',
          title: 'TypeScript Type Checking',
          description: 'Ensure type safety across the entire codebase',
          status: 'completed',
          priority: 'high',
          category: 'testing',
          progress: 100,
          lastUpdated: '2024-01-15',
          notes: 'TypeScript configured with strict mode'
        },
        {
          id: 'test-4',
          title: 'Linting and Code Quality',
          description: 'Implement ESLint and Prettier for code consistency',
          status: 'completed',
          priority: 'medium',
          category: 'testing',
          progress: 100,
          lastUpdated: '2024-01-15',
          notes: 'ESLint and Prettier configured and working'
        }
      ]
    },
    {
      id: 'deployment',
               title: '🚀 Deployment & DevOps',
         description: 'Set up production deployment and monitoring',
         status: 'in-progress',
         progress: 40,
      tasks: [
        {
          id: 'deploy-1',
                           title: 'Docker Containerization',
                 description: 'Create Docker images for API and web applications',
                 status: 'completed',
                 priority: 'medium',
                 category: 'deployment',
                 progress: 100,
                 lastUpdated: '2024-01-15',
                 notes: 'Optimized multi-stage builds with security, health checks, and production-ready configurations'
        },
        {
          id: 'deploy-2',
          title: 'Production Environment Setup',
          description: 'Configure production servers and environment variables',
          status: 'not-started',
          priority: 'high',
          category: 'deployment',
          progress: 0,
          lastUpdated: '2024-01-15',
          notes: 'Need to decide on hosting platform (Vercel, Railway, AWS)'
        },
        {
          id: 'deploy-3',
          title: 'Monitoring and Logging',
          description: 'Implement application monitoring and centralized logging',
          status: 'not-started',
          priority: 'medium',
          category: 'deployment',
          progress: 0,
          lastUpdated: '2024-01-15',
          notes: 'Consider using services like Sentry, LogRocket'
        }
      ]
    },
    {
      id: 'documentation',
      title: '📚 Documentation & Knowledge Base',
      description: 'Create comprehensive documentation for developers and users',
      status: 'in-progress',
      progress: 80,
      tasks: [
        {
          id: 'doc-1',
          title: 'README and Setup Guides',
          description: 'Create comprehensive project documentation',
          status: 'completed',
          priority: 'high',
          category: 'documentation',
          progress: 100,
          lastUpdated: '2024-01-15',
          notes: 'README.md and SETUP.md are comprehensive'
        },
        {
          id: 'doc-2',
          title: 'API Documentation',
          description: 'Document all API endpoints and usage examples',
          status: 'in-progress',
          priority: 'medium',
          category: 'documentation',
          progress: 60,
          lastUpdated: '2024-01-15',
          notes: 'Basic endpoint documentation exists'
        },
        {
          id: 'doc-3',
          title: 'Component Library Docs',
          description: 'Document shared UI components with examples',
          status: 'not-started',
          priority: 'low',
          category: 'documentation',
          progress: 0,
          lastUpdated: '2024-01-15',
          notes: 'Need to create Storybook or similar'
        }
      ]
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'not-started': return 'bg-gray-100 text-gray-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'setup': return '🚀';
      case 'development': return '⚙️';
      case 'testing': return '🧪';
      case 'deployment': return '🚀';
      case 'documentation': return '📚';
      default: return '📋';
    }
  };

  const overallProgress = Math.round(
    objectives.reduce((acc, obj) => acc + obj.progress, 0) / objectives.length
  );

  return (
    <div className="space-y-8">
      {/* Overall Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Overall Project Progress</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-3xl font-bold text-blue-600">{overallProgress}%</div>
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {objectives.filter(o => o.status === 'completed').length}
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {objectives.filter(o => o.status === 'in-progress').length}
            </div>
            <div className="text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {objectives.filter(o => o.status === 'not-started').length}
            </div>
            <div className="text-gray-600">Not Started</div>
          </div>
        </div>
      </div>

      {/* Objectives */}
      <div className="space-y-6">
        {objectives.map((objective) => (
          <div key={objective.id} className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{objective.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(objective.status)}`}>
                  {objective.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{objective.description}</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${objective.progress}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">{objective.progress}%</span>
              </div>
            </div>
            
            {/* Tasks */}
            <div className="p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Tasks</h4>
              <div className="space-y-3">
                {objective.tasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(task.category)}</span>
                        <h5 className="font-medium text-gray-900">{task.title}</h5>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{task.progress}%</span>
                    </div>
                    {task.notes && (
                      <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
                        <strong>Notes:</strong> {task.notes}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      Last updated: {task.lastUpdated}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-blue-900 mb-4">🎯 Next Steps</h3>
        <div className="space-y-3">
                           <div className="flex items-center gap-3">
                   <span className="text-blue-600">1.</span>
                   <span className="text-blue-800">Choose and set up production hosting platform (Vercel, Railway, AWS)</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="text-blue-600">2.</span>
                   <span className="text-blue-800">Implement monitoring, logging, and health checks</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="text-blue-600">3.</span>
                   <span className="text-blue-800">Set up CI/CD pipeline for production deployment</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="text-blue-600">4.</span>
                   <span className="text-blue-800">Configure SSL certificates and domain setup</span>
                 </div>
        </div>
      </div>
    </div>
  );
}
