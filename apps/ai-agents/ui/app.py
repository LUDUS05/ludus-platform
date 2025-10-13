import os
import requests
import streamlit as st
import uuid
from datetime import datetime
import json

# Configuration
API_URL = os.environ.get("AGENTS_API_URL", "http://localhost:8081")

# Page configuration
st.set_page_config(
    page_title="LUDUS AI Agents Hub",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .chat-message {
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
    }
    .chat-message.user {
        background-color: #2b313e;
        flex-direction: row-reverse;
        text-align: right;
    }
    .chat-message.bot {
        background-color: #475063;
    }
    .chat-message .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        margin: 0 1rem;
    }
    .stButton > button {
        width: 100%;
        border-radius: 20px;
        border: none;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: bold;
    }
    .stButton > button:hover {
        background: linear-gradient(90deg, #764ba2 0%, #667eea 100%);
        color: white;
    }
    .agent-card {
        border: 1px solid #ddd;
        border-radius: 10px;
        padding: 1rem;
        margin: 0.5rem 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    .status-indicator {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 5px;
    }
    .status-online { background-color: #4CAF50; }
    .status-offline { background-color: #f44336; }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if "session_id" not in st.session_state:
    st.session_state.session_id = str(uuid.uuid4())
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "selected_agent" not in st.session_state:
    st.session_state.selected_agent = "customer_service"
if "selected_language" not in st.session_state:
    st.session_state.selected_language = "ar"

# Agent configurations
AGENTS = {
    "customer_service": {
        "name": "Customer Service Agent",
        "name_ar": "وكيل خدمة العملاء",
        "description": "Helps with general inquiries and support",
        "description_ar": "يساعد في الاستفسارات العامة والدعم",
        "icon": "🎧",
        "color": "#667eea"
    },
    "booking": {
        "name": "Booking Agent",
        "name_ar": "وكيل الحجوزات",
        "description": "Manages bookings and reservations",
        "description_ar": "يدير الحجوزات والمواعيد",
        "icon": "📅",
        "color": "#764ba2"
    },
    "vendor": {
        "name": "Vendor Coordination Agent",
        "name_ar": "وكيل تنسيق الموردين",
        "description": "Coordinates with service providers",
        "description_ar": "يتنسق مع مقدمي الخدمات",
        "icon": "🤝",
        "color": "#f093fb"
    },
    "search": {
        "name": "Activity Search Agent",
        "name_ar": "وكيل البحث عن الأنشطة",
        "description": "Finds and recommends activities",
        "description_ar": "يجد ويوصي بالأنشطة",
        "icon": "🔍",
        "color": "#4facfe"
    }
}

def send_message(message, agent_type, language):
    """Send message to the agents API"""
    try:
        payload = {
            "message": message,
            "language": language,
            "session_id": st.session_state.session_id,
            "agent_type": agent_type
        }
        
        response = requests.post(f"{API_URL}/chat", json=payload, timeout=30)
        
        if response.ok:
            data = response.json()
            return data.get("reply", ""), data.get("session_id", st.session_state.session_id)
        else:
            return f"Error: {response.status_code} - {response.text}", st.session_state.session_id
            
    except requests.exceptions.Timeout:
        return "Sorry, the request timed out. Please try again.", st.session_state.session_id
    except Exception as e:
        return f"Error: {str(e)}", st.session_state.session_id

def display_chat_message(message, is_user=True, timestamp=None):
    """Display a chat message with proper styling"""
    if is_user:
        st.markdown(f"""
        <div class="chat-message user">
            <div>
                <strong>You</strong> {f'<small>({timestamp})</small>' if timestamp else ''}<br>
                {message}
            </div>
            <div class="avatar" style="background: linear-gradient(45deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">U</div>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown(f"""
        <div class="chat-message bot">
            <div class="avatar" style="background: linear-gradient(45deg, #4facfe, #00f2fe); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">AI</div>
            <div>
                <strong>LUDUS Assistant</strong> {f'<small>({timestamp})</small>' if timestamp else ''}<br>
                {message}
            </div>
        </div>
        """, unsafe_allow_html=True)

# Main layout
col1, col2 = st.columns([3, 1])

with col1:
    st.title("🤖 LUDUS AI Agents Hub")
    st.markdown("**Intelligent assistance for your LUDUS platform needs**")

with col2:
    # Language selector
    language_options = {
        "ar": "العربية",
        "en": "English"
    }
    selected_lang = st.selectbox(
        "Language / اللغة",
        options=list(language_options.keys()),
        format_func=lambda x: language_options[x],
        index=0 if st.session_state.selected_language == "ar" else 1
    )
    st.session_state.selected_language = selected_lang

# Sidebar with agent selection
with st.sidebar:
    st.markdown("## 🎯 Select Agent")
    
    for agent_id, agent_info in AGENTS.items():
        is_selected = st.session_state.selected_agent == agent_id
        agent_name = agent_info["name_ar"] if selected_lang == "ar" else agent_info["name"]
        agent_desc = agent_info["description_ar"] if selected_lang == "ar" else agent_info["description"]
        
        if st.button(f"{agent_info['icon']} {agent_name}", key=f"agent_{agent_id}", use_container_width=True):
            st.session_state.selected_agent = agent_id
            st.rerun()
    
    st.markdown("---")
    
    # Session info
    st.markdown("## 📊 Session Info")
    st.markdown(f"**Session ID:** `{st.session_state.session_id[:8]}...`")
    st.markdown(f"**Messages:** {len(st.session_state.chat_history)}")
    
    # API Status
    st.markdown("## 🔗 API Status")
    try:
        health_response = requests.get(f"{API_URL}/health", timeout=5)
        if health_response.ok:
            health_data = health_response.json()
            redis_status = "🟢" if health_data.get("redis") == "ok" else "🔴"
            ollama_status = "🟢" if health_data.get("ollama") == "ok" else "🔴"
            st.markdown(f"**Redis:** {redis_status}")
            st.markdown(f"**Ollama:** {ollama_status}")
        else:
            st.markdown("🔴 **API:** Offline")
    except:
        st.markdown("🔴 **API:** Offline")
    
    # Clear chat button
    if st.button("🗑️ Clear Chat", use_container_width=True):
        st.session_state.chat_history = []
        st.session_state.session_id = str(uuid.uuid4())
        st.rerun()

# Chat interface
st.markdown("---")

# Display chat history
chat_container = st.container()
with chat_container:
    if st.session_state.chat_history:
        for msg in st.session_state.chat_history:
            display_chat_message(
                msg["content"], 
                is_user=msg["role"] == "user",
                timestamp=msg.get("timestamp", "")
            )
    else:
        # Welcome message
        welcome_msg = "مرحباً! أنا مساعد LUDUS. كيف يمكنني مساعدتك اليوم؟" if selected_lang == "ar" else "Hello! I'm your LUDUS assistant. How can I help you today?"
        display_chat_message(welcome_msg, is_user=False)

# Message input
st.markdown("---")
col1, col2 = st.columns([4, 1])

with col1:
    user_message = st.text_input(
        "Type your message...",
        placeholder="اكتب رسالتك هنا..." if selected_lang == "ar" else "Type your message here...",
        key="message_input"
    )

with col2:
    send_button = st.button("Send 📤", use_container_width=True)

# Handle message sending
if send_button and user_message:
    # Add user message to history
    timestamp = datetime.now().strftime("%H:%M")
    st.session_state.chat_history.append({
        "role": "user",
        "content": user_message,
        "timestamp": timestamp,
        "agent": st.session_state.selected_agent,
        "language": selected_lang
    })
    
    # Get agent info for display
    agent_info = AGENTS[st.session_state.selected_agent]
    agent_name = agent_info["name_ar"] if selected_lang == "ar" else agent_info["name"]
    
    # Show loading
    with st.spinner(f"🤖 {agent_name} is thinking..."):
        # Send to API
        response, session_id = send_message(
            user_message, 
            st.session_state.selected_agent, 
            selected_lang
        )
    
    # Add bot response to history
    st.session_state.chat_history.append({
        "role": "assistant",
        "content": response,
        "timestamp": timestamp,
        "agent": st.session_state.selected_agent,
        "language": selected_lang
    })
    
    # Update session ID if changed
    st.session_state.session_id = session_id
    
    # Clear input and rerun
    st.rerun()

# Footer
st.markdown("---")
st.markdown(
    """
    <div style='text-align: center; color: #666; padding: 1rem;'>
        <small>LUDUS AI Agents Hub | Powered by FastAPI + Streamlit + Redis</small>
    </div>
    """, 
    unsafe_allow_html=True
)
