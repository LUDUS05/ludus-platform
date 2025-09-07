"""
LUDUS Fullstack Development Agent - Specialized agent for automated fullstack development
"""

import json
import uuid
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from pydantic import BaseModel
from enum import Enum


class DevelopmentType(str, Enum):
    """Types of development tasks"""
    API = "api"
    FRONTEND = "frontend"
    DATABASE = "database"
    INTEGRATION = "integration"
    TESTING = "testing"
    DEPLOYMENT = "deployment"
    OPTIMIZATION = "optimization"


class TechStack(str, Enum):
    """Supported technology stacks"""
    REACT = "react"
    NODEJS = "nodejs"
    PYTHON = "python"
    FIREBASE = "firebase"
    MONGODB = "mongodb"
    POSTGRESQL = "postgresql"
    REDIS = "redis"


class DevelopmentRequest(BaseModel):
    """Model for development requests"""
    request_id: str
    development_type: DevelopmentType
    tech_stack: List[TechStack]
    requirements: str
    language: str = "ar"
    existing_code: Optional[str] = None
    database_schema: Optional[Dict[str, Any]] = None
    api_endpoints: Optional[List[str]] = None
    frontend_components: Optional[List[str]] = None


class DevelopmentResponse(BaseModel):
    """Model for development responses"""
    request_id: str
    status: str
    generated_code: Dict[str, str]
    api_endpoints: List[Dict[str, Any]]
    database_queries: List[str]
    test_cases: List[Dict[str, Any]]
    deployment_config: Optional[Dict[str, Any]] = None
    documentation: str
    estimated_completion_time: int
    recommendations: List[str] = []


