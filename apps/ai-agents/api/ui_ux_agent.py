"""
LUDUS UI/UX Designing Agent - Specialized agent for automated UI/UX design and development
"""

import json
import uuid
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from pydantic import BaseModel
from enum import Enum


class DesignType(str, Enum):
    """Types of design tasks"""
    COMPONENT = "component"
    PAGE = "page"
    LAYOUT = "layout"
    RESPONSIVE = "responsive"
    ACCESSIBILITY = "accessibility"
    PROTOTYPE = "prototype"
    DESIGN_SYSTEM = "design_system"


class DesignComplexity(str, Enum):
    """Complexity levels for design tasks"""
    SIMPLE = "simple"
    MEDIUM = "medium"
    COMPLEX = "complex"


class DesignRequest(BaseModel):
    """Model for design requests"""
    request_id: str
    design_type: DesignType
    complexity: DesignComplexity
    requirements: str
    target_platform: str = "web"
    language: str = "ar"
    user_context: Optional[Dict[str, Any]] = None
    existing_components: Optional[List[str]] = None
    design_constraints: Optional[Dict[str, Any]] = None


class DesignResponse(BaseModel):
    """Model for design responses"""
    request_id: str
    status: str
    design_output: Dict[str, Any]
    generated_code: Optional[str] = None
    design_specifications: Dict[str, Any]
    accessibility_score: Optional[float] = None
    responsive_breakpoints: Optional[List[str]] = None
    estimated_development_time: Optional[int] = None
    recommendations: List[str] = []


