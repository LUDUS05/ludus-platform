#!/usr/bin/env node

/**
 * Jules AI Agent - Automated Bug Detection & Fix System
 * LUDUS Platform - Comprehensive Code Analysis
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

class JulesBugDetector {
  constructor() {
    this.bugs = [];
    this.fixes = [];
    this.stats = {
      filesScanned: 0,
      bugsFound: 0,
      bugsFixed: 0,
      errors: 0
    };
    this.reportPath = path.join(__dirname, '../../reports/jules-bug-report.json');
  }

  /**
   * Main execution method
   */
  async run() {
    console.log(chalk.blue.bold('🔍 Jules AI Agent - Bug Detection & Fix System'));
    console.log(chalk.blue('=' .repeat(60)));
    
    try {
      await this.scanCodebase();
      await this.analyzeBugs();
      await this.generateFixes();
      await this.applyFixes();
      await this.generateReport();
      
      console.log(chalk.green.bold('\n✅ Jules Bug Detection Complete!'));
      this.printSummary();
    } catch (error) {
      console.error(chalk.red.bold('❌ Jules Error:'), error.message);
      this.stats.errors++;
    }
  }

  /**
   * Scan the entire codebase for potential bugs
   */
  async scanCodebase() {
    console.log(chalk.yellow('\n🔍 Scanning codebase...'));
    
    const scanPaths = [
      'apps/api/src',
      'apps/web/src',
      'apps/admin/src',
      'packages/shared-types/src',
      'packages/shared-utils/src'
    ];

    for (const scanPath of scanPaths) {
      const fullPath = path.join(process.cwd(), scanPath);
      if (fs.existsSync(fullPath)) {
        await this.scanDirectory(fullPath);
      }
    }
  }

  /**
   * Scan a directory recursively for JavaScript/TypeScript files
   */
  async scanDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        await this.scanDirectory(filePath);
      } else if (this.isCodeFile(file)) {
        await this.scanFile(filePath);
        this.stats.filesScanned++;
      }
    }
  }

  /**
   * Check if file is a code file
   */
  isCodeFile(filePath) {
    const ext = path.extname(filePath);
    return ['.js', '.jsx', '.ts', '.tsx'].includes(ext);
  }

  /**
   * Scan individual file for bugs
   */
  async scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      // Detect various types of bugs
      this.detectSyntaxErrors(content, relativePath);
      this.detectLogicErrors(content, relativePath);
      this.detectSecurityIssues(content, relativePath);
      this.detectPerformanceIssues(content, relativePath);
      this.detectCodeQualityIssues(content, relativePath);
      this.detectAsyncIssues(content, relativePath);
      this.detectMemoryLeaks(content, relativePath);
      this.detectRaceConditions(content, relativePath);
      
    } catch (error) {
      console.error(chalk.red(`Error scanning ${filePath}:`), error.message);
      this.stats.errors++;
    }
  }

  /**
   * Detect syntax errors
   */
  detectSyntaxErrors(content, filePath) {
    const syntaxPatterns = [
      {
        pattern: /console\.log\([^)]*\)/g,
        type: 'syntax',
        severity: 'warning',
        message: 'Console.log statement found - should be removed in production',
        fix: 'Remove or replace with proper logging'
      },
      {
        pattern: /debugger;/g,
        type: 'syntax',
        severity: 'error',
        message: 'Debugger statement found - should be removed',
        fix: 'Remove debugger statement'
      },
      {
        pattern: /TODO|FIXME|HACK|XXX/g,
        type: 'syntax',
        severity: 'info',
        message: 'TODO/FIXME comment found',
        fix: 'Address the TODO/FIXME comment'
      }
    ];

    this.checkPatterns(content, filePath, syntaxPatterns);
  }

  /**
   * Detect logic errors
   */
  detectLogicErrors(content, filePath) {
    const logicPatterns = [
      {
        pattern: /if\s*\(\s*true\s*\)/g,
        type: 'logic',
        severity: 'warning',
        message: 'Redundant if(true) condition',
        fix: 'Remove redundant condition'
      },
      {
        pattern: /if\s*\(\s*false\s*\)/g,
        type: 'logic',
        severity: 'error',
        message: 'Dead code - if(false) condition',
        fix: 'Remove dead code block'
      },
      {
        pattern: /==\s*null/g,
        type: 'logic',
        severity: 'warning',
        message: 'Use strict equality (===) instead of ==',
        fix: 'Replace == with ==='
      },
      {
        pattern: /!=\s*null/g,
        type: 'logic',
        severity: 'warning',
        message: 'Use strict inequality (!==) instead of !=',
        fix: 'Replace != with !=='
      }
    ];

    this.checkPatterns(content, filePath, logicPatterns);
  }

  /**
   * Detect security issues
   */
  detectSecurityIssues(content, filePath) {
    const securityPatterns = [
      {
        pattern: /eval\s*\(/g,
        type: 'security',
        severity: 'error',
        message: 'eval() usage detected - security risk',
        fix: 'Replace eval() with safer alternatives'
      },
      {
        pattern: /innerHTML\s*=/g,
        type: 'security',
        severity: 'warning',
        message: 'innerHTML usage - potential XSS risk',
        fix: 'Use textContent or sanitize input'
      },
      {
        pattern: /password.*=.*['"]\w+['"]/g,
        type: 'security',
        severity: 'error',
        message: 'Hardcoded password detected',
        fix: 'Use environment variables for passwords'
      },
      {
        pattern: /process\.env\.\w+.*\|\|.*['"]\w+['"]/g,
        type: 'security',
        severity: 'warning',
        message: 'Fallback values in environment variables',
        fix: 'Ensure secure fallback values'
      }
    ];

    this.checkPatterns(content, filePath, securityPatterns);
  }

  /**
   * Detect performance issues
   */
  detectPerformanceIssues(content, filePath) {
    const performancePatterns = [
      {
        pattern: /for\s*\([^)]*\.length[^)]*\)/g,
        type: 'performance',
        severity: 'warning',
        message: 'Array length in loop condition - cache length',
        fix: 'Cache array length before loop'
      },
      {
        pattern: /document\.getElementById\([^)]*\)/g,
        type: 'performance',
        severity: 'info',
        message: 'Multiple getElementById calls - consider caching',
        fix: 'Cache DOM element references'
      },
      {
        pattern: /setTimeout\([^,]*,\s*0\)/g,
        type: 'performance',
        severity: 'info',
        message: 'setTimeout with 0 delay - consider requestAnimationFrame',
        fix: 'Use requestAnimationFrame for DOM updates'
      }
    ];

    this.checkPatterns(content, filePath, performancePatterns);
  }

  /**
   * Detect code quality issues
   */
  detectCodeQualityIssues(content, filePath) {
    const qualityPatterns = [
      {
        pattern: /var\s+\w+/g,
        type: 'quality',
        severity: 'warning',
        message: 'var usage - prefer let/const',
        fix: 'Replace var with let or const'
      },
      {
        pattern: /function\s+\w+\s*\([^)]*\)\s*{[\s\S]*?}/g,
        type: 'quality',
        severity: 'info',
        message: 'Function declaration - consider arrow function',
        fix: 'Convert to arrow function if appropriate'
      },
      {
        pattern: /catch\s*\(\s*e\s*\)/g,
        type: 'quality',
        severity: 'warning',
        message: 'Generic catch parameter - be more specific',
        fix: 'Use specific error parameter name'
      }
    ];

    this.checkPatterns(content, filePath, qualityPatterns);
  }

  /**
   * Detect async issues
   */
  detectAsyncIssues(content, filePath) {
    const asyncPatterns = [
      {
        pattern: /await\s+[^(]*\([^)]*\)\s*;?\s*$/gm,
        type: 'async',
        severity: 'warning',
        message: 'Unhandled await - missing try/catch',
        fix: 'Wrap in try/catch block'
      },
      {
        pattern: /Promise\.all\([^)]*\)\.then\([^)]*\)\.catch/g,
        type: 'async',
        severity: 'info',
        message: 'Promise.all with .then/.catch - consider async/await',
        fix: 'Convert to async/await pattern'
      }
    ];

    this.checkPatterns(content, filePath, asyncPatterns);
  }

  /**
   * Detect memory leaks
   */
  detectMemoryLeaks(content, filePath) {
    const memoryPatterns = [
      {
        pattern: /addEventListener\([^,]*,\s*[^,]*\)/g,
        type: 'memory',
        severity: 'warning',
        message: 'Event listener - ensure removal to prevent memory leaks',
        fix: 'Add removeEventListener in cleanup'
      },
      {
        pattern: /setInterval\([^,]*,\s*[^,]*\)/g,
        type: 'memory',
        severity: 'warning',
        message: 'setInterval - ensure clearInterval to prevent memory leaks',
        fix: 'Add clearInterval in cleanup'
      }
    ];

    this.checkPatterns(content, filePath, memoryPatterns);
  }

  /**
   * Detect race conditions
   */
  detectRaceConditions(content, filePath) {
    const racePatterns = [
      {
        pattern: /await\s+[^(]*\([^)]*\)\s*;[\s\S]*?await\s+[^(]*\([^)]*\)/g,
        type: 'race',
        severity: 'warning',
        message: 'Sequential awaits - consider parallel execution',
        fix: 'Use Promise.all for parallel execution'
      }
    ];

    this.checkPatterns(content, filePath, racePatterns);
  }

  /**
   * Check patterns against content
   */
  checkPatterns(content, filePath, patterns) {
    patterns.forEach(pattern => {
      const matches = content.match(pattern.pattern);
      if (matches) {
        matches.forEach(match => {
          const bug = {
            id: this.generateBugId(),
            file: filePath,
            type: pattern.type,
            severity: pattern.severity,
            message: pattern.message,
            code: match.trim(),
            fix: pattern.fix,
            line: this.getLineNumber(content, match),
            timestamp: new Date().toISOString()
          };
          
          this.bugs.push(bug);
          this.stats.bugsFound++;
        });
      }
    });
  }

  /**
   * Get line number for a match
   */
  getLineNumber(content, match) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(match)) {
        return i + 1;
      }
    }
    return 0;
  }

  /**
   * Generate unique bug ID
   */
  generateBugId() {
    return `BUG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Analyze found bugs
   */
  async analyzeBugs() {
    console.log(chalk.yellow('\n🔍 Analyzing bugs...'));
    
    // Group bugs by type and severity
    const bugGroups = this.bugs.reduce((groups, bug) => {
      const key = `${bug.type}_${bug.severity}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(bug);
      return groups;
    }, {});

    // Prioritize bugs
    this.bugs.forEach(bug => {
      bug.priority = this.calculatePriority(bug);
    });

    // Sort by priority
    this.bugs.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate bug priority
   */
  calculatePriority(bug) {
    let priority = 0;
    
    // Severity weights
    const severityWeights = {
      'error': 4,
      'warning': 2,
      'info': 1
    };
    
    priority += severityWeights[bug.severity] || 0;
    
    // Type weights
    const typeWeights = {
      'security': 3,
      'logic': 2,
      'performance': 1,
      'memory': 2,
      'race': 2,
      'syntax': 1,
      'quality': 1,
      'async': 1
    };
    
    priority += typeWeights[bug.type] || 0;
    
    return priority;
  }

  /**
   * Generate fixes for bugs
   */
  async generateFixes() {
    console.log(chalk.yellow('\n🔧 Generating fixes...'));
    
    this.bugs.forEach(bug => {
      const fix = this.generateFix(bug);
      if (fix) {
        this.fixes.push({
          bugId: bug.id,
          file: bug.file,
          fix: fix,
          automated: this.canAutoFix(bug)
        });
      }
    });
  }

  /**
   * Generate fix for a specific bug
   */
  generateFix(bug) {
    switch (bug.type) {
      case 'syntax':
        return this.generateSyntaxFix(bug);
      case 'logic':
        return this.generateLogicFix(bug);
      case 'security':
        return this.generateSecurityFix(bug);
      case 'performance':
        return this.generatePerformanceFix(bug);
      case 'quality':
        return this.generateQualityFix(bug);
      case 'async':
        return this.generateAsyncFix(bug);
      case 'memory':
        return this.generateMemoryFix(bug);
      case 'race':
        return this.generateRaceFix(bug);
      default:
        return null;
    }
  }

  /**
   * Generate syntax fixes
   */
  generateSyntaxFix(bug) {
    if (bug.message.includes('console.log')) {
      return {
        type: 'remove',
        pattern: /console\.log\([^)]*\);?/g,
        replacement: '// console.log removed by Jules'
      };
    }
    
    if (bug.message.includes('debugger')) {
      return {
        type: 'remove',
        pattern: /debugger;?/g,
        replacement: '// debugger removed by Jules'
      };
    }
    
    return null;
  }

  /**
   * Generate logic fixes
   */
  generateLogicFix(bug) {
    if (bug.message.includes('== null')) {
      return {
        type: 'replace',
        pattern: /==\s*null/g,
        replacement: '=== null'
      };
    }
    
    if (bug.message.includes('!= null')) {
      return {
        type: 'replace',
        pattern: /!=\s*null/g,
        replacement: '!== null'
      };
    }
    
    return null;
  }

  /**
   * Generate security fixes
   */
  generateSecurityFix(bug) {
    if (bug.message.includes('innerHTML')) {
      return {
        type: 'replace',
        pattern: /\.innerHTML\s*=/g,
        replacement: '.textContent ='
      };
    }
    
    return null;
  }

  /**
   * Generate performance fixes
   */
  generatePerformanceFix(bug) {
    if (bug.message.includes('Array length in loop')) {
      return {
        type: 'replace',
        pattern: /for\s*\([^)]*\.length[^)]*\)/g,
        replacement: (match) => {
          const varMatch = match.match(/for\s*\([^)]*(\w+)\s*<\s*(\w+)\.length/);
          if (varMatch) {
            return `for (let ${varMatch[1]} = 0, len = ${varMatch[2]}.length; ${varMatch[1]} < len; ${varMatch[1]}++)`;
          }
          return match;
        }
      };
    }
    
    return null;
  }

  /**
   * Generate quality fixes
   */
  generateQualityFix(bug) {
    if (bug.message.includes('var usage')) {
      return {
        type: 'replace',
        pattern: /var\s+(\w+)/g,
        replacement: 'let $1'
      };
    }
    
    return null;
  }

  /**
   * Generate async fixes
   */
  generateAsyncFix(bug) {
    // Complex async fixes would need more sophisticated analysis
    return null;
  }

  /**
   * Generate memory fixes
   */
  generateMemoryFix(bug) {
    // Memory leak fixes require context analysis
    return null;
  }

  /**
   * Generate race condition fixes
   */
  generateRaceFix(bug) {
    // Race condition fixes require complex analysis
    return null;
  }

  /**
   * Check if bug can be auto-fixed
   */
  canAutoFix(bug) {
    const autoFixableTypes = ['syntax', 'logic', 'quality'];
    return autoFixableTypes.includes(bug.type);
  }

  /**
   * Apply fixes to files
   */
  async applyFixes() {
    console.log(chalk.yellow('\n🔧 Applying fixes...'));
    
    const automatedFixes = this.fixes.filter(fix => fix.automated);
    
    for (const fix of automatedFixes) {
      try {
        await this.applyFix(fix);
        this.stats.bugsFixed++;
      } catch (error) {
        console.error(chalk.red(`Error applying fix to ${fix.file}:`), error.message);
        this.stats.errors++;
      }
    }
  }

  /**
   * Apply a single fix to a file
   */
  async applyFix(fix) {
    const filePath = path.join(process.cwd(), fix.file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    let newContent = content;
    
    if (fix.fix.type === 'remove') {
      newContent = content.replace(fix.fix.pattern, fix.fix.replacement);
    } else if (fix.fix.type === 'replace') {
      if (typeof fix.fix.replacement === 'function') {
        newContent = content.replace(fix.fix.pattern, fix.fix.replacement);
      } else {
        newContent = content.replace(fix.fix.pattern, fix.fix.replacement);
      }
    }
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(chalk.green(`✅ Fixed bug in ${fix.file}`));
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateReport() {
    console.log(chalk.yellow('\n📊 Generating report...'));
    
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      bugs: this.bugs,
      fixes: this.fixes,
      summary: {
        totalBugs: this.bugs.length,
        bugsByType: this.groupBugsByType(),
        bugsBySeverity: this.groupBugsBySeverity(),
        automatedFixes: this.fixes.filter(f => f.automated).length,
        manualFixes: this.fixes.filter(f => !f.automated).length
      }
    };
    
    // Ensure reports directory exists
    const reportsDir = path.dirname(this.reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(this.reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.green(`📊 Report saved to ${this.reportPath}`));
  }

  /**
   * Group bugs by type
   */
  groupBugsByType() {
    return this.bugs.reduce((groups, bug) => {
      groups[bug.type] = (groups[bug.type] || 0) + 1;
      return groups;
    }, {});
  }

  /**
   * Group bugs by severity
   */
  groupBugsBySeverity() {
    return this.bugs.reduce((groups, bug) => {
      groups[bug.severity] = (groups[bug.severity] || 0) + 1;
      return groups;
    }, {});
  }

  /**
   * Print summary
   */
  printSummary() {
    console.log(chalk.blue.bold('\n📊 Jules Bug Detection Summary'));
    console.log(chalk.blue('=' .repeat(40)));
    console.log(chalk.white(`Files Scanned: ${this.stats.filesScanned}`));
    console.log(chalk.white(`Bugs Found: ${this.stats.bugsFound}`));
    console.log(chalk.green(`Bugs Fixed: ${this.stats.bugsFixed}`));
    console.log(chalk.red(`Errors: ${this.stats.errors}`));
    
    if (this.bugs.length > 0) {
      console.log(chalk.yellow('\n🐛 Bug Breakdown:'));
      const byType = this.groupBugsByType();
      Object.entries(byType).forEach(([type, count]) => {
        console.log(chalk.white(`  ${type}: ${count}`));
      });
      
      console.log(chalk.yellow('\n⚠️  Severity Breakdown:'));
      const bySeverity = this.groupBugsBySeverity();
      Object.entries(bySeverity).forEach(([severity, count]) => {
        const color = severity === 'error' ? 'red' : severity === 'warning' ? 'yellow' : 'blue';
        console.log(chalk[color](`  ${severity}: ${count}`));
      });
    }
  }
}

// Run Jules if called directly
if (require.main === module) {
  const jules = new JulesBugDetector();
  jules.run().catch(console.error);
}

module.exports = JulesBugDetector;