class FullstackAgent:
    """Specialized agent for fullstack development automation"""
    
    def __init__(self, redis_client=None, ollama_client=None):
        self.redis_client = redis_client
        self.ollama_client = ollama_client
        self.code_templates = self._load_code_templates()
        self.api_patterns = self._load_api_patterns()
        self.database_schemas = self._load_database_schemas()
        
    def _load_code_templates(self) -> Dict[str, Any]:
        """Load code templates for different development types"""
        return {
            "api": {
                "express": '''const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
{{ROUTES}}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${{PORT}}`);
});

module.exports = app;''',
                "fastapi": '''from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer
import uvicorn
from typing import List, Optional
import os

app = FastAPI(
    title="{{API_TITLE}}",
    description="{{API_DESCRIPTION}}",
    version="1.0.0"
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["*"]
)

security = HTTPBearer()

# Routes
{{ROUTES}}

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "{{TIMESTAMP}}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))'''
            },
            "frontend": {
                "react": '''import React, {{ useState, useEffect }} from 'react';
import {{ useTranslation }} from 'react-i18next';
import axios from 'axios';

const {{COMPONENT_NAME}} = ({{ props }}) => {{
  const {{ t }} = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {{
    fetchData();
  }}, []);

  const fetchData = async () => {{
    try {{
      setLoading(true);
      const response = await axios.get('{{API_ENDPOINT}}');
      setData(response.data);
    }} catch (err) {{
      setError(err.message);
    }} finally {{
      setLoading(false);
    }}
  }};

  if (loading) return <div>{{t('common.loading', {{ defaultValue: 'Loading...' }})}}</div>;
  if (error) return <div className="text-red-500">{{error}}</div>;

  return (
    <div className="{{COMPONENT_STYLES}}" dir={{t('common.direction', {{ defaultValue: 'ltr' }})}}>
      {{/* Component content */}}
    </div>
  );
}};

export default {{COMPONENT_NAME}};'''
            },
            "database": {
                "mongodb": '''const mongoose = require('mongoose');

const {{SCHEMA_NAME}}Schema = new mongoose.Schema({{
  {{SCHEMA_FIELDS}}
}}, {{
  timestamps: true,
  versionKey: false
}});

{{SCHEMA_NAME}}Schema.index({{ INDEXES }});

module.exports = mongoose.model('{{SCHEMA_NAME}}', {{SCHEMA_NAME}}Schema);''',
                "firebase": '''import {{ initializeApp }} from 'firebase/app';
import {{ getFirestore, collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs }} from 'firebase/firestore';

const firebaseConfig = {{
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
}};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const {{COLLECTION_NAME}}Service = {{
  async create(data) {{
    const docRef = doc(collection(db, '{{COLLECTION_NAME}}'));
    await setDoc(docRef, data);
    return docRef.id;
  }},
  
  async getById(id) {{
    const docRef = doc(db, '{{COLLECTION_NAME}}', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  }},
  
  async update(id, data) {{
    const docRef = doc(db, '{{COLLECTION_NAME}}', id);
    await updateDoc(docRef, data);
  }},
  
  async delete(id) {{
    const docRef = doc(db, '{{COLLECTION_NAME}}', id);
    await deleteDoc(docRef);
  }},
  
  async query(conditions) {{
    const q = query(collection(db, '{{COLLECTION_NAME}}'), where(conditions.field, conditions.operator, conditions.value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({{ id: doc.id, ...doc.data() }}));
  }}
}};'''
            }
        }
    
    def _load_api_patterns(self) -> Dict[str, Any]:
        """Load API endpoint patterns"""
        return {
            "crud": {
                "create": {
                    "method": "POST",
                    "path": "/{resource}",
                    "description": "Create new {resource}",
                    "validation": True,
                    "authentication": True
                },
                "read": {
                    "method": "GET", 
                    "path": "/{resource}/{id}",
                    "description": "Get {resource} by ID",
                    "validation": False,
                    "authentication": True
                },
                "update": {
                    "method": "PUT",
                    "path": "/{resource}/{id}",
                    "description": "Update {resource}",
                    "validation": True,
                    "authentication": True
                },
                "delete": {
                    "method": "DELETE",
                    "path": "/{resource}/{id}",
                    "description": "Delete {resource}",
                    "validation": False,
                    "authentication": True
                },
                "list": {
                    "method": "GET",
                    "path": "/{resource}",
                    "description": "List all {resource}",
                    "validation": False,
                    "authentication": True
                }
            },
            "search": {
                "method": "GET",
                "path": "/{resource}/search",
                "description": "Search {resource}",
                "validation": True,
                "authentication": True
            },
            "filter": {
                "method": "GET", 
                "path": "/{resource}/filter",
                "description": "Filter {resource}",
                "validation": True,
                "authentication": True
            }
        }
    
    def _load_database_schemas(self) -> Dict[str, Any]:
        """Load common database schemas"""
        return {
            "user": {
                "fields": {
                    "id": "String, required, unique",
                    "email": "String, required, unique",
                    "name": "String, required",
                    "phone": "String, optional",
                    "avatar": "String, optional",
                    "role": "String, enum: [user, admin, vendor], default: user",
                    "isActive": "Boolean, default: true",
                    "createdAt": "Date, default: Date.now",
                    "updatedAt": "Date, default: Date.now"
                },
                "indexes": ["email", "phone", "role"]
            },
            "activity": {
                "fields": {
                    "id": "String, required, unique",
                    "title": "String, required",
                    "description": "String, required",
                    "category": "String, required",
                    "location": "String, required",
                    "price": "Number, required",
                    "duration": "Number, required",
                    "maxParticipants": "Number, required",
                    "vendorId": "String, required, ref: User",
                    "images": "Array of Strings",
                    "isActive": "Boolean, default: true",
                    "createdAt": "Date, default: Date.now",
                    "updatedAt": "Date, default: Date.now"
                },
                "indexes": ["category", "location", "vendorId", "price"]
            },
            "booking": {
                "fields": {
                    "id": "String, required, unique",
                    "userId": "String, required, ref: User",
                    "activityId": "String, required, ref: Activity",
                    "date": "Date, required",
                    "time": "String, required",
                    "participants": "Number, required",
                    "totalPrice": "Number, required",
                    "status": "String, enum: [pending, confirmed, cancelled, completed], default: pending",
                    "paymentStatus": "String, enum: [pending, paid, refunded], default: pending",
                    "specialRequirements": "String, optional",
                    "createdAt": "Date, default: Date.now",
                    "updatedAt": "Date, default: Date.now"
                },
                "indexes": ["userId", "activityId", "date", "status"]
            }
        }
    
    def create_development_request(self, request_data: DevelopmentRequest) -> DevelopmentResponse:
        """Create a new fullstack development request"""
        try:
            # Generate code based on development type
            generated_code = self._generate_code(request_data)
            
            # Generate API endpoints
            api_endpoints = self._generate_api_endpoints(request_data)
            
            # Generate database queries
            database_queries = self._generate_database_queries(request_data)
            
            # Generate test cases
            test_cases = self._generate_test_cases(request_data)
            
            # Generate deployment configuration
            deployment_config = self._generate_deployment_config(request_data)
            
            # Generate documentation
            documentation = self._generate_documentation(request_data)
            
            # Estimate completion time
            completion_time = self._estimate_completion_time(request_data)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(request_data)
            
            # Save to Redis
            if self.redis_client:
                self._save_development_request(request_data.request_id, {
                    "generated_code": generated_code,
                    "api_endpoints": api_endpoints,
                    "database_queries": database_queries,
                    "test_cases": test_cases,
                    "deployment_config": deployment_config,
                    "documentation": documentation,
                    "created_at": datetime.now().isoformat()
                })
            
            return DevelopmentResponse(
                request_id=request_data.request_id,
                status="completed",
                generated_code=generated_code,
                api_endpoints=api_endpoints,
                database_queries=database_queries,
                test_cases=test_cases,
                deployment_config=deployment_config,
                documentation=documentation,
                estimated_completion_time=completion_time,
                recommendations=recommendations
            )
            
        except Exception as e:
            return DevelopmentResponse(
                request_id=request_data.request_id,
                status="error",
                generated_code={"error": str(e)},
                api_endpoints=[],
                database_queries=[],
                test_cases=[],
                deployment_config=None,
                documentation=f"Error: {str(e)}",
                estimated_completion_time=0,
                recommendations=[f"Error in development: {str(e)}"]
            )
    
    def _generate_code(self, request: DevelopmentRequest) -> Dict[str, str]:
        """Generate code based on development type and tech stack"""
        generated_code = {}
        
        for tech in request.tech_stack:
            if request.development_type == DevelopmentType.API:
                generated_code[f"{tech}_api"] = self._generate_api_code(request, tech)
            elif request.development_type == DevelopmentType.FRONTEND:
                generated_code[f"{tech}_frontend"] = self._generate_frontend_code(request, tech)
            elif request.development_type == DevelopmentType.DATABASE:
                generated_code[f"{tech}_database"] = self._generate_database_code(request, tech)
            elif request.development_type == DevelopmentType.INTEGRATION:
                generated_code[f"{tech}_integration"] = self._generate_integration_code(request, tech)
        
        return generated_code
    
    def _generate_api_code(self, request: DevelopmentRequest, tech: TechStack) -> str:
        """Generate API code for specific technology"""
        template = self.code_templates["api"].get(tech.value, "")
        
        if tech == TechStack.NODEJS:
            routes = self._generate_express_routes(request)
            return template.replace("{{ROUTES}}", routes)
        elif tech == TechStack.PYTHON:
            routes = self._generate_fastapi_routes(request)
            return template.replace("{{ROUTES}}", routes).replace("{{API_TITLE}}", "LUDUS API").replace("{{API_DESCRIPTION}}", "LUDUS Platform API")
        
        return template
    
    def _generate_express_routes(self, request: DevelopmentRequest) -> str:
        """Generate Express.js routes"""
        routes = []
        
        # Extract resource names from requirements
        resources = self._extract_resources(request.requirements)
        
        for resource in resources:
            # CRUD routes
            routes.append(f'''
// {resource.title()} routes
app.get('/api/{resource}', async (req, res) => {{
  try {{
    const {resource} = await {resource}Service.getAll();
    res.json({{ success: true, data: {resource} }});
  }} catch (error) {{
    res.status(500).json({{ success: false, error: error.message }});
  }}
}});

app.get('/api/{resource}/:id', async (req, res) => {{
  try {{
    const {resource} = await {resource}Service.getById(req.params.id);
    if (!{resource}) {{
      return res.status(404).json({{ success: false, error: '{resource.title()} not found' }});
    }}
    res.json({{ success: true, data: {resource} }});
  }} catch (error) {{
    res.status(500).json({{ success: false, error: error.message }});
  }}
}});

app.post('/api/{resource}', async (req, res) => {{
  try {{
    const {resource} = await {resource}Service.create(req.body);
    res.status(201).json({{ success: true, data: {resource} }});
  }} catch (error) {{
    res.status(400).json({{ success: false, error: error.message }});
  }}
}});

app.put('/api/{resource}/:id', async (req, res) => {{
  try {{
    const {resource} = await {resource}Service.update(req.params.id, req.body);
    res.json({{ success: true, data: {resource} }});
  }} catch (error) {{
    res.status(400).json({{ success: false, error: error.message }});
  }}
}});

app.delete('/api/{resource}/:id', async (req, res) => {{
  try {{
    await {resource}Service.delete(req.params.id);
    res.json({{ success: true, message: '{resource.title()} deleted successfully' }});
  }} catch (error) {{
    res.status(500).json({{ success: false, error: error.message }});
  }}
}});''')
        
        return '\n'.join(routes)
    
    def _generate_fastapi_routes(self, request: DevelopmentRequest) -> str:
        """Generate FastAPI routes"""
        routes = []
        
        resources = self._extract_resources(request.requirements)
        
        for resource in resources:
            routes.append(f'''
# {resource.title()} routes
@app.get("/api/{resource}")
async def get_{resource}(skip: int = 0, limit: int = 100):
    try:
        {resource} = await {resource}_service.get_all(skip=skip, limit=limit)
        return {{"success": True, "data": {resource}}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/{resource}/{{item_id}}")
async def get_{resource}_by_id(item_id: str):
    try:
        {resource} = await {resource}_service.get_by_id(item_id)
        if not {resource}:
            raise HTTPException(status_code=404, detail="{resource.title()} not found")
        return {{"success": True, "data": {resource}}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/{resource}")
async def create_{resource}({resource}_data: dict):
    try:
        {resource} = await {resource}_service.create({resource}_data)
        return {{"success": True, "data": {resource}}}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/{resource}/{{item_id}}")
async def update_{resource}(item_id: str, {resource}_data: dict):
    try:
        {resource} = await {resource}_service.update(item_id, {resource}_data)
        return {{"success": True, "data": {resource}}}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/{resource}/{{item_id}}")
async def delete_{resource}(item_id: str):
    try:
        await {resource}_service.delete(item_id)
        return {{"success": True, "message": "{resource.title()} deleted successfully"}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))''')
        
        return '\n'.join(routes)
    
    def _generate_frontend_code(self, request: DevelopmentRequest, tech: TechStack) -> str:
        """Generate frontend code"""
        if tech == TechStack.REACT:
            return self._generate_react_code(request)
        return ""
    
    def _generate_react_code(self, request: DevelopmentRequest) -> str:
        """Generate React component code"""
        component_name = self._extract_component_name(request.requirements)
        api_endpoint = self._extract_api_endpoint(request.requirements)
        
        template = self.code_templates["frontend"]["react"]
        
        return template.replace("{{COMPONENT_NAME}}", component_name.title()) \
                     .replace("{{API_ENDPOINT}}", api_endpoint) \
                     .replace("{{COMPONENT_STYLES}}", "p-4 bg-white rounded-lg shadow-md")
    
    def _generate_database_code(self, request: DevelopmentRequest, tech: TechStack) -> str:
        """Generate database code"""
        if tech == TechStack.MONGODB:
            return self._generate_mongodb_code(request)
        elif tech == TechStack.FIREBASE:
            return self._generate_firebase_code(request)
        return ""
    
    def _generate_mongodb_code(self, request: DevelopmentRequest) -> str:
        """Generate MongoDB schema code"""
        schema_name = self._extract_schema_name(request.requirements)
        schema_fields = self._generate_schema_fields(request)
        
        template = self.code_templates["database"]["mongodb"]
        
        return template.replace("{{SCHEMA_NAME}}", schema_name.title()) \
                     .replace("{{SCHEMA_FIELDS}}", schema_fields) \
                     .replace("{{ INDEXES }}", "{}")
    
    def _generate_firebase_code(self, request: DevelopmentRequest) -> str:
        """Generate Firebase service code"""
        collection_name = self._extract_collection_name(request.requirements)
        
        template = self.code_templates["database"]["firebase"]
        
        return template.replace("{{COLLECTION_NAME}}", collection_name.title())
    
    def _generate_integration_code(self, request: DevelopmentRequest, tech: TechStack) -> str:
        """Generate integration code"""
        return f'''// Integration code for {tech.value}
// This would contain the integration logic between frontend and backend
// Specific implementation depends on requirements'''
    
    def _generate_api_endpoints(self, request: DevelopmentRequest) -> List[Dict[str, Any]]:
        """Generate API endpoint specifications"""
        endpoints = []
        resources = self._extract_resources(request.requirements)
        
        for resource in resources:
            for operation, pattern in self.api_patterns["crud"].items():
                endpoint = {
                    "method": pattern["method"],
                    "path": pattern["path"].replace("{resource}", resource),
                    "description": pattern["description"].replace("{resource}", resource),
                    "validation": pattern["validation"],
                    "authentication": pattern["authentication"],
                    "parameters": self._generate_endpoint_parameters(operation, resource),
                    "response": self._generate_endpoint_response(operation, resource)
                }
                endpoints.append(endpoint)
        
        return endpoints
    
    def _generate_database_queries(self, request: DevelopmentRequest) -> List[str]:
        """Generate database queries"""
        queries = []
        resources = self._extract_resources(request.requirements)
        
        for resource in resources:
            queries.extend([
                f"SELECT * FROM {resource} WHERE id = ?",
                f"SELECT * FROM {resource} ORDER BY created_at DESC LIMIT ? OFFSET ?",
                f"INSERT INTO {resource} ({{fields}}) VALUES ({{values}})",
                f"UPDATE {resource} SET {{fields}} WHERE id = ?",
                f"DELETE FROM {resource} WHERE id = ?"
            ])
        
        return queries
    
    def _generate_test_cases(self, request: DevelopmentRequest) -> List[Dict[str, Any]]:
        """Generate test cases"""
        test_cases = []
        resources = self._extract_resources(request.requirements)
        
        for resource in resources:
            test_cases.extend([
                {
                    "name": f"should create {resource}",
                    "type": "unit",
                    "description": f"Test creating a new {resource}",
                    "input": {"name": "test", "description": "test description"},
                    "expected_output": {"success": True, "data": {"id": "generated_id"}}
                },
                {
                    "name": f"should get {resource} by id",
                    "type": "unit", 
                    "description": f"Test retrieving {resource} by ID",
                    "input": {"id": "test_id"},
                    "expected_output": {"success": True, "data": {"id": "test_id"}}
                },
                {
                    "name": f"should update {resource}",
                    "type": "unit",
                    "description": f"Test updating {resource}",
                    "input": {"id": "test_id", "data": {"name": "updated"}},
                    "expected_output": {"success": True, "data": {"id": "test_id", "name": "updated"}}
                },
                {
                    "name": f"should delete {resource}",
                    "type": "unit",
                    "description": f"Test deleting {resource}",
                    "input": {"id": "test_id"},
                    "expected_output": {"success": True, "message": f"{resource.title()} deleted successfully"}
                }
            ])
        
        return test_cases
    
    def _generate_deployment_config(self, request: DevelopmentRequest) -> Dict[str, Any]:
        """Generate deployment configuration"""
        return {
            "docker": {
                "dockerfile": "FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD [\"npm\", \"start\"]",
                "docker_compose": "version: '3.8'\nservices:\n  app:\n    build: .\n    ports:\n      - '3000:3000'\n    environment:\n      - NODE_ENV=production"
            },
            "render": {
                "build_command": "npm install",
                "start_command": "npm start",
                "environment_variables": ["NODE_ENV", "PORT", "DATABASE_URL"]
            },
            "vercel": {
                "build_command": "npm run build",
                "output_directory": "dist",
                "framework": "nextjs"
            }
        }
    
    def _generate_documentation(self, request: DevelopmentRequest) -> str:
        """Generate API documentation"""
        resources = self._extract_resources(request.requirements)
        
        doc = f"""# {request.development_type.title()} Development Documentation

## Overview
This document describes the {request.development_type} implementation for the LUDUS platform.

## Resources
"""
        
        for resource in resources:
            doc += f"""
### {resource.title()}
- **Endpoint**: `/api/{resource}`
- **Operations**: Create, Read, Update, Delete, List
- **Authentication**: Required
- **Validation**: Required for create/update operations

#### Endpoints:
- `GET /api/{resource}` - List all {resource}
- `GET /api/{resource}/:id` - Get {resource} by ID
- `POST /api/{resource}` - Create new {resource}
- `PUT /api/{resource}/:id` - Update {resource}
- `DELETE /api/{resource}/:id` - Delete {resource}
"""
        
        doc += """
## Error Handling
All endpoints return standardized error responses:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header.

## Rate Limiting
API requests are limited to 100 requests per 15 minutes per IP address.
"""
        
        return doc
    
    def _estimate_completion_time(self, request: DevelopmentRequest) -> int:
        """Estimate completion time in minutes"""
        base_times = {
            DevelopmentType.API: 60,
            DevelopmentType.FRONTEND: 45,
            DevelopmentType.DATABASE: 30,
            DevelopmentType.INTEGRATION: 90,
            DevelopmentType.TESTING: 30,
            DevelopmentType.DEPLOYMENT: 20,
            DevelopmentType.OPTIMIZATION: 60
        }
        
        base_time = base_times.get(request.development_type, 30)
        tech_multiplier = len(request.tech_stack) * 0.5
        
        return int(base_time * (1 + tech_multiplier))
    
    def _generate_recommendations(self, request: DevelopmentRequest) -> List[str]:
        """Generate development recommendations"""
        recommendations = []
        
        # Security recommendations
        recommendations.append("Implement proper input validation and sanitization")
        recommendations.append("Add rate limiting to prevent abuse")
        recommendations.append("Use HTTPS for all API communications")
        
        # Performance recommendations
        if request.development_type == DevelopmentType.API:
            recommendations.append("Implement caching for frequently accessed data")
            recommendations.append("Use database indexing for better query performance")
        
        # Code quality recommendations
        recommendations.append("Add comprehensive error handling")
        recommendations.append("Implement logging for debugging and monitoring")
        recommendations.append("Write unit tests for all functions")
        
        # Deployment recommendations
        recommendations.append("Use environment variables for configuration")
        recommendations.append("Implement health checks for monitoring")
        recommendations.append("Set up automated testing in CI/CD pipeline")
        
        return recommendations
    
    def _extract_resources(self, requirements: str) -> List[str]:
        """Extract resource names from requirements"""
        # Simple extraction - in real implementation, this would be more sophisticated
        resources = []
        
        if "user" in requirements.lower() or "مستخدم" in requirements:
            resources.append("user")
        if "activity" in requirements.lower() or "نشاط" in requirements:
            resources.append("activity")
        if "booking" in requirements.lower() or "حجز" in requirements:
            resources.append("booking")
        if "vendor" in requirements.lower() or "مورد" in requirements:
            resources.append("vendor")
        
        return resources if resources else ["resource"]
    
    def _extract_component_name(self, requirements: str) -> str:
        """Extract component name from requirements"""
        if "button" in requirements.lower():
            return "Button"
        elif "form" in requirements.lower():
            return "Form"
        elif "card" in requirements.lower():
            return "Card"
        elif "list" in requirements.lower():
            return "List"
        else:
            return "Component"
    
    def _extract_api_endpoint(self, requirements: str) -> str:
        """Extract API endpoint from requirements"""
        if "user" in requirements.lower():
            return "/api/users"
        elif "activity" in requirements.lower():
            return "/api/activities"
        elif "booking" in requirements.lower():
            return "/api/bookings"
        else:
            return "/api/data"
    
    def _extract_schema_name(self, requirements: str) -> str:
        """Extract schema name from requirements"""
        return self._extract_resources(requirements)[0] if self._extract_resources(requirements) else "Model"
    
    def _extract_collection_name(self, requirements: str) -> str:
        """Extract collection name from requirements"""
        return self._extract_schema_name(requirements)
    
    def _generate_schema_fields(self, request: DevelopmentRequest) -> str:
        """Generate schema fields"""
        schema_name = self._extract_schema_name(request.requirements)
        
        if schema_name in self.database_schemas:
            fields = self.database_schemas[schema_name]["fields"]
            field_definitions = []
            for field, definition in fields.items():
                field_definitions.append(f"  {field}: {{{definition}}}")
            return ",\n".join(field_definitions)
        
        return "  id: { type: String, required: true, unique: true },\n  name: { type: String, required: true },\n  createdAt: { type: Date, default: Date.now }"
    
    def _generate_endpoint_parameters(self, operation: str, resource: str) -> List[Dict[str, Any]]:
        """Generate endpoint parameters"""
        if operation in ["read", "update", "delete"]:
            return [{"name": "id", "type": "string", "required": True, "description": f"{resource.title()} ID"}]
        elif operation == "list":
            return [
                {"name": "skip", "type": "integer", "required": False, "description": "Number of records to skip"},
                {"name": "limit", "type": "integer", "required": False, "description": "Maximum number of records to return"}
            ]
        return []
    
    def _generate_endpoint_response(self, operation: str, resource: str) -> Dict[str, Any]:
        """Generate endpoint response schema"""
        return {
            "success": {"type": "boolean", "description": "Indicates if the request was successful"},
            "data": {"type": "object", "description": f"{resource.title()} data"},
            "error": {"type": "string", "description": "Error message if request failed"}
        }
    
    def _save_development_request(self, request_id: str, data: Dict[str, Any]):
        """Save development request to Redis"""
        key = f"agents:fullstack_request:{request_id}"
        self.redis_client.setex(key, 60 * 60 * 24 * 30, json.dumps(data))
    
    def get_development_request(self, request_id: str) -> Optional[Dict[str, Any]]:
        """Get development request details by ID"""
        if not self.redis_client:
            return None
            
        try:
            key = f"agents:fullstack_request:{request_id}"
            data = self.redis_client.get(key)
            if data:
                return json.loads(data)
        except Exception:
            pass
        return None
    
    def process_development_inquiry(self, message: str, language: str = "ar") -> str:
        """Process development-related inquiries"""
        message_lower = message.lower()
        
        if any(keyword in message_lower for keyword in ["develop", "تطوير", "code", "كود", "api", "frontend", "backend"]):
            if language.startswith("ar"):
                return """أنا وكيل التطوير الشامل في LUDUS. يمكنني مساعدتك في:

• تطوير APIs وخدمات الويب
• إنشاء واجهات المستخدم
• تصميم قواعد البيانات
• تكامل الأنظمة
• كتابة الاختبارات
• إعداد النشر
• تحسين الأداء

أخبرني ما تريد تطويره وسأقوم بإنشائه لك!"""
            else:
                return """I'm the fullstack development agent for LUDUS. I can help you with:

• Developing APIs and web services
• Creating user interfaces
• Designing databases
• System integration
• Writing tests
• Deployment setup
• Performance optimization

Tell me what you want to develop and I'll create it for you!"""
        
        return "I can help you with fullstack development tasks. What would you like to build?"
