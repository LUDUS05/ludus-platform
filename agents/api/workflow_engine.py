"""
LUDUS Workflow Engine - Orchestration system for automated agent workflows
"""

import json
import uuid
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable
from pydantic import BaseModel
from enum import Enum
import logging

from .ui_ux_agent import UIUXAgent, DesignRequest, DesignType, DesignComplexity
from .fullstack_agent import FullstackAgent, DevelopmentRequest, DevelopmentType, TechStack
from .debugging_agent import DebuggingAgent, DebuggingRequest, IssueType, Severity


class WorkflowStatus(str, Enum):
    """Workflow execution status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"
    CANCELLED = "cancelled"


class TaskStatus(str, Enum):
    """Task execution status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


class AgentType(str, Enum):
    """Available agent types"""
    UI_UX = "ui_ux"
    FULLSTACK = "fullstack"
    DEBUGGING = "debugging"


class WorkflowTemplate(str, Enum):
    """Predefined workflow templates"""
    FEATURE_DEVELOPMENT = "feature_development"
    BUG_FIX = "bug_fix"
    PERFORMANCE_OPTIMIZATION = "performance_optimization"
    SECURITY_AUDIT = "security_audit"
    UI_REDESIGN = "ui_redesign"
    API_DEVELOPMENT = "api_development"


class Task(BaseModel):
    """Individual task in a workflow"""
    id: str
    workflow_id: str
    agent_type: AgentType
    status: TaskStatus = TaskStatus.PENDING
    input_data: Dict[str, Any]
    output_data: Optional[Dict[str, Any]] = None
    dependencies: List[str] = []
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    retry_count: int = 0
    max_retries: int = 3


