import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import Alert from '../ui/Alert';
import translationWorkflowService from '../../services/translationWorkflowService';

const WorkflowBuilder = () => {
  const [workflows, setWorkflows] = useState([]);
  const [activeWorkflows, setActiveWorkflows] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    description: '',
    triggers: [],
    steps: [],
    schedule: 'manual',
    priority: 'medium'
  });

  const availableSteps = [
    { id: 'detect-new-content', name: 'Detect New Content', description: 'Scan for new content that needs translation' },
    { id: 'extract-text', name: 'Extract Text', description: 'Extract translatable text from content' },
    { id: 'translate-content', name: 'Translate Content', description: 'Translate content using AI services' },
    { id: 'validate-translation', name: 'Validate Translation', description: 'Validate translation quality' },
    { id: 'deploy-updates', name: 'Deploy Updates', description: 'Deploy translation updates' },
    { id: 'collect-feedback', name: 'Collect Feedback', description: 'Collect user feedback on translations' },
    { id: 'analyze-issues', name: 'Analyze Issues', description: 'Analyze translation issues and patterns' },
    { id: 'retrain-models', name: 'Retrain Models', description: 'Retrain ML models with new data' },
    { id: 'test-improvements', name: 'Test Improvements', description: 'Test translation improvements' },
    { id: 'validate-import', name: 'Validate Import', description: 'Validate bulk import data' },
    { id: 'batch-translate', name: 'Batch Translate', description: 'Execute batch translation' },
    { id: 'quality-check', name: 'Quality Check', description: 'Perform quality checks on translations' },
    { id: 'approve-translations', name: 'Approve Translations', description: 'Approve translations for deployment' },
    { id: 'deploy-batch', name: 'Deploy Batch', description: 'Deploy batch translations' },
    { id: 'track-usage', name: 'Track Usage', description: 'Track translation usage patterns' },
    { id: 'analyze-patterns', name: 'Analyze Patterns', description: 'Analyze usage patterns for improvements' },
    { id: 'update-context-model', name: 'Update Context Model', description: 'Update context understanding model' },
    { id: 'validate-improvements', name: 'Validate Improvements', description: 'Validate context improvements' },
    { id: 'deploy-context-updates', name: 'Deploy Context Updates', description: 'Deploy context model updates' }
  ];

  const availableTriggers = [
    { id: 'new-content', name: 'New Content', description: 'Triggered when new content is detected' },
    { id: 'content-update', name: 'Content Update', description: 'Triggered when existing content is updated' },
    { id: 'user-feedback', name: 'User Feedback', description: 'Triggered when user feedback is received' },
    { id: 'quality-score', name: 'Quality Score', description: 'Triggered when quality score drops below threshold' },
    { id: 'scheduled', name: 'Scheduled', description: 'Triggered on a schedule (daily, weekly, etc.)' },
    { id: 'bulk-import', name: 'Bulk Import', description: 'Triggered when bulk content is imported' },
    { id: 'user-interaction', name: 'User Interaction', description: 'Triggered by user interactions' },
    { id: 'translation-usage', name: 'Translation Usage', description: 'Triggered by translation usage patterns' }
  ];

  const schedules = [
    { id: 'manual', name: 'Manual', description: 'Execute only when manually triggered' },
    { id: 'realtime', name: 'Real-time', description: 'Monitor and execute automatically' },
    { id: 'daily', name: 'Daily', description: 'Execute once per day' },
    { id: 'weekly', name: 'Weekly', description: 'Execute once per week' },
    { id: 'monthly', name: 'Monthly', description: 'Execute once per month' }
  ];

  const priorities = [
    { id: 'low', name: 'Low', description: 'Low priority, can be delayed' },
    { id: 'medium', name: 'Medium', description: 'Normal priority' },
    { id: 'high', name: 'High', description: 'High priority, execute quickly' },
    { id: 'critical', name: 'Critical', description: 'Critical priority, execute immediately' }
  ];

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = () => {
    const allWorkflows = translationWorkflowService.getWorkflows();
    const active = translationWorkflowService.getActiveWorkflows();
    
    setWorkflows(allWorkflows);
    setActiveWorkflows(active);
  };

  const handleWorkflowFormChange = (field, value) => {
    setWorkflowForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addStep = (stepId) => {
    const step = availableSteps.find(s => s.id === stepId);
    if (step && !workflowForm.steps.includes(stepId)) {
      setWorkflowForm(prev => ({
        ...prev,
        steps: [...prev.steps, stepId]
      }));
    }
  };

  const removeStep = (stepIndex) => {
    setWorkflowForm(prev => ({
      ...prev,
      steps: prev.steps.filter((_, index) => index !== stepIndex)
    }));
  };

  const moveStep = (fromIndex, toIndex) => {
    const newSteps = [...workflowForm.steps];
    const [movedStep] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, movedStep);
    
    setWorkflowForm(prev => ({
      ...prev,
      steps: newSteps
    }));
  };

  const addTrigger = (triggerId) => {
    if (!workflowForm.triggers.includes(triggerId)) {
      setWorkflowForm(prev => ({
        ...prev,
        triggers: [...prev.triggers, triggerId]
      }));
    }
  };

  const removeTrigger = (triggerId) => {
    setWorkflowForm(prev => ({
      ...prev,
      triggers: prev.triggers.filter(t => t !== triggerId)
    }));
  };

  const saveWorkflow = () => {
    if (!workflowForm.name || workflowForm.steps.length === 0) {
      alert('Please provide a name and at least one step for the workflow');
      return;
    }

    try {
      if (editingWorkflow) {
        // Update existing workflow
        const updatedWorkflow = {
          ...editingWorkflow,
          ...workflowForm,
          updatedAt: new Date().toISOString()
        };
        
        // Update in service
        translationWorkflowService.updateWorkflow(editingWorkflow.id, updatedWorkflow);
      } else {
        // Create new workflow
        const newWorkflow = translationWorkflowService.createWorkflow(workflowForm);
        console.log('Created new workflow:', newWorkflow);
      }

      // Reset form and reload workflows
      setWorkflowForm({
        name: '',
        description: '',
        triggers: [],
        steps: [],
        schedule: 'manual',
        priority: 'medium'
      });
      setEditingWorkflow(null);
      setShowBuilder(false);
      loadWorkflows();
      
      alert('Workflow saved successfully!');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow');
    }
  };

  const editWorkflow = (workflow) => {
    setEditingWorkflow(workflow);
    setWorkflowForm({
      name: workflow.name,
      description: workflow.description,
      triggers: workflow.triggers || [],
      steps: workflow.steps || [],
      schedule: workflow.schedule || 'manual',
      priority: workflow.priority || 'medium'
    });
    setShowBuilder(true);
  };

  const deleteWorkflow = (workflowId) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      try {
        translationWorkflowService.deleteWorkflow(workflowId);
        loadWorkflows();
        alert('Workflow deleted successfully!');
      } catch (error) {
        console.error('Failed to delete workflow:', error);
        alert('Failed to delete workflow');
      }
    }
  };

  const activateWorkflow = (workflowId) => {
    try {
      translationWorkflowService.activateWorkflow(workflowId);
      loadWorkflows();
      alert('Workflow activated successfully!');
    } catch (error) {
      console.error('Failed to activate workflow:', error);
      alert('Failed to activate workflow');
    }
  };

  const deactivateWorkflow = (workflowId) => {
    try {
      translationWorkflowService.deactivateWorkflow(workflowId);
      loadWorkflows();
      alert('Workflow deactivated successfully!');
    } catch (error) {
      console.error('Failed to deactivate workflow:', error);
      alert('Failed to deactivate workflow');
    }
  };

  const executeWorkflow = async (workflowId) => {
    try {
      await translationWorkflowService.executeWorkflow(workflowId);
      alert('Workflow executed successfully!');
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      alert('Failed to execute workflow');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflow Builder</h1>
          <p className="text-gray-600 mt-2">Create and manage automated translation workflows</p>
        </div>
        <Button onClick={() => setShowBuilder(true)}>
          Create New Workflow
        </Button>
      </div>

      {/* Workflow Builder */}
      {showBuilder && (
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
              </h2>
              <Button
                onClick={() => {
                  setShowBuilder(false);
                  setEditingWorkflow(null);
                  setWorkflowForm({
                    name: '',
                    description: '',
                    triggers: [],
                    steps: [],
                    schedule: 'manual',
                    priority: 'medium'
                  });
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workflow Name
                  </label>
                  <Input
                    value={workflowForm.name}
                    onChange={(e) => handleWorkflowFormChange('name', e.target.value)}
                    placeholder="Enter workflow name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={workflowForm.description}
                    onChange={(e) => handleWorkflowFormChange('description', e.target.value)}
                    placeholder="Describe what this workflow does"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule
                  </label>
                  <select
                    value={workflowForm.schedule}
                    onChange={(e) => handleWorkflowFormChange('schedule', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {schedules.map(schedule => (
                      <option key={schedule.id} value={schedule.id}>
                        {schedule.name} - {schedule.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={workflowForm.priority}
                    onChange={(e) => handleWorkflowFormChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {priorities.map(priority => (
                      <option key={priority.id} value={priority.id}>
                        {priority.name} - {priority.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Triggers */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Triggers
                  </label>
                  <div className="space-y-2">
                    {workflowForm.triggers.map(triggerId => {
                      const trigger = availableTriggers.find(t => t.id === triggerId);
                      return (
                        <div key={triggerId} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-sm">{trigger?.name}</span>
                          <button
                            onClick={() => removeTrigger(triggerId)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <select
                    onChange={(e) => addTrigger(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    defaultValue=""
                  >
                    <option value="">Add trigger...</option>
                    {availableTriggers
                      .filter(t => !workflowForm.triggers.includes(t.id))
                      .map(trigger => (
                        <option key={trigger.id} value={trigger.id}>
                          {trigger.name} - {trigger.description}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Workflow Steps */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Workflow Steps
              </label>
              
              <div className="space-y-3">
                {workflowForm.steps.map((stepId, index) => {
                  const step = availableSteps.find(s => s.id === stepId);
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                      <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium">{step?.name}</div>
                        <div className="text-sm text-gray-600">{step?.description}</div>
                      </div>
                      <div className="flex space-x-2">
                        {index > 0 && (
                          <button
                            onClick={() => moveStep(index, index - 1)}
                            className="p-1 text-gray-600 hover:text-gray-800"
                          >
                            ↑
                          </button>
                        )}
                        {index < workflowForm.steps.length - 1 && (
                          <button
                            onClick={() => moveStep(index, index + 1)}
                            className="p-1 text-gray-600 hover:text-gray-800"
                          >
                            ↓
                          </button>
                        )}
                        <button
                          onClick={() => removeStep(index)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <select
                onChange={(e) => addStep(e.target.value)}
                className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                defaultValue=""
              >
                <option value="">Add step...</option>
                {availableSteps
                  .filter(step => !workflowForm.steps.includes(step.id))
                  .map(step => (
                    <option key={step.id} value={step.id}>
                      {step.name} - {step.description}
                    </option>
                  ))}
              </select>
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <Button onClick={saveWorkflow}>
                {editingWorkflow ? 'Update Workflow' : 'Create Workflow'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Active Workflows */}
      {activeWorkflows.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Active Workflows</h2>
            <div className="space-y-4">
              {activeWorkflows.map(workflow => (
                <div key={workflow.id} className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <h3 className="font-medium text-green-900">{workflow.name}</h3>
                      <p className="text-sm text-green-700">
                        Started: {new Date(workflow.startedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => executeWorkflow(workflow.id)}
                      size="sm"
                    >
                      Execute Now
                    </Button>
                    <Button
                      onClick={() => deactivateWorkflow(workflow.id)}
                      variant="outline"
                      size="sm"
                    >
                      Deactivate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* All Workflows */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">All Workflows</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map(workflow => (
              <div key={workflow.id} className="border border-gray-200 rounded-lg p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                    <div className={`w-3 h-3 rounded-full ${
                      workflow.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                  </div>
                  
                  <p className="text-sm text-gray-600">{workflow.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Schedule:</span>
                      <span className="font-medium capitalize">{workflow.schedule}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Priority:</span>
                      <span className="font-medium capitalize">{workflow.priority}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Steps:</span>
                      <span className="font-medium">{workflow.steps.length}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {workflow.isActive ? (
                      <>
                        <Button
                          onClick={() => executeWorkflow(workflow.id)}
                          size="sm"
                          className="flex-1"
                        >
                          Execute
                        </Button>
                        <Button
                          onClick={() => deactivateWorkflow(workflow.id)}
                          variant="outline"
                          size="sm"
                        >
                          Stop
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => activateWorkflow(workflow.id)}
                        className="flex-1"
                        size="sm"
                      >
                        Activate
                      </Button>
                    )}
                    <Button
                      onClick={() => editWorkflow(workflow)}
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => deleteWorkflow(workflow.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WorkflowBuilder;
