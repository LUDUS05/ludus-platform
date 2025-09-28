#!/usr/bin/env python3
"""
LUDUS Selena AI Service Deployment Verification
Created: 2025-09-28 GMT+3 (Riyadh)
Purpose: Verify successful deployment and functionality of Selena AI service
"""

import os
import sys
import subprocess
import requests
import time
import json


def check_file_structure():
    """Verify all required files are present"""
    print("🔍 Checking file structure...")
    
    required_files = [
        "agents/api/main.py",
        "agents/api/selena_agents.py", 
        "agents/api/config.py",
        "agents/api/performance_monitor.py",
        "agents/api/startup.py",
        "agents/requirements.txt",
        "agents/Dockerfile.api",
        "agents/test_selena_api.py",
        "agents/test_selena_performance.py"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print(f"❌ Missing files: {missing_files}")
        return False
    else:
        print("✅ All required files present")
        return True


def check_python_syntax():
    """Verify Python syntax is correct"""
    print("\n🔍 Checking Python syntax...")
    
    python_files = [
        "agents/api/main.py",
        "agents/api/selena_agents.py",
        "agents/api/config.py", 
        "agents/api/performance_monitor.py",
        "agents/api/startup.py"
    ]
    
    for file_path in python_files:
        try:
            result = subprocess.run(
                ["python3", "-m", "py_compile", file_path],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                print(f"✅ {file_path} - Syntax OK")
            else:
                print(f"❌ {file_path} - Syntax Error:")
                print(f"   {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Error checking {file_path}: {e}")
            return False
    
    return True


def check_dependencies():
    """Check if all required dependencies are listed"""
    print("\n🔍 Checking dependencies...")
    
    try:
        with open("agents/requirements.txt", "r") as f:
            requirements = f.read()
        
        required_packages = [
            "fastapi",
            "uvicorn",
            "redis", 
            "requests",
            "pydantic",
            "gunicorn",
            "prometheus-client"
        ]
        
        missing_packages = []
        for package in required_packages:
            if package not in requirements:
                missing_packages.append(package)
        
        if missing_packages:
            print(f"❌ Missing packages: {missing_packages}")
            return False
        else:
            print("✅ All required dependencies present")
            return True
            
    except Exception as e:
        print(f"❌ Error checking dependencies: {e}")
        return False


def check_render_config():
    """Verify Render deployment configuration"""
    print("\n🔍 Checking Render configuration...")
    
    try:
        with open("render.yaml", "r") as f:
            render_config = f.read()
        
        required_configs = [
            "ludus-selena-ai",
            "RESPONSE_TIME_TARGET_MS",
            "CONCURRENT_REQUESTS_TARGET",
            "healthCheckPath: /health"
        ]
        
        missing_configs = []
        for config in required_configs:
            if config not in render_config:
                missing_configs.append(config)
        
        if missing_configs:
            print(f"❌ Missing Render configs: {missing_configs}")
            return False
        else:
            print("✅ Render configuration complete")
            return True
            
    except Exception as e:
        print(f"❌ Error checking Render config: {e}")
        return False


def test_local_startup():
    """Test if the service can start locally"""
    print("\n🔍 Testing local service startup...")
    
    try:
        # Try to import the main modules
        sys.path.append("agents")
        
        from api.config import settings
        print(f"✅ Configuration loaded - Version: {settings.app_version}")
        
        from api.selena_agents import SelenaAgentManager, AgentType
        print("✅ Selena agents imported successfully")
        
        # Initialize manager
        manager = SelenaAgentManager()
        print("✅ Agent manager initialized")
        
        # Test agent info
        info = manager.get_agent_info("ar")
        agent_count = len(info)
        print(f"✅ Agent info retrieved - {agent_count} agents available")
        
        if agent_count == 4:
            print("✅ All 4 Selena agents operational")
            return True
        else:
            print(f"❌ Expected 4 agents, found {agent_count}")
            return False
            
    except Exception as e:
        print(f"❌ Startup test failed: {e}")
        return False


def run_verification():
    """Run complete verification suite"""
    print("🚀 LUDUS Selena AI Service Deployment Verification")
    print("=" * 60)
    
    checks = [
        ("File Structure", check_file_structure),
        ("Python Syntax", check_python_syntax), 
        ("Dependencies", check_dependencies),
        ("Render Config", check_render_config),
        ("Local Startup", test_local_startup)
    ]
    
    results = []
    
    for check_name, check_function in checks:
        print(f"\n📋 {check_name} Check")
        print("-" * 40)
        result = check_function()
        results.append((check_name, result))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Verification Summary")
    print("=" * 60)
    
    passed_checks = sum(1 for _, result in results if result)
    total_checks = len(results)
    
    for check_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{check_name:.<30} {status}")
    
    print(f"\nOverall: {passed_checks}/{total_checks} checks passed")
    
    if passed_checks == total_checks:
        print("\n🎉 DEPLOYMENT VERIFICATION SUCCESSFUL!")
        print("🚀 Ready for production deployment to Render")
        print("\nNext steps:")
        print("1. Deploy to Render using updated render.yaml")
        print("2. Run performance tests against production URL")
        print("3. Configure monitoring alerts")
        return True
    else:
        print("\n⚠️  DEPLOYMENT VERIFICATION FAILED!")
        print("Please resolve the failed checks before deploying.")
        return False


if __name__ == "__main__":
    success = run_verification()
    sys.exit(0 if success else 1)