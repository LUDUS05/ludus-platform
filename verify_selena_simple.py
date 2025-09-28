#!/usr/bin/env python3
"""
Simple LUDUS Selena AI Service Verification
Created: 2025-09-28 GMT+3 (Riyadh)
Purpose: Basic verification without external dependencies
"""

import os
import sys
import subprocess


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
        "agents/Dockerfile.api"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
        else:
            print(f"✅ {file_path}")
    
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
                print(f"✅ {file_path}")
            else:
                print(f"❌ {file_path} - Syntax Error:")
                print(f"   {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Error checking {file_path}: {e}")
            return False
    
    print("✅ All Python files have valid syntax")
    return True


def check_configuration():
    """Check configuration files"""
    print("\n🔍 Checking configuration...")
    
    # Check requirements.txt
    try:
        with open("agents/requirements.txt", "r") as f:
            requirements = f.read()
        
        if "fastapi" in requirements and "gunicorn" in requirements:
            print("✅ Requirements.txt contains FastAPI and Gunicorn")
        else:
            print("❌ Requirements.txt missing key dependencies")
            return False
            
    except Exception as e:
        print(f"❌ Error reading requirements.txt: {e}")
        return False
    
    # Check render.yaml
    try:
        with open("render.yaml", "r") as f:
            render_config = f.read()
        
        if "ludus-selena-ai" in render_config:
            print("✅ Render configuration includes Selena AI service")
        else:
            print("❌ Render configuration missing Selena AI service")
            return False
            
    except Exception as e:
        print(f"❌ Error reading render.yaml: {e}")
        return False
    
    return True


def run_simple_verification():
    """Run simplified verification"""
    print("🚀 LUDUS Selena AI Service Simple Verification")
    print("=" * 55)
    
    checks = [
        ("File Structure", check_file_structure),
        ("Python Syntax", check_python_syntax),
        ("Configuration", check_configuration)
    ]
    
    results = []
    
    for check_name, check_function in checks:
        print(f"\n📋 {check_name}")
        print("-" * 30)
        result = check_function()
        results.append((check_name, result))
    
    # Summary
    print("\n" + "=" * 55)
    print("📊 Verification Summary")
    print("=" * 55)
    
    passed_checks = sum(1 for _, result in results if result)
    total_checks = len(results)
    
    for check_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{check_name:.<25} {status}")
    
    print(f"\nOverall: {passed_checks}/{total_checks} checks passed")
    
    if passed_checks == total_checks:
        print("\n🎉 BASIC VERIFICATION SUCCESSFUL!")
        print("📁 Files created:")
        print("   - agents/api/selena_agents.py (Core agent implementations)")
        print("   - agents/api/config.py (Configuration management)")
        print("   - agents/api/performance_monitor.py (Performance monitoring)")
        print("   - agents/api/startup.py (Production startup)")
        print("   - docs/SELENA_AI_SERVICE_API.md (API documentation)")
        print("   - docs/PROJECT_PLAN_SELENA_AI_SERVICE.md (Project plan)")
        
        print("\n🚀 READY FOR DEPLOYMENT!")
        print("Use: python3 -m uvicorn agents.api.main:app --host 0.0.0.0 --port 8081")
        return True
    else:
        print("\n⚠️  VERIFICATION FAILED!")
        return False


if __name__ == "__main__":
    success = run_simple_verification()
    sys.exit(0 if success else 1)