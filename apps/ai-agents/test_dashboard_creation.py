#!/usr/bin/env python3
"""
Test script to demonstrate creating a complete user dashboard
using the LUDUS Automated Agents Framework
"""

import json
import requests
import time
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:8001"  # Change this to your API URL
REDIS_URL = "redis://localhost:6379"  # Change this to your Redis URL

def test_api_connection():
    """Test if the API is running"""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ API is running and healthy")
            return True
        else:
            print(f"❌ API returned status code: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ API connection failed: {e}")
        return False

def create_ui_ux_design():
    """Create UI/UX design for the dashboard"""
    print("\n🎨 Creating UI/UX Design for User Dashboard...")
    
    design_request = {
        "design_type": "page",
        "requirements": """
        Modern user dashboard with the following features:
        - Responsive layout with sidebar navigation
        - Stats cards showing key metrics (users, revenue, orders, activities)
        - Interactive charts for data visualization
        - User profile section with avatar and settings
        - Activity feed showing recent actions
        - Dark/light theme toggle
        - Support for both Arabic (RTL) and English (LTR)
        - Mobile-first responsive design
        - Accessibility compliance (WCAG 2.1 AA)
        """,
        "language": "en",
        "complexity": "high"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/ui-ux/design",
            json=design_request,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Design request created: {result.get('request_id')}")
            return result.get('request_id')
        else:
            print(f"❌ Design request failed: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Design request error: {e}")
        return None

def create_frontend_development():
    """Create frontend development for the dashboard"""
    print("\n💻 Creating Frontend Development for User Dashboard...")
    
    frontend_request = {
        "development_type": "frontend",
        "tech_stack": ["react", "tailwind", "chart.js", "react-i18next"],
        "requirements": """
        React-based user dashboard with:
        - Modern React 18 with hooks
        - Tailwind CSS for styling
        - Chart.js for data visualization
        - React i18next for internationalization
        - Responsive design with mobile support
        - Dark/light theme implementation
        - RTL/LTR layout support
        - Accessibility features
        - Performance optimization
        - Component-based architecture
        """,
        "language": "en"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/fullstack/develop",
            json=frontend_request,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Frontend development request created: {result.get('request_id')}")
            return result.get('request_id')
        else:
            print(f"❌ Frontend development request failed: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Frontend development request error: {e}")
        return None

def create_backend_development():
    """Create backend development for the dashboard"""
    print("\n🔧 Creating Backend Development for User Dashboard...")
    
    backend_request = {
        "development_type": "api",
        "tech_stack": ["nodejs", "express", "mongodb", "jwt"],
        "requirements": """
        Node.js/Express API for user dashboard with:
        - RESTful API endpoints
        - JWT authentication
        - MongoDB database integration
        - User management endpoints
        - Dashboard data aggregation
        - Real-time notifications
        - File upload handling
        - Rate limiting and security
        - API documentation
        - Error handling and logging
        """,
        "language": "en"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/fullstack/develop",
            json=backend_request,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Backend development request created: {result.get('request_id')}")
            return result.get('request_id')
        else:
            print(f"❌ Backend development request failed: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend development request error: {e}")
        return None

def create_workflow():
    """Create a complete workflow for dashboard development"""
    print("\n⚙️ Creating Complete Dashboard Development Workflow...")
    
    workflow_request = {
        "name": "Complete User Dashboard Development",
        "template": "feature_development",
        "input_data": {
            "requirements": """
            Complete user dashboard development including:
            1. UI/UX Design - Modern, responsive dashboard design
            2. Frontend Development - React-based implementation
            3. Backend Development - Node.js API with authentication
            4. Database Design - MongoDB schema for dashboard data
            5. Testing - Unit and integration tests
            6. Deployment - Production-ready deployment configuration
            """,
            "priority": "high",
            "timeline": "2-3 days"
        }
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/workflows/create",
            json=workflow_request,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Workflow created: {result.get('workflow_id')}")
            return result.get('workflow_id')
        else:
            print(f"❌ Workflow creation failed: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Workflow creation error: {e}")
        return None

def check_request_status(request_id, request_type):
    """Check the status of a request"""
    try:
        if request_type == "design":
            response = requests.get(f"{API_BASE_URL}/ui-ux/design/{request_id}")
        elif request_type == "frontend":
            response = requests.get(f"{API_BASE_URL}/fullstack/development/{request_id}")
        elif request_type == "backend":
            response = requests.get(f"{API_BASE_URL}/fullstack/development/{request_id}")
        elif request_type == "workflow":
            response = requests.get(f"{API_BASE_URL}/workflows/{request_id}/status")
        
        if response.status_code == 200:
            result = response.json()
            status = result.get('status', 'unknown')
            progress = result.get('progress', 0)
            print(f"📊 {request_type.title()} Status: {status} ({progress}%)")
            return result
        else:
            print(f"❌ Status check failed: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Status check error: {e}")
        return None

def get_monitoring_report():
    """Get system monitoring report"""
    print("\n📊 Getting System Monitoring Report...")
    
    try:
        response = requests.get(f"{API_BASE_URL}/monitoring/report")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ System Monitoring Report:")
            print(json.dumps(result, indent=2))
            return result
        else:
            print(f"❌ Monitoring report failed: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Monitoring report error: {e}")
        return None

def main():
    """Main function to demonstrate dashboard creation"""
    print("🚀 LUDUS Automated Agents Framework - Dashboard Creation Demo")
    print("=" * 60)
    
    # Test API connection
    if not test_api_connection():
        print("\n❌ Cannot proceed without API connection")
        print("Please ensure the API server is running on the correct port")
        return
    
    # Create individual components
    design_id = create_ui_ux_design()
    frontend_id = create_frontend_development()
    backend_id = create_backend_development()
    
    # Create complete workflow
    workflow_id = create_workflow()
    
    # Check status of requests
    if design_id:
        print(f"\n📋 Checking design status...")
        check_request_status(design_id, "design")
    
    if frontend_id:
        print(f"\n📋 Checking frontend status...")
        check_request_status(frontend_id, "frontend")
    
    if backend_id:
        print(f"\n📋 Checking backend status...")
        check_request_status(backend_id, "backend")
    
    if workflow_id:
        print(f"\n📋 Checking workflow status...")
        check_request_status(workflow_id, "workflow")
    
    # Get monitoring report
    get_monitoring_report()
    
    print("\n🎉 Dashboard Creation Demo Complete!")
    print("\nNext Steps:")
    print("1. Check the status of your requests using the request IDs")
    print("2. Review the generated designs and code")
    print("3. Deploy the dashboard to your environment")
    print("4. Test the complete functionality")

if __name__ == "__main__":
    main()