class UIUXAgent:
    """Specialized agent for UI/UX design automation"""
    
    def __init__(self, redis_client=None, ollama_client=None):
        self.redis_client = redis_client
        self.ollama_client = ollama_client
        self.design_templates = self._load_design_templates()
        self.component_library = self._load_component_library()
        self.design_system = self._load_design_system()
        
    def _load_design_templates(self) -> Dict[str, Any]:
        """Load design templates for different types of components"""
        return {
            "button": {
                "ar": {
                    "primary": "زر أساسي",
                    "secondary": "زر ثانوي",
                    "outline": "زر محدد",
                    "ghost": "زر شفاف"
                },
                "en": {
                    "primary": "Primary Button",
                    "secondary": "Secondary Button", 
                    "outline": "Outline Button",
                    "ghost": "Ghost Button"
                }
            },
            "form": {
                "ar": {
                    "input": "حقل إدخال",
                    "textarea": "منطقة نص",
                    "select": "قائمة منسدلة",
                    "checkbox": "مربع اختيار",
                    "radio": "زر اختيار"
                },
                "en": {
                    "input": "Input Field",
                    "textarea": "Text Area",
                    "select": "Select Dropdown",
                    "checkbox": "Checkbox",
                    "radio": "Radio Button"
                }
            },
            "card": {
                "ar": {
                    "basic": "بطاقة أساسية",
                    "featured": "بطاقة مميزة",
                    "interactive": "بطاقة تفاعلية"
                },
                "en": {
                    "basic": "Basic Card",
                    "featured": "Featured Card",
                    "interactive": "Interactive Card"
                }
            }
        }
    
    def _load_component_library(self) -> Dict[str, Any]:
        """Load reusable component library"""
        return {
            "buttons": {
                "primary": {
                    "styles": "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg",
                    "rtl_support": True,
                    "accessibility": ["aria-label", "role=button"]
                },
                "secondary": {
                    "styles": "bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg",
                    "rtl_support": True,
                    "accessibility": ["aria-label", "role=button"]
                }
            },
            "forms": {
                "input": {
                    "styles": "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500",
                    "rtl_support": True,
                    "accessibility": ["aria-label", "aria-required", "aria-invalid"]
                },
                "textarea": {
                    "styles": "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-vertical",
                    "rtl_support": True,
                    "accessibility": ["aria-label", "aria-required", "aria-invalid"]
                }
            },
            "cards": {
                "basic": {
                    "styles": "bg-white rounded-lg shadow-md p-6 border border-gray-200",
                    "rtl_support": True,
                    "accessibility": ["role=article", "aria-labelledby"]
                }
            }
        }
    
    def _load_design_system(self) -> Dict[str, Any]:
        """Load LUDUS design system specifications"""
        return {
            "colors": {
                "primary": "#3B82F6",
                "secondary": "#6B7280", 
                "success": "#10B981",
                "warning": "#F59E0B",
                "error": "#EF4444",
                "background": "#FFFFFF",
                "surface": "#F9FAFB",
                "text": "#111827"
            },
            "typography": {
                "font_family": "Inter, system-ui, sans-serif",
                "font_sizes": {
                    "xs": "0.75rem",
                    "sm": "0.875rem", 
                    "base": "1rem",
                    "lg": "1.125rem",
                    "xl": "1.25rem",
                    "2xl": "1.5rem",
                    "3xl": "1.875rem"
                }
            },
            "spacing": {
                "xs": "0.25rem",
                "sm": "0.5rem",
                "md": "1rem",
                "lg": "1.5rem",
                "xl": "2rem",
                "2xl": "3rem"
            },
            "breakpoints": {
                "sm": "640px",
                "md": "768px",
                "lg": "1024px",
                "xl": "1280px",
                "2xl": "1536px"
            }
        }
    
    def _get_design_request_key(self, request_id: str) -> str:
        """Get Redis key for design request data"""
        return f"agents:ui_ux_request:{request_id}"
    
    def _get_design_requests_key(self) -> str:
        """Get Redis key for all design requests"""
        return "agents:ui_ux_requests"
    
    def create_design_request(self, request_data: DesignRequest) -> DesignResponse:
        """Create a new UI/UX design request"""
        try:
            # Generate design specifications
            design_specs = self._generate_design_specifications(request_data)
            
            # Generate code based on design type
            generated_code = self._generate_code(request_data, design_specs)
            
            # Calculate accessibility score
            accessibility_score = self._calculate_accessibility_score(generated_code)
            
            # Generate responsive breakpoints
            responsive_breakpoints = self._generate_responsive_breakpoints(request_data)
            
            # Estimate development time
            dev_time = self._estimate_development_time(request_data.complexity, request_data.design_type)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(request_data, design_specs)
            
            design_output = {
                "design_type": request_data.design_type,
                "complexity": request_data.complexity,
                "specifications": design_specs,
                "code": generated_code,
                "accessibility_score": accessibility_score,
                "responsive_breakpoints": responsive_breakpoints,
                "created_at": datetime.now().isoformat()
            }
            
            # Save to Redis
            if self.redis_client:
                self.redis_client.setex(
                    self._get_design_request_key(request_data.request_id),
                    60 * 60 * 24 * 30,  # 30 days
                    json.dumps(design_output)
                )
                
                # Add to requests list
                requests = self.get_all_design_requests()
                requests.append(request_data.request_id)
                self.redis_client.setex(
                    self._get_design_requests_key(),
                    60 * 60 * 24 * 30,
                    json.dumps(requests)
                )
            
            return DesignResponse(
                request_id=request_data.request_id,
                status="completed",
                design_output=design_output,
                generated_code=generated_code,
                design_specifications=design_specs,
                accessibility_score=accessibility_score,
                responsive_breakpoints=responsive_breakpoints,
                estimated_development_time=dev_time,
                recommendations=recommendations
            )
            
        except Exception as e:
            return DesignResponse(
                request_id=request_data.request_id,
                status="error",
                design_output={"error": str(e)},
                generated_code=None,
                design_specifications={},
                accessibility_score=0.0,
                responsive_breakpoints=[],
                estimated_development_time=0,
                recommendations=[f"Error in design generation: {str(e)}"]
            )
    
    def _generate_design_specifications(self, request: DesignRequest) -> Dict[str, Any]:
        """Generate detailed design specifications"""
        specs = {
            "layout": self._generate_layout_specs(request),
            "colors": self._generate_color_specs(request),
            "typography": self._generate_typography_specs(request),
            "spacing": self._generate_spacing_specs(request),
            "components": self._generate_component_specs(request),
            "interactions": self._generate_interaction_specs(request),
            "accessibility": self._generate_accessibility_specs(request)
        }
        
        return specs
    
    def _generate_layout_specs(self, request: DesignRequest) -> Dict[str, Any]:
        """Generate layout specifications"""
        if request.design_type == DesignType.PAGE:
            return {
                "type": "grid",
                "columns": 12,
                "gutters": "1rem",
                "max_width": "1200px",
                "container_padding": "1rem",
                "rtl_support": True
            }
        elif request.design_type == DesignType.COMPONENT:
            return {
                "type": "flexbox",
                "direction": "column",
                "alignment": "center",
                "justification": "center",
                "rtl_support": True
            }
        else:
            return {
                "type": "responsive",
                "breakpoints": self.design_system["breakpoints"],
                "rtl_support": True
            }
    
    def _generate_color_specs(self, request: DesignRequest) -> Dict[str, Any]:
        """Generate color specifications"""
        base_colors = self.design_system["colors"].copy()
        
        # Add semantic colors based on requirements
        if "error" in request.requirements.lower() or "خطأ" in request.requirements:
            base_colors["semantic"] = {"error": base_colors["error"]}
        if "success" in request.requirements.lower() or "نجاح" in request.requirements:
            base_colors["semantic"] = {"success": base_colors["success"]}
            
        return base_colors
    
    def _generate_typography_specs(self, request: DesignRequest) -> Dict[str, Any]:
        """Generate typography specifications"""
        typography = self.design_system["typography"].copy()
        
        # Add language-specific typography
        if request.language == "ar":
            typography["font_family"] = "Cairo, Inter, system-ui, sans-serif"
            typography["direction"] = "rtl"
        else:
            typography["direction"] = "ltr"
            
        return typography
    
    def _generate_spacing_specs(self, request: DesignRequest) -> Dict[str, Any]:
        """Generate spacing specifications"""
        return self.design_system["spacing"]
    
    def _generate_component_specs(self, request: DesignRequest) -> Dict[str, Any]:
        """Generate component specifications"""
        components = {}
        
        # Extract component requirements
        if "button" in request.requirements.lower() or "زر" in request.requirements:
            components["button"] = self.component_library["buttons"]["primary"]
        if "form" in request.requirements.lower() or "نموذج" in request.requirements:
            components["form"] = self.component_library["forms"]
        if "card" in request.requirements.lower() or "بطاقة" in request.requirements:
            components["card"] = self.component_library["cards"]["basic"]
            
        return components
    
    def _generate_interaction_specs(self, request: DesignRequest) -> Dict[str, Any]:
        """Generate interaction specifications"""
        interactions = {
            "hover_effects": True,
            "focus_states": True,
            "loading_states": True,
            "error_states": True,
            "success_states": True,
            "transitions": {
                "duration": "200ms",
                "easing": "ease-in-out"
            }
        }
        
        return interactions
    
    def _generate_accessibility_specs(self, request: DesignRequest) -> Dict[str, Any]:
        """Generate accessibility specifications"""
        return {
            "aria_labels": True,
            "keyboard_navigation": True,
            "screen_reader_support": True,
            "color_contrast": "AA",
            "focus_indicators": True,
            "semantic_html": True,
            "alt_text": True
        }
    
    def _generate_code(self, request: DesignRequest, specs: Dict[str, Any]) -> str:
        """Generate code based on design specifications"""
        if request.design_type == DesignType.COMPONENT:
            return self._generate_component_code(request, specs)
        elif request.design_type == DesignType.PAGE:
            return self._generate_page_code(request, specs)
        elif request.design_type == DesignType.LAYOUT:
            return self._generate_layout_code(request, specs)
        else:
            return self._generate_generic_code(request, specs)
    
    def _generate_component_code(self, request: DesignRequest, specs: Dict[str, Any]) -> str:
        """Generate component code"""
        component_name = self._extract_component_name(request.requirements)
        language = request.language
        
        if component_name == "button":
            return self._generate_button_code(request, specs)
        elif component_name == "form":
            return self._generate_form_code(request, specs)
        elif component_name == "card":
            return self._generate_card_code(request, specs)
        else:
            return self._generate_generic_component_code(request, specs)
    
    def _generate_button_code(self, request: DesignRequest, specs: Dict[str, Any]) -> str:
        """Generate button component code"""
        button_type = "primary"
        if "secondary" in request.requirements.lower():
            button_type = "secondary"
        elif "outline" in request.requirements.lower():
            button_type = "outline"
            
        button_config = self.component_library["buttons"][button_type]
        
        code = '''import React from 'react';
import { useTranslation } from 'react-i18next';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = '{}',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {{
  const {{ t }} = useTranslation();
  
  const baseClasses = "{}";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  const loadingClasses = loading ? "cursor-wait" : "";
  
  return (
    <button
      type={{type}}
      onClick={{onClick}}
      disabled={{disabled || loading}}
      className={`${{baseClasses}} ${{disabledClasses}} ${{loadingClasses}} ${{className}}`}
      aria-label={{t('common.button', {{ defaultValue: children }})}}
      role="button"
      {{...props}}
    >
      {{loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          {{t('common.loading', {{ defaultValue: 'Loading...' }})}}
        </div>
      ) : (
        children
      )}}
    </button>
  );
}};

export default Button;'''.format(button_type, button_config['styles'])
        
        return code
    
    def _generate_form_code(self, request: DesignRequest, specs: Dict[str, Any]) -> str:
        """Generate form component code"""
        return '''import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Form = ({ onSubmit, fields = [], className = '' }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData, fields);
    
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
    } else {
      setErrors(validationErrors);
    }
  };
  
  const validateForm = (data, fieldConfigs) => {
    const errors = {};
    
    fieldConfigs.forEach(field => {
      if (field.required && !data[field.name]) {
        errors[field.name] = t(`validation.required`, { 
          defaultValue: `${field.label} is required` 
        });
      }
    });
    
    return errors;
  };
  
  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`} dir={t('common.direction', { defaultValue: 'ltr' })}>
      {fields.map(field => (
        <div key={field.name} className="space-y-1">
          <label 
            htmlFor={field.name}
            className="block text-sm font-medium text-gray-700"
          >
            {t(field.labelKey, { defaultValue: field.label })}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              aria-label={t(field.labelKey, { defaultValue: field.label })}
              aria-required={field.required}
              aria-invalid={!!errors[field.name]}
              rows={field.rows || 3}
            />
          ) : (
            <input
              id={field.name}
              name={field.name}
              type={field.type || 'text'}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label={t(field.labelKey, { defaultValue: field.label })}
              aria-required={field.required}
              aria-invalid={!!errors[field.name]}
              placeholder={field.placeholder ? t(field.placeholderKey, { defaultValue: field.placeholder }) : ''}
            />
          )}
          
          {errors[field.name] && (
            <p className="text-red-500 text-sm" role="alert" aria-live="polite">
              {errors[field.name]}
            </p>
          )}
        </div>
      ))}
      
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        aria-label={t('form.submit', { defaultValue: 'Submit form' })}
      >
        {t('form.submit', { defaultValue: 'Submit' })}
      </button>
    </form>
  );
};

export default Form;'''
    
    def _generate_card_code(self, request: DesignRequest, specs: Dict[str, Any]) -> str:
        """Generate card component code"""
        return '''import React from 'react';
import { useTranslation } from 'react-i18next';

const Card = ({ 
  title, 
  children, 
  image, 
  actions, 
  className = '',
  variant = 'basic',
  ...props 
}) => {
  const { t } = useTranslation();
  
  const baseClasses = "bg-white rounded-lg shadow-md border border-gray-200";
  const variantClasses = {
    basic: "p-6",
    featured: "p-6 border-l-4 border-blue-500",
    interactive: "p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
  };
  
  return (
    <article 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      role="article"
      aria-labelledby={title ? `card-title-${Math.random().toString(36).substr(2, 9)}` : undefined}
      {...props}
    >
      {image && (
        <div className="mb-4">
          <img 
            src={image.src} 
            alt={image.alt || t('common.image', { defaultValue: 'Card image' })}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}
      
      {title && (
        <h3 
          id={`card-title-${Math.random().toString(36).substr(2, 9)}`}
          className="text-lg font-semibold text-gray-900 mb-2"
        >
          {typeof title === 'string' ? t(title, { defaultValue: title }) : title}
        </h3>
      )}
      
      <div className="text-gray-600">
        {children}
      </div>
      
      {actions && (
        <div className="mt-4 flex space-x-2 rtl:space-x-reverse">
          {actions}
        </div>
      )}
    </article>
  );
};

export default Card;'''
    
    def _generate_page_code(self, request: DesignRequest, specs: Dict[str, Any]) -> str:
        """Generate page layout code"""
        return '''import React from 'react';
import { useTranslation } from 'react-i18next';

const Page = ({ 
  title, 
  children, 
  header, 
  sidebar, 
  footer,
  className = '',
  maxWidth = '1200px',
  ...props 
}) => {
  const { t } = useTranslation();
  
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`} {...props}>
      {header && (
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {header}
          </div>
        </header>
      )}
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {title && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                {typeof title === 'string' ? t(title, { defaultValue: title }) : title}
              </h1>
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-8">
            {sidebar && (
              <aside className="lg:w-1/4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  {sidebar}
                </div>
              </aside>
            )}
            
            <div className={`${sidebar ? 'lg:w-3/4' : 'w-full'}`}>
              <div className="bg-white rounded-lg shadow-sm p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {footer && (
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
};

export default Page;'''
    
    def _generate_layout_code(self, request: DesignRequest, specs: Dict[str, Any]) -> str:
        """Generate layout code"""
        return '''import React from 'react';
import { useTranslation } from 'react-i18next';

const Layout = ({ 
  children, 
  direction = 'row',
  gap = 'md',
  alignment = 'start',
  justify = 'start',
  wrap = false,
  className = '',
  ...props 
}) => {
  const { t } = useTranslation();
  
  const directionClasses = {
    row: 'flex-row',
    column: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'column-reverse': 'flex-col-reverse'
  };
  
  const gapClasses = {
    xs: 'gap-1',
    sm: 'gap-2', 
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };
  
  const alignmentClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };
  
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };
  
  return (
    <div 
      className={`
        flex 
        ${directionClasses[direction]} 
        ${gapClasses[gap]} 
        ${alignmentClasses[alignment]} 
        ${justifyClasses[justify]}
        ${wrap ? 'flex-wrap' : 'flex-nowrap'}
        ${className}
      `}
      dir={t('common.direction', { defaultValue: 'ltr' })}
      {...props}
    >
      {children}
    </div>
  );
};

export default Layout;'''
    
    def _generate_generic_code(self, request: DesignRequest, specs: Dict[str, Any]) -> str:
        """Generate generic code template"""
        component_name = self._extract_component_name(request.requirements).title()
        basic_styles = self.component_library.get('basic', {}).get('styles', '')
        
        return '''import React from 'react';
import {{ useTranslation }} from 'react-i18next';

const {} = ({{
  className = '',
  ...props
}}) => {{
  const {{ t }} = useTranslation();
  
  return (
    <div 
      className={`{} ${{className}}`}
      dir={{t('common.direction', {{ defaultValue: 'ltr' }})}}
      {{...props}}
    >
      <!-- Generated component content -->
      <p>{{t('common.placeholder', {{ defaultValue: 'Component content' }})}}</p>
    </div>
  );
}};

export default {};'''.format(component_name, basic_styles, component_name)
    
    def _extract_component_name(self, requirements: str) -> str:
        """Extract component name from requirements"""
        requirements_lower = requirements.lower()
        
        if "button" in requirements_lower or "زر" in requirements_lower:
            return "button"
        elif "form" in requirements_lower or "نموذج" in requirements_lower:
            return "form"
        elif "card" in requirements_lower or "بطاقة" in requirements_lower:
            return "card"
        elif "input" in requirements_lower or "حقل" in requirements_lower:
            return "input"
        elif "modal" in requirements_lower or "نافذة" in requirements_lower:
            return "modal"
        elif "navbar" in requirements_lower or "شريط" in requirements_lower:
            return "navbar"
        else:
            return "component"
    
    def _calculate_accessibility_score(self, code: str) -> float:
        """Calculate accessibility score based on generated code"""
        score = 0.0
        total_checks = 8
        
        # Check for ARIA labels
        if "aria-label" in code:
            score += 1.0
        if "aria-required" in code:
            score += 1.0
        if "aria-invalid" in code:
            score += 1.0
        if "role=" in code:
            score += 1.0
        if "aria-live" in code:
            score += 1.0
        if "aria-labelledby" in code:
            score += 1.0
        if "alt=" in code:
            score += 1.0
        if "semantic" in code.lower():
            score += 1.0
            
        return (score / total_checks) * 100
    
    def _generate_responsive_breakpoints(self, request: DesignRequest) -> List[str]:
        """Generate responsive breakpoints"""
        return list(self.design_system["breakpoints"].keys())
    
    def _estimate_development_time(self, complexity: DesignComplexity, design_type: DesignType) -> int:
        """Estimate development time in minutes"""
        base_times = {
            DesignType.COMPONENT: {"simple": 15, "medium": 30, "complex": 60},
            DesignType.PAGE: {"simple": 30, "medium": 60, "complex": 120},
            DesignType.LAYOUT: {"simple": 20, "medium": 40, "complex": 80},
            DesignType.RESPONSIVE: {"simple": 25, "medium": 50, "complex": 100},
            DesignType.ACCESSIBILITY: {"simple": 20, "medium": 40, "complex": 80},
            DesignType.PROTOTYPE: {"simple": 45, "medium": 90, "complex": 180},
            DesignType.DESIGN_SYSTEM: {"simple": 60, "medium": 120, "complex": 240}
        }
        
        return base_times.get(design_type, {}).get(complexity, 30)
    
    def _generate_recommendations(self, request: DesignRequest, specs: Dict[str, Any]) -> List[str]:
        """Generate design recommendations"""
        recommendations = []
        
        # Accessibility recommendations
        if specs.get("accessibility", {}).get("aria_labels"):
            recommendations.append("Ensure all interactive elements have descriptive ARIA labels")
        
        # RTL recommendations
        if request.language == "ar":
            recommendations.append("Test layout in RTL mode to ensure proper text direction")
            recommendations.append("Use RTL-aware spacing utilities (rtl:space-x-reverse)")
        
        # Performance recommendations
        if request.complexity == DesignComplexity.COMPLEX:
            recommendations.append("Consider code splitting for better performance")
            recommendations.append("Implement lazy loading for heavy components")
        
        # Responsive recommendations
        recommendations.append("Test on multiple screen sizes and devices")
        recommendations.append("Use mobile-first approach for responsive design")
        
        return recommendations
    
    def get_design_request(self, request_id: str) -> Optional[Dict[str, Any]]:
        """Get design request details by ID"""
        if not self.redis_client:
            return None
            
        try:
            data = self.redis_client.get(self._get_design_request_key(request_id))
            if data:
                return json.loads(data)
        except Exception:
            pass
        return None
    
    def get_all_design_requests(self) -> List[str]:
        """Get list of all design request IDs"""
        if not self.redis_client:
            return []
            
        try:
            data = self.redis_client.get(self._get_design_requests_key())
            if data:
                return json.loads(data)
        except Exception:
            pass
        return []
    
    def process_design_inquiry(self, message: str, language: str = "ar") -> str:
        """Process design-related inquiries"""
        message_lower = message.lower()
        
        if any(keyword in message_lower for keyword in ["design", "تصميم", "ui", "ux", "component", "مكون"]):
            if language.startswith("ar"):
                return """أنا وكيل تصميم UI/UX في LUDUS. يمكنني مساعدتك في:

• إنشاء مكونات واجهة المستخدم
• تصميم صفحات كاملة
• إنشاء تخطيطات متجاوبة
• ضمان إمكانية الوصول
• إنشاء أنظمة التصميم
• تحسين تجربة المستخدم

أخبرني ما تريد تصميمه وسأقوم بإنشائه لك!"""
            else:
                return """I'm the UI/UX design agent for LUDUS. I can help you with:

• Creating UI components
• Designing complete pages
• Building responsive layouts
• Ensuring accessibility
• Creating design systems
• Optimizing user experience

Tell me what you want to design and I'll create it for you!"""
        
        return "I can help you with UI/UX design tasks. What would you like to create?"


# Mock design data for testing
MOCK_DESIGN_REQUESTS = {
    "DESIGN001": {
        "type": "button",
        "complexity": "simple",
        "requirements": "Create a primary button component",
        "language": "ar"
    },
    "DESIGN002": {
        "type": "form", 
        "complexity": "medium",
        "requirements": "Create a contact form with validation",
        "language": "en"
    },
    "DESIGN003": {
        "type": "card",
        "complexity": "complex", 
        "requirements": "Create an interactive product card with image and actions",
        "language": "ar"
    }
}