class Workflow(BaseModel):
    """Workflow definition and state"""
    id: str
    name: str
    template: WorkflowTemplate
    status: WorkflowStatus = WorkflowStatus.PENDING
    tasks: List[Task] = []
    current_task_id: Optional[str] = None
    results: Dict[str, Any] = {}
    metadata: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class WorkflowEngine:
    """Main workflow orchestration engine"""
    
    def __init__(self, redis_client=None, ollama_client=None):
        self.redis_client = redis_client
        self.ollama_client = ollama_client
        self.agents = {
            AgentType.UI_UX: UIUXAgent(redis_client, ollama_client),
            AgentType.FULLSTACK: FullstackAgent(redis_client, ollama_client),
            AgentType.DEBUGGING: DebuggingAgent(redis_client, ollama_client)
        }
        self.workflow_templates = self._load_workflow_templates()
        self.logger = logging.getLogger(__name__)
        
    def _load_workflow_templates(self) -> Dict[str, List[Dict[str, Any]]]:
        """Load predefined workflow templates"""
        return {
            WorkflowTemplate.FEATURE_DEVELOPMENT: [
                {
                    "agent_type": AgentType.UI_UX,
                    "task_name": "Design Analysis",
                    "description": "Analyze requirements and create design specifications",
                    "input_mapping": {"requirements": "requirements", "language": "language"},
                    "output_mapping": {"design_specs": "design_specifications"}
                },
                {
                    "agent_type": AgentType.UI_UX,
                    "task_name": "UI Component Design",
                    "description": "Create UI components and layouts",
                    "dependencies": ["Design Analysis"],
                    "input_mapping": {"design_specs": "design_specifications"},
                    "output_mapping": {"components": "generated_code"}
                },
                {
                    "agent_type": AgentType.FULLSTACK,
                    "task_name": "Backend Development",
                    "description": "Develop API endpoints and business logic",
                    "dependencies": ["Design Analysis"],
                    "input_mapping": {"requirements": "requirements"},
                    "output_mapping": {"api_code": "generated_code"}
                },
                {
                    "agent_type": AgentType.FULLSTACK,
                    "task_name": "Frontend Development",
                    "description": "Develop frontend components and integration",
                    "dependencies": ["UI Component Design", "Backend Development"],
                    "input_mapping": {"components": "generated_code", "api_code": "generated_code"},
                    "output_mapping": {"frontend_code": "generated_code"}
                },
                {
                    "agent_type": AgentType.DEBUGGING,
                    "task_name": "Integration Testing",
                    "description": "Test integration between frontend and backend",
                    "dependencies": ["Frontend Development"],
                    "input_mapping": {"frontend_code": "generated_code", "api_code": "generated_code"},
                    "output_mapping": {"test_results": "test_cases"}
                },
                {
                    "agent_type": AgentType.DEBUGGING,
                    "task_name": "Performance Optimization",
                    "description": "Optimize performance and fix issues",
                    "dependencies": ["Integration Testing"],
                    "input_mapping": {"test_results": "test_cases"},
                    "output_mapping": {"optimizations": "performance_optimizations"}
                }
            ],
            WorkflowTemplate.BUG_FIX: [
                {
                    "agent_type": AgentType.DEBUGGING,
                    "task_name": "Issue Analysis",
                    "description": "Analyze the bug and identify root cause",
                    "input_mapping": {"error_message": "error_message", "stack_trace": "stack_trace"},
                    "output_mapping": {"root_cause": "root_cause_analysis"}
                },
                {
                    "agent_type": AgentType.DEBUGGING,
                    "task_name": "Fix Generation",
                    "description": "Generate fixes for the identified issues",
                    "dependencies": ["Issue Analysis"],
                    "input_mapping": {"root_cause": "root_cause_analysis"},
                    "output_mapping": {"fixes": "suggested_fixes"}
                },
                {
                    "agent_type": AgentType.FULLSTACK,
                    "task_name": "Code Implementation",
                    "description": "Implement the generated fixes",
                    "dependencies": ["Fix Generation"],
                    "input_mapping": {"fixes": "suggested_fixes"},
                    "output_mapping": {"fixed_code": "generated_code"}
                },
                {
                    "agent_type": AgentType.DEBUGGING,
                    "task_name": "Validation Testing",
                    "description": "Test the fixes to ensure they work correctly",
                    "dependencies": ["Code Implementation"],
                    "input_mapping": {"fixed_code": "generated_code"},
                    "output_mapping": {"validation_results": "test_cases"}
                }
            ],
            WorkflowTemplate.PERFORMANCE_OPTIMIZATION: [
                {
                    "agent_type": AgentType.DEBUGGING,
                    "task_name": "Performance Analysis",
                    "description": "Analyze current performance bottlenecks",
                    "input_mapping": {"logs": "logs", "metrics": "environment"},
                    "output_mapping": {"bottlenecks": "performance_optimizations"}
                },
                {
                    "agent_type": AgentType.FULLSTACK,
                    "task_name": "Backend Optimization",
                    "description": "Optimize backend performance",
                    "dependencies": ["Performance Analysis"],
                    "input_mapping": {"bottlenecks": "performance_optimizations"},
                    "output_mapping": {"backend_optimizations": "generated_code"}
                },
                {
                    "agent_type": AgentType.UI_UX,
                    "task_name": "Frontend Optimization",
                    "description": "Optimize frontend performance",
                    "dependencies": ["Performance Analysis"],
                    "input_mapping": {"bottlenecks": "performance_optimizations"},
                    "output_mapping": {"frontend_optimizations": "generated_code"}
                },
                {
                    "agent_type": AgentType.DEBUGGING,
                    "task_name": "Performance Validation",
                    "description": "Validate performance improvements",
                    "dependencies": ["Backend Optimization", "Frontend Optimization"],
                    "input_mapping": {"backend_optimizations": "generated_code", "frontend_optimizations": "generated_code"},
                    "output_mapping": {"validation_results": "performance_optimizations"}
                }
            ],
            WorkflowTemplate.SECURITY_AUDIT: [
                {
                    "agent_type": AgentType.DEBUGGING,
                    "task_name": "Security Analysis",
                    "description": "Analyze code for security vulnerabilities",
                    "input_mapping": {"code_snippet": "code_snippet"},
                    "output_mapping": {"vulnerabilities": "security_recommendations"}
                },
                {
                    "agent_type": AgentType.FULLSTACK,
                    "task_name": "Security Fixes",
                    "description": "Implement security fixes",
                    "dependencies": ["Security Analysis"],
                    "input_mapping": {"vulnerabilities": "security_recommendations"},
                    "output_mapping": {"security_fixes": "generated_code"}
                },
                {
                    "agent_type": AgentType.DEBUGGING,
                    "task_name": "Security Testing",
                    "description": "Test security fixes",
                    "dependencies": ["Security Fixes"],
                    "input_mapping": {"security_fixes": "generated_code"},
                    "output_mapping": {"security_test_results": "test_cases"}
                }
            ]
        }
    
    def create_workflow(self, name: str, template: WorkflowTemplate, input_data: Dict[str, Any]) -> Workflow:
        """Create a new workflow from a template"""
        workflow_id = str(uuid.uuid4())
        
        # Create workflow
        workflow = Workflow(
            id=workflow_id,
            name=name,
            template=template,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # Create tasks from template
        template_tasks = self.workflow_templates.get(template, [])
        tasks = []
        
        for i, task_template in enumerate(template_tasks):
            task_id = str(uuid.uuid4())
            
            # Map input data to task input
            task_input = {}
            for input_key, data_key in task_template.get("input_mapping", {}).items():
                if data_key in input_data:
                    task_input[input_key] = input_data[data_key]
            
            task = Task(
                id=task_id,
                workflow_id=workflow_id,
                agent_type=AgentType(task_template["agent_type"]),
                input_data=task_input,
                dependencies=task_template.get("dependencies", []),
                created_at=datetime.now()
            )
            tasks.append(task)
        
        workflow.tasks = tasks
        
        # Save to Redis
        if self.redis_client:
            self._save_workflow(workflow)
        
        return workflow
    
    def start_workflow(self, workflow_id: str) -> bool:
        """Start workflow execution"""
        workflow = self.get_workflow(workflow_id)
        if not workflow:
            return False
        
        if workflow.status != WorkflowStatus.PENDING:
            return False
        
        workflow.status = WorkflowStatus.RUNNING
        workflow.started_at = datetime.now()
        workflow.updated_at = datetime.now()
        
        # Save updated workflow
        if self.redis_client:
            self._save_workflow(workflow)
        
        # Start execution
        asyncio.create_task(self._execute_workflow(workflow_id))
        
        return True
    
    async def _execute_workflow(self, workflow_id: str):
        """Execute workflow tasks in order"""
        workflow = self.get_workflow(workflow_id)
        if not workflow:
            return
        
        try:
            # Execute tasks in dependency order
            completed_tasks = set()
            
            while len(completed_tasks) < len(workflow.tasks):
                # Find tasks that can be executed (dependencies satisfied)
                ready_tasks = []
                for task in workflow.tasks:
                    if (task.id not in completed_tasks and 
                        task.status == TaskStatus.PENDING and
                        all(dep in completed_tasks for dep in task.dependencies)):
                        ready_tasks.append(task)
                
                if not ready_tasks:
                    # No ready tasks, check for failures
                    failed_tasks = [t for t in workflow.tasks if t.status == TaskStatus.FAILED]
                    if failed_tasks:
                        workflow.status = WorkflowStatus.FAILED
                        workflow.updated_at = datetime.now()
                        if self.redis_client:
                            self._save_workflow(workflow)
                        return
                    else:
                        # Wait for tasks to complete
                        await asyncio.sleep(1)
                        continue
                
                # Execute ready tasks in parallel
                tasks_to_execute = []
                for task in ready_tasks:
                    task.status = TaskStatus.RUNNING
                    task.started_at = datetime.now()
                    tasks_to_execute.append(self._execute_task(task))
                
                # Wait for all tasks to complete
                results = await asyncio.gather(*tasks_to_execute, return_exceptions=True)
                
                # Update task statuses
                for i, result in enumerate(results):
                    task = ready_tasks[i]
                    if isinstance(result, Exception):
                        task.status = TaskStatus.FAILED
                        task.error_message = str(result)
                        task.completed_at = datetime.now()
                    else:
                        task.status = TaskStatus.COMPLETED
                        task.output_data = result
                        task.completed_at = datetime.now()
                        completed_tasks.add(task.id)
                
                # Update workflow
                workflow.updated_at = datetime.now()
                if self.redis_client:
                    self._save_workflow(workflow)
            
            # All tasks completed
            workflow.status = WorkflowStatus.COMPLETED
            workflow.completed_at = datetime.now()
            workflow.updated_at = datetime.now()
            
            # Aggregate results
            workflow.results = self._aggregate_results(workflow)
            
            if self.redis_client:
                self._save_workflow(workflow)
                
        except Exception as e:
            self.logger.error(f"Workflow execution failed: {str(e)}")
            workflow.status = WorkflowStatus.FAILED
            workflow.updated_at = datetime.now()
            if self.redis_client:
                self._save_workflow(workflow)
    
    async def _execute_task(self, task: Task) -> Dict[str, Any]:
        """Execute a single task"""
        try:
            agent = self.agents.get(task.agent_type)
            if not agent:
                raise Exception(f"Agent {task.agent_type} not found")
            
            # Execute based on agent type
            if task.agent_type == AgentType.UI_UX:
                return await self._execute_ui_ux_task(agent, task)
            elif task.agent_type == AgentType.FULLSTACK:
                return await self._execute_fullstack_task(agent, task)
            elif task.agent_type == AgentType.DEBUGGING:
                return await self._execute_debugging_task(agent, task)
            else:
                raise Exception(f"Unknown agent type: {task.agent_type}")
                
        except Exception as e:
            self.logger.error(f"Task execution failed: {str(e)}")
            raise
    
    async def _execute_ui_ux_task(self, agent: UIUXAgent, task: Task) -> Dict[str, Any]:
        """Execute UI/UX agent task"""
        request_data = DesignRequest(
            request_id=task.id,
            design_type=DesignType(task.input_data.get("design_type", "component")),
            complexity=DesignComplexity(task.input_data.get("complexity", "simple")),
            requirements=task.input_data.get("requirements", ""),
            language=task.input_data.get("language", "ar")
        )
        
        response = agent.create_design_request(request_data)
        return {
            "status": response.status,
            "design_output": response.design_output,
            "generated_code": response.generated_code,
            "design_specifications": response.design_specifications,
            "accessibility_score": response.accessibility_score,
            "recommendations": response.recommendations
        }
    
    async def _execute_fullstack_task(self, agent: FullstackAgent, task: Task) -> Dict[str, Any]:
        """Execute Fullstack agent task"""
        tech_stack = [TechStack(tech) for tech in task.input_data.get("tech_stack", ["react", "nodejs"])]
        
        request_data = DevelopmentRequest(
            request_id=task.id,
            development_type=DevelopmentType(task.input_data.get("development_type", "api")),
            tech_stack=tech_stack,
            requirements=task.input_data.get("requirements", ""),
            language=task.input_data.get("language", "ar")
        )
        
        response = agent.create_development_request(request_data)
        return {
            "status": response.status,
            "generated_code": response.generated_code,
            "api_endpoints": response.api_endpoints,
            "database_queries": response.database_queries,
            "test_cases": response.test_cases,
            "documentation": response.documentation,
            "recommendations": response.recommendations
        }
    
    async def _execute_debugging_task(self, agent: DebuggingAgent, task: Task) -> Dict[str, Any]:
        """Execute Debugging agent task"""
        request_data = DebuggingRequest(
            request_id=task.id,
            issue_type=IssueType(task.input_data.get("issue_type", "error")),
            severity=Severity(task.input_data.get("severity", "medium")),
            error_message=task.input_data.get("error_message"),
            stack_trace=task.input_data.get("stack_trace"),
            code_snippet=task.input_data.get("code_snippet"),
            logs=task.input_data.get("logs"),
            environment=task.input_data.get("environment"),
            reproduction_steps=task.input_data.get("reproduction_steps"),
            expected_behavior=task.input_data.get("expected_behavior"),
            actual_behavior=task.input_data.get("actual_behavior")
        )
        
        response = agent.create_debugging_request(request_data)
        return {
            "status": response.status,
            "root_cause_analysis": response.root_cause_analysis,
            "suggested_fixes": response.suggested_fixes,
            "code_fixes": response.code_fixes,
            "test_cases": response.test_cases,
            "performance_optimizations": response.performance_optimizations,
            "security_recommendations": response.security_recommendations,
            "confidence_score": response.confidence_score
        }
    
    def _aggregate_results(self, workflow: Workflow) -> Dict[str, Any]:
        """Aggregate results from all completed tasks"""
        results = {
            "workflow_id": workflow.id,
            "template": workflow.template,
            "total_tasks": len(workflow.tasks),
            "completed_tasks": len([t for t in workflow.tasks if t.status == TaskStatus.COMPLETED]),
            "failed_tasks": len([t for t in workflow.tasks if t.status == TaskStatus.FAILED]),
            "execution_time": None,
            "task_results": {}
        }
        
        if workflow.started_at and workflow.completed_at:
            results["execution_time"] = (workflow.completed_at - workflow.started_at).total_seconds()
        
        for task in workflow.tasks:
            if task.status == TaskStatus.COMPLETED and task.output_data:
                results["task_results"][task.id] = {
                    "agent_type": task.agent_type,
                    "output": task.output_data,
                    "execution_time": (task.completed_at - task.started_at).total_seconds() if task.started_at and task.completed_at else None
                }
        
        return results
    
    def pause_workflow(self, workflow_id: str) -> bool:
        """Pause workflow execution"""
        workflow = self.get_workflow(workflow_id)
        if not workflow or workflow.status != WorkflowStatus.RUNNING:
            return False
        
        workflow.status = WorkflowStatus.PAUSED
        workflow.updated_at = datetime.now()
        
        if self.redis_client:
            self._save_workflow(workflow)
        
        return True
    
    def resume_workflow(self, workflow_id: str) -> bool:
        """Resume paused workflow"""
        workflow = self.get_workflow(workflow_id)
        if not workflow or workflow.status != WorkflowStatus.PAUSED:
            return False
        
        workflow.status = WorkflowStatus.RUNNING
        workflow.updated_at = datetime.now()
        
        if self.redis_client:
            self._save_workflow(workflow)
        
        # Resume execution
        asyncio.create_task(self._execute_workflow(workflow_id))
        
        return True
    
    def cancel_workflow(self, workflow_id: str) -> bool:
        """Cancel workflow execution"""
        workflow = self.get_workflow(workflow_id)
        if not workflow or workflow.status in [WorkflowStatus.COMPLETED, WorkflowStatus.FAILED, WorkflowStatus.CANCELLED]:
            return False
        
        workflow.status = WorkflowStatus.CANCELLED
        workflow.updated_at = datetime.now()
        
        if self.redis_client:
            self._save_workflow(workflow)
        
        return True
    
    def get_workflow(self, workflow_id: str) -> Optional[Workflow]:
        """Get workflow by ID"""
        if not self.redis_client:
            return None
        
        try:
            key = f"workflow:{workflow_id}"
            data = self.redis_client.get(key)
            if data:
                workflow_data = json.loads(data)
                return Workflow(**workflow_data)
        except Exception as e:
            self.logger.error(f"Error getting workflow: {str(e)}")
        
        return None
    
    def get_all_workflows(self) -> List[Workflow]:
        """Get all workflows"""
        if not self.redis_client:
            return []
        
        try:
            keys = self.redis_client.keys("workflow:*")
            workflows = []
            
            for key in keys:
                data = self.redis_client.get(key)
                if data:
                    workflow_data = json.loads(data)
                    workflows.append(Workflow(**workflow_data))
            
            return sorted(workflows, key=lambda w: w.created_at, reverse=True)
        except Exception as e:
            self.logger.error(f"Error getting workflows: {str(e)}")
            return []
    
    def _save_workflow(self, workflow: Workflow):
        """Save workflow to Redis"""
        try:
            key = f"workflow:{workflow.id}"
            data = workflow.dict()
            # Convert datetime objects to ISO strings
            for field in ['created_at', 'updated_at', 'started_at', 'completed_at']:
                if data.get(field):
                    data[field] = data[field].isoformat()
            
            # Convert task datetime objects
            for task in data.get('tasks', []):
                for field in ['created_at', 'started_at', 'completed_at']:
                    if task.get(field):
                        task[field] = task[field].isoformat()
            
            self.redis_client.setex(key, 60 * 60 * 24 * 30, json.dumps(data))  # 30 days
        except Exception as e:
            self.logger.error(f"Error saving workflow: {str(e)}")
    
    def get_workflow_templates(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get available workflow templates"""
        return self.workflow_templates
    
    def get_workflow_status(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get workflow status and progress"""
        workflow = self.get_workflow(workflow_id)
        if not workflow:
            return None
        
        completed_tasks = len([t for t in workflow.tasks if t.status == TaskStatus.COMPLETED])
        total_tasks = len(workflow.tasks)
        progress = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        return {
            "workflow_id": workflow_id,
            "status": workflow.status,
            "progress": progress,
            "completed_tasks": completed_tasks,
            "total_tasks": total_tasks,
            "current_task": workflow.current_task_id,
            "created_at": workflow.created_at.isoformat(),
            "started_at": workflow.started_at.isoformat() if workflow.started_at else None,
            "completed_at": workflow.completed_at.isoformat() if workflow.completed_at else None
        }
