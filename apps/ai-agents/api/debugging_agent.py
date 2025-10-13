"""
LUDUS Debugging Agent - Specialized agent for automated debugging and issue resolution
"""

import json
import uuid
import re
import traceback
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from pydantic import BaseModel
from enum import Enum


class IssueType(str, Enum):
    """Types of issues that can be debugged"""
    ERROR = "error"
    PERFORMANCE = "performance"
    SECURITY = "security"
    LOGIC = "logic"
    INTEGRATION = "integration"
    UI_UX = "ui_ux"
    DATABASE = "database"
    API = "api"


class Severity(str, Enum):
    """Issue severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class DebuggingRequest(BaseModel):
    """Model for debugging requests"""
    request_id: str
    issue_type: IssueType
    severity: Severity
    error_message: Optional[str] = None
    stack_trace: Optional[str] = None
    code_snippet: Optional[str] = None
    logs: Optional[List[str]] = None
    environment: Optional[Dict[str, Any]] = None
    reproduction_steps: Optional[List[str]] = None
    expected_behavior: Optional[str] = None
    actual_behavior: Optional[str] = None


class DebuggingResponse(BaseModel):
    """Model for debugging responses"""
    request_id: str
    status: str
    root_cause_analysis: Dict[str, Any]
    suggested_fixes: List[Dict[str, Any]]
    code_fixes: List[str]
    test_cases: List[Dict[str, Any]]
    performance_optimizations: List[Dict[str, Any]]
    security_recommendations: List[str]
    monitoring_suggestions: List[str]
    estimated_fix_time: int
    confidence_score: float


class DebuggingAgent:
    """Specialized agent for automated debugging and issue resolution"""
    
    def __init__(self, redis_client=None, ollama_client=None):
        self.redis_client = redis_client
        self.ollama_client = ollama_client
        self.error_patterns = self._load_error_patterns()
        self.performance_patterns = self._load_performance_patterns()
        self.security_patterns = self._load_security_patterns()
        self.fix_templates = self._load_fix_templates()
        
    def _load_error_patterns(self) -> Dict[str, Any]:
        """Load common error patterns and their solutions"""
        return {
            "javascript": {
                "TypeError": {
                    "patterns": ["Cannot read property", "undefined is not a function", "Cannot set property"],
                    "common_causes": ["Null/undefined object access", "Missing function definition", "Incorrect object structure"],
                    "solutions": ["Add null checks", "Verify function exists", "Check object structure"]
                },
                "ReferenceError": {
                    "patterns": ["is not defined", "Cannot access before initialization"],
                    "common_causes": ["Variable not declared", "Hoisting issues", "Scope problems"],
                    "solutions": ["Declare variable", "Move declaration", "Check scope"]
                },
                "SyntaxError": {
                    "patterns": ["Unexpected token", "Missing semicolon", "Unterminated string"],
                    "common_causes": ["Syntax mistakes", "Missing punctuation", "String issues"],
                    "solutions": ["Fix syntax", "Add missing punctuation", "Check string quotes"]
                }
            },
            "python": {
                "AttributeError": {
                    "patterns": ["'NoneType' object has no attribute", "'str' object has no attribute"],
                    "common_causes": ["Object is None", "Wrong object type", "Missing attribute"],
                    "solutions": ["Add None checks", "Verify object type", "Check attribute existence"]
                },
                "KeyError": {
                    "patterns": ["KeyError:", "dictionary key not found"],
                    "common_causes": ["Missing dictionary key", "Wrong key name", "Empty dictionary"],
                    "solutions": ["Check key existence", "Use get() method", "Add default value"]
                },
                "ValueError": {
                    "patterns": ["invalid literal", "could not convert", "invalid value"],
                    "common_causes": ["Wrong data type", "Invalid format", "Out of range"],
                    "solutions": ["Validate input", "Convert data type", "Check value range"]
                }
            },
            "database": {
                "ConnectionError": {
                    "patterns": ["connection refused", "timeout", "connection lost"],
                    "common_causes": ["Database down", "Network issues", "Configuration problems"],
                    "solutions": ["Check database status", "Verify network", "Update configuration"]
                },
                "QueryError": {
                    "patterns": ["syntax error", "table doesn't exist", "column not found"],
                    "common_causes": ["SQL syntax error", "Missing table", "Wrong column name"],
                    "solutions": ["Fix SQL syntax", "Create table", "Check column names"]
                }
            }
        }
    
    def _load_performance_patterns(self) -> Dict[str, Any]:
        """Load performance issue patterns"""
        return {
            "slow_queries": {
                "indicators": ["N+1 queries", "Missing indexes", "Full table scans"],
                "solutions": ["Add database indexes", "Optimize queries", "Use eager loading"]
            },
            "memory_leaks": {
                "indicators": ["Increasing memory usage", "Event listeners not removed", "Circular references"],
                "solutions": ["Remove event listeners", "Clear references", "Use weak references"]
            },
            "slow_rendering": {
                "indicators": ["Large DOM", "Heavy computations", "Frequent re-renders"],
                "solutions": ["Virtual scrolling", "Memoization", "Code splitting"]
            },
            "api_slow": {
                "indicators": ["High response times", "Blocking operations", "No caching"],
                "solutions": ["Add caching", "Async operations", "Database optimization"]
            }
        }
    
    def _load_security_patterns(self) -> Dict[str, Any]:
        """Load security vulnerability patterns"""
        return {
            "xss": {
                "patterns": ["innerHTML", "document.write", "eval("],
                "risk": "Cross-site scripting attacks",
                "solutions": ["Sanitize input", "Use textContent", "CSP headers"]
            },
            "sql_injection": {
                "patterns": ["string concatenation", "direct query building"],
                "risk": "Database manipulation",
                "solutions": ["Parameterized queries", "Input validation", "ORM usage"]
            },
            "csrf": {
                "patterns": ["missing CSRF token", "state-changing GET requests"],
                "risk": "Cross-site request forgery",
                "solutions": ["CSRF tokens", "SameSite cookies", "Origin validation"]
            },
            "authentication": {
                "patterns": ["hardcoded credentials", "weak passwords", "session issues"],
                "risk": "Unauthorized access",
                "solutions": ["Environment variables", "Strong passwords", "Secure sessions"]
            }
        }
    
    def _load_fix_templates(self) -> Dict[str, str]:
        """Load code fix templates"""
        return {
            "null_check": '''
// Before
const result = object.property.method();

// After
const result = object?.property?.method() || defaultValue;
''',
            "error_handling": '''
// Before
const data = await fetchData();

// After
try {
  const data = await fetchData();
  // Process data
} catch (error) {
  console.error('Error fetching data:', error);
  // Handle error appropriately
}
''',
            "async_await": '''
// Before
fetchData().then(data => {
  processData(data);
}).catch(error => {
  handleError(error);
});

// After
try {
  const data = await fetchData();
  processData(data);
} catch (error) {
  handleError(error);
}
''',
            "input_validation": '''
// Before
function processUser(user) {
  return user.name.toUpperCase();
}

// After
function processUser(user) {
  if (!user || !user.name) {
    throw new Error('Invalid user object');
  }
  return user.name.toUpperCase();
}
''',
            "database_query": '''
// Before
const query = `SELECT * FROM users WHERE id = ${userId}`;

// After
const query = 'SELECT * FROM users WHERE id = ?';
const result = await db.query(query, [userId]);
'''
        }
    
    def create_debugging_request(self, request_data: DebuggingRequest) -> DebuggingResponse:
        """Create a new debugging request and analyze the issue"""
        try:
            # Perform root cause analysis
            root_cause = self._analyze_root_cause(request_data)
            
            # Generate suggested fixes
            suggested_fixes = self._generate_suggested_fixes(request_data, root_cause)
            
            # Generate code fixes
            code_fixes = self._generate_code_fixes(request_data, root_cause)
            
            # Generate test cases
            test_cases = self._generate_test_cases(request_data, root_cause)
            
            # Generate performance optimizations
            performance_optimizations = self._generate_performance_optimizations(request_data)
            
            # Generate security recommendations
            security_recommendations = self._generate_security_recommendations(request_data)
            
            # Generate monitoring suggestions
            monitoring_suggestions = self._generate_monitoring_suggestions(request_data)
            
            # Estimate fix time
            fix_time = self._estimate_fix_time(request_data, root_cause)
            
            # Calculate confidence score
            confidence_score = self._calculate_confidence_score(request_data, root_cause)
            
            # Save to Redis
            if self.redis_client:
                self._save_debugging_request(request_data.request_id, {
                    "root_cause": root_cause,
                    "suggested_fixes": suggested_fixes,
                    "code_fixes": code_fixes,
                    "test_cases": test_cases,
                    "created_at": datetime.now().isoformat()
                })
            
            return DebuggingResponse(
                request_id=request_data.request_id,
                status="completed",
                root_cause_analysis=root_cause,
                suggested_fixes=suggested_fixes,
                code_fixes=code_fixes,
                test_cases=test_cases,
                performance_optimizations=performance_optimizations,
                security_recommendations=security_recommendations,
                monitoring_suggestions=monitoring_suggestions,
                estimated_fix_time=fix_time,
                confidence_score=confidence_score
            )
            
        except Exception as e:
            return DebuggingResponse(
                request_id=request_data.request_id,
                status="error",
                root_cause_analysis={"error": str(e)},
                suggested_fixes=[],
                code_fixes=[],
                test_cases=[],
                performance_optimizations=[],
                security_recommendations=[],
                monitoring_suggestions=[],
                estimated_fix_time=0,
                confidence_score=0.0
            )
    
    def _analyze_root_cause(self, request: DebuggingRequest) -> Dict[str, Any]:
        """Analyze the root cause of the issue"""
        analysis = {
            "issue_type": request.issue_type,
            "severity": request.severity,
            "likely_causes": [],
            "affected_components": [],
            "impact_assessment": "",
            "priority_level": self._calculate_priority(request.severity, request.issue_type)
        }
        
        # Analyze based on issue type
        if request.issue_type == IssueType.ERROR:
            analysis.update(self._analyze_error(request))
        elif request.issue_type == IssueType.PERFORMANCE:
            analysis.update(self._analyze_performance(request))
        elif request.issue_type == IssueType.SECURITY:
            analysis.update(self._analyze_security(request))
        elif request.issue_type == IssueType.LOGIC:
            analysis.update(self._analyze_logic(request))
        elif request.issue_type == IssueType.INTEGRATION:
            analysis.update(self._analyze_integration(request))
        elif request.issue_type == IssueType.UI_UX:
            analysis.update(self._analyze_ui_ux(request))
        elif request.issue_type == IssueType.DATABASE:
            analysis.update(self._analyze_database(request))
        elif request.issue_type == IssueType.API:
            analysis.update(self._analyze_api(request))
        
        return analysis
    
    def _analyze_error(self, request: DebuggingRequest) -> Dict[str, Any]:
        """Analyze error-related issues"""
        analysis = {
            "error_category": "unknown",
            "error_patterns": [],
            "stack_trace_analysis": {},
            "code_context": {}
        }
        
        if request.error_message:
            # Match against known error patterns
            for language, error_types in self.error_patterns.items():
                for error_type, error_info in error_types.items():
                    for pattern in error_info["patterns"]:
                        if pattern.lower() in request.error_message.lower():
                            analysis["error_category"] = error_type
                            analysis["error_patterns"].append(pattern)
                            analysis["likely_causes"] = error_info["common_causes"]
                            break
        
        if request.stack_trace:
            analysis["stack_trace_analysis"] = self._analyze_stack_trace(request.stack_trace)
        
        if request.code_snippet:
            analysis["code_context"] = self._analyze_code_context(request.code_snippet)
        
        return analysis
    
    def _analyze_performance(self, request: DebuggingRequest) -> Dict[str, Any]:
        """Analyze performance-related issues"""
        analysis = {
            "performance_bottlenecks": [],
            "resource_usage": {},
            "optimization_opportunities": []
        }
        
        if request.logs:
            for log in request.logs:
                for bottleneck_type, indicators in self.performance_patterns.items():
                    for indicator in indicators["indicators"]:
                        if indicator.lower() in log.lower():
                            analysis["performance_bottlenecks"].append(bottleneck_type)
                            analysis["optimization_opportunities"].extend(indicators["solutions"])
        
        return analysis
    
    def _analyze_security(self, request: DebuggingRequest) -> Dict[str, Any]:
        """Analyze security-related issues"""
        analysis = {
            "vulnerability_types": [],
            "risk_level": "medium",
            "attack_vectors": []
        }
        
        if request.code_snippet:
            for vuln_type, vuln_info in self.security_patterns.items():
                for pattern in vuln_info["patterns"]:
                    if pattern in request.code_snippet:
                        analysis["vulnerability_types"].append(vuln_type)
                        analysis["attack_vectors"].append(vuln_info["risk"])
        
        return analysis
    
    def _analyze_logic(self, request: DebuggingRequest) -> Dict[str, Any]:
        """Analyze logic-related issues"""
        return {
            "logic_flow_issues": [],
            "condition_problems": [],
            "data_flow_issues": []
        }
    
    def _analyze_integration(self, request: DebuggingRequest) -> Dict[str, Any]:
        """Analyze integration-related issues"""
        return {
            "integration_points": [],
            "communication_issues": [],
            "data_format_problems": []
        }
    
    def _analyze_ui_ux(self, request: DebuggingRequest) -> Dict[str, Any]:
        """Analyze UI/UX-related issues"""
        return {
            "usability_issues": [],
            "accessibility_problems": [],
            "responsive_design_issues": []
        }
    
    def _analyze_database(self, request: DebuggingRequest) -> Dict[str, Any]:
        """Analyze database-related issues"""
        return {
            "query_issues": [],
            "connection_problems": [],
            "data_integrity_issues": []
        }
    
    def _analyze_api(self, request: DebuggingRequest) -> Dict[str, Any]:
        """Analyze API-related issues"""
        return {
            "endpoint_issues": [],
            "authentication_problems": [],
            "rate_limiting_issues": []
        }
    
    def _analyze_stack_trace(self, stack_trace: str) -> Dict[str, Any]:
        """Analyze stack trace for debugging insights"""
        lines = stack_trace.split('\n')
        analysis = {
            "error_location": "",
            "call_stack_depth": len([line for line in lines if 'at ' in line]),
            "file_references": [],
            "function_calls": []
        }
        
        for line in lines:
            if 'at ' in line:
                # Extract file and function information
                if '(' in line and ')' in line:
                    file_info = line.split('(')[1].split(')')[0]
                    analysis["file_references"].append(file_info)
                
                if 'at ' in line:
                    func_info = line.split('at ')[1].split('(')[0]
                    analysis["function_calls"].append(func_info)
        
        return analysis
    
    def _analyze_code_context(self, code_snippet: str) -> Dict[str, Any]:
        """Analyze code context for potential issues"""
        return {
            "complexity_score": self._calculate_complexity(code_snippet),
            "potential_issues": self._identify_potential_issues(code_snippet),
            "code_smells": self._detect_code_smells(code_snippet)
        }
    
    def _calculate_complexity(self, code: str) -> int:
        """Calculate code complexity score"""
        # Simple complexity calculation based on control structures
        complexity_indicators = ['if', 'else', 'for', 'while', 'switch', 'case', 'try', 'catch']
        complexity = 1  # Base complexity
        
        for indicator in complexity_indicators:
            complexity += code.count(indicator)
        
        return complexity
    
    def _identify_potential_issues(self, code: str) -> List[str]:
        """Identify potential issues in code"""
        issues = []
        
        # Check for common issues
        if 'eval(' in code:
            issues.append("Use of eval() - security risk")
        if 'innerHTML' in code:
            issues.append("Use of innerHTML - potential XSS")
        if 'document.write' in code:
            issues.append("Use of document.write - performance issue")
        if 'var ' in code:
            issues.append("Use of var - consider let/const")
        if '== ' in code and '===' not in code:
            issues.append("Use of == instead of ===")
        
        return issues
    
    def _detect_code_smells(self, code: str) -> List[str]:
        """Detect code smells"""
        smells = []
        
        # Long functions
        lines = code.split('\n')
        if len(lines) > 20:
            smells.append("Long function - consider breaking down")
        
        # Deep nesting
        max_indent = max([len(line) - len(line.lstrip()) for line in lines if line.strip()])
        if max_indent > 12:
            smells.append("Deep nesting - consider refactoring")
        
        # Magic numbers
        import re
        numbers = re.findall(r'\b\d+\b', code)
        if len(numbers) > 5:
            smells.append("Magic numbers - consider using constants")
        
        return smells
    
    def _generate_suggested_fixes(self, request: DebuggingRequest, root_cause: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate suggested fixes based on analysis"""
        fixes = []
        
        if request.issue_type == IssueType.ERROR:
            fixes.extend(self._generate_error_fixes(request, root_cause))
        elif request.issue_type == IssueType.PERFORMANCE:
            fixes.extend(self._generate_performance_fixes(request, root_cause))
        elif request.issue_type == IssueType.SECURITY:
            fixes.extend(self._generate_security_fixes(request, root_cause))
        
        return fixes
    
    def _generate_error_fixes(self, request: DebuggingRequest, root_cause: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate fixes for error issues"""
        fixes = []
        
        error_category = root_cause.get("error_category", "unknown")
        
        if error_category in ["TypeError", "ReferenceError"]:
            fixes.append({
                "type": "null_check",
                "description": "Add null/undefined checks",
                "priority": "high",
                "estimated_time": 15
            })
        
        if "async" in str(request.code_snippet).lower():
            fixes.append({
                "type": "async_handling",
                "description": "Improve async/await error handling",
                "priority": "medium",
                "estimated_time": 20
            })
        
        return fixes
    
    def _generate_performance_fixes(self, request: DebuggingRequest, root_cause: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate fixes for performance issues"""
        fixes = []
        
        bottlenecks = root_cause.get("performance_bottlenecks", [])
        
        for bottleneck in bottlenecks:
            if bottleneck == "slow_queries":
                fixes.append({
                    "type": "database_optimization",
                    "description": "Add database indexes and optimize queries",
                    "priority": "high",
                    "estimated_time": 30
                })
            elif bottleneck == "memory_leaks":
                fixes.append({
                    "type": "memory_management",
                    "description": "Fix memory leaks and clean up resources",
                    "priority": "high",
                    "estimated_time": 25
                })
        
        return fixes
    
    def _generate_security_fixes(self, request: DebuggingRequest, root_cause: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate fixes for security issues"""
        fixes = []
        
        vulnerabilities = root_cause.get("vulnerability_types", [])
        
        for vuln in vulnerabilities:
            if vuln == "xss":
                fixes.append({
                    "type": "input_sanitization",
                    "description": "Sanitize user input to prevent XSS",
                    "priority": "critical",
                    "estimated_time": 20
                })
            elif vuln == "sql_injection":
                fixes.append({
                    "type": "parameterized_queries",
                    "description": "Use parameterized queries to prevent SQL injection",
                    "priority": "critical",
                    "estimated_time": 25
                })
        
        return fixes
    
    def _generate_code_fixes(self, request: DebuggingRequest, root_cause: Dict[str, Any]) -> List[str]:
        """Generate actual code fixes"""
        fixes = []
        
        # Generate fixes based on issue type and patterns
        if request.error_message:
            for language, error_types in self.error_patterns.items():
                for error_type, error_info in error_types.items():
                    for pattern in error_info["patterns"]:
                        if pattern.lower() in request.error_message.lower():
                            # Generate appropriate fix
                            if "null" in pattern.lower() or "undefined" in pattern.lower():
                                fixes.append(self.fix_templates["null_check"])
                            elif "async" in str(request.code_snippet).lower():
                                fixes.append(self.fix_templates["error_handling"])
                            elif "query" in pattern.lower():
                                fixes.append(self.fix_templates["database_query"])
        
        # Add input validation fix if needed
        if request.code_snippet and "function" in request.code_snippet:
            fixes.append(self.fix_templates["input_validation"])
        
        return fixes
    
    def _generate_test_cases(self, request: DebuggingRequest, root_cause: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate test cases to prevent regression"""
        test_cases = []
        
        # Generate test case for the specific issue
        test_cases.append({
            "name": f"should handle {request.issue_type} issue",
            "type": "unit",
            "description": f"Test case to prevent regression of {request.issue_type} issue",
            "input": request.reproduction_steps or ["test input"],
            "expected_output": request.expected_behavior or "success",
            "setup": "Setup test environment",
            "teardown": "Clean up test data"
        })
        
        # Generate edge case tests
        test_cases.append({
            "name": "should handle edge cases",
            "type": "unit",
            "description": "Test edge cases that might cause similar issues",
            "input": ["null input", "empty input", "invalid input"],
            "expected_output": "graceful handling",
            "setup": "Setup edge case scenarios",
            "teardown": "Clean up test data"
        })
        
        return test_cases
    
    def _generate_performance_optimizations(self, request: DebuggingRequest) -> List[Dict[str, Any]]:
        """Generate performance optimization suggestions"""
        optimizations = []
        
        if request.issue_type == IssueType.PERFORMANCE:
            optimizations.extend([
                {
                    "type": "caching",
                    "description": "Implement caching for frequently accessed data",
                    "impact": "high",
                    "effort": "medium"
                },
                {
                    "type": "database_indexing",
                    "description": "Add database indexes for better query performance",
                    "impact": "high",
                    "effort": "low"
                },
                {
                    "type": "code_splitting",
                    "description": "Implement code splitting for better loading performance",
                    "impact": "medium",
                    "effort": "medium"
                }
            ])
        
        return optimizations
    
    def _generate_security_recommendations(self, request: DebuggingRequest) -> List[str]:
        """Generate security recommendations"""
        recommendations = []
        
        if request.issue_type == IssueType.SECURITY:
            recommendations.extend([
                "Implement input validation and sanitization",
                "Use parameterized queries to prevent SQL injection",
                "Add CSRF protection",
                "Implement proper authentication and authorization",
                "Use HTTPS for all communications",
                "Add rate limiting to prevent abuse",
                "Implement security headers (CSP, HSTS, etc.)",
                "Regular security audits and penetration testing"
            ])
        else:
            # General security recommendations
            recommendations.extend([
                "Review code for security vulnerabilities",
                "Implement proper error handling without exposing sensitive information",
                "Use environment variables for sensitive configuration",
                "Regular dependency updates for security patches"
            ])
        
        return recommendations
    
    def _generate_monitoring_suggestions(self, request: DebuggingRequest) -> List[str]:
        """Generate monitoring and alerting suggestions"""
        suggestions = []
        
        suggestions.extend([
            f"Set up monitoring for {request.issue_type} issues",
            "Implement error tracking and logging",
            "Add performance monitoring",
            "Set up alerts for critical issues",
            "Implement health checks",
            "Add metrics collection for key performance indicators",
            "Set up log aggregation and analysis",
            "Implement automated testing in CI/CD pipeline"
        ])
        
        return suggestions
    
    def _estimate_fix_time(self, request: DebuggingRequest, root_cause: Dict[str, Any]) -> int:
        """Estimate time to fix the issue in minutes"""
        base_times = {
            IssueType.ERROR: 30,
            IssueType.PERFORMANCE: 60,
            IssueType.SECURITY: 45,
            IssueType.LOGIC: 40,
            IssueType.INTEGRATION: 90,
            IssueType.UI_UX: 25,
            IssueType.DATABASE: 35,
            IssueType.API: 50
        }
        
        base_time = base_times.get(request.issue_type, 30)
        
        # Adjust based on severity
        severity_multipliers = {
            Severity.LOW: 0.5,
            Severity.MEDIUM: 1.0,
            Severity.HIGH: 1.5,
            Severity.CRITICAL: 2.0
        }
        
        multiplier = severity_multipliers.get(request.severity, 1.0)
        
        return int(base_time * multiplier)
    
    def _calculate_confidence_score(self, request: DebuggingRequest, root_cause: Dict[str, Any]) -> float:
        """Calculate confidence score for the analysis"""
        score = 0.5  # Base score
        
        # Increase confidence based on available information
        if request.error_message:
            score += 0.2
        if request.stack_trace:
            score += 0.15
        if request.code_snippet:
            score += 0.1
        if request.logs:
            score += 0.05
        
        # Increase confidence if we found matching patterns
        if root_cause.get("error_category") != "unknown":
            score += 0.1
        
        return min(score, 1.0)
    
    def _calculate_priority(self, severity: Severity, issue_type: IssueType) -> str:
        """Calculate priority level based on severity and issue type"""
        if severity == Severity.CRITICAL or issue_type == IssueType.SECURITY:
            return "P0 - Critical"
        elif severity == Severity.HIGH:
            return "P1 - High"
        elif severity == Severity.MEDIUM:
            return "P2 - Medium"
        else:
            return "P3 - Low"
    
    def _save_debugging_request(self, request_id: str, data: Dict[str, Any]):
        """Save debugging request to Redis"""
        key = f"agents:debugging_request:{request_id}"
        self.redis_client.setex(key, 60 * 60 * 24 * 30, json.dumps(data))
    
    def get_debugging_request(self, request_id: str) -> Optional[Dict[str, Any]]:
        """Get debugging request details by ID"""
        if not self.redis_client:
            return None
            
        try:
            key = f"agents:debugging_request:{request_id}"
            data = self.redis_client.get(key)
            if data:
                return json.loads(data)
        except Exception:
            pass
        return None
    
    def process_debugging_inquiry(self, message: str, language: str = "ar") -> str:
        """Process debugging-related inquiries"""
        message_lower = message.lower()
        
        if any(keyword in message_lower for keyword in ["debug", "خطأ", "error", "bug", "issue", "problem"]):
            if language.startswith("ar"):
                return """أنا وكيل التصحيح في LUDUS. يمكنني مساعدتك في:

• تحليل الأخطاء ومشاكل الكود
• تحديد أسباب المشاكل
• اقتراح الحلول والإصلاحات
• تحسين الأداء
• فحص الأمان
• كتابة اختبارات لمنع التكرار
• إعداد المراقبة والتنبيهات

أرسل لي رسالة الخطأ أو وصف المشكلة وسأقوم بتحليلها وإصلاحها!"""
            else:
                return """I'm the debugging agent for LUDUS. I can help you with:

• Analyzing errors and code issues
• Identifying root causes of problems
• Suggesting solutions and fixes
• Performance optimization
• Security auditing
• Writing tests to prevent regression
• Setting up monitoring and alerts

Send me the error message or problem description and I'll analyze and fix it!"""
        
        return "I can help you debug and fix issues. What problem are you experiencing?"
