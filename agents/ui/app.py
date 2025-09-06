import os
import requests
import streamlit as st

API_URL = os.environ.get("AGENTS_API_URL", "http://localhost:8081")

st.set_page_config(page_title="LUDUS Agents", page_icon="🤖")
st.title("LUDUS AI Agents Hub")

with st.sidebar:
    st.markdown("**Settings**")
    API_URL = st.text_input("Agents API URL", API_URL)

message = st.text_input("Message", "مرحبا")
if st.button("Send") and message:
    try:
        resp = requests.post(f"{API_URL}/chat", json={"message": message})
        if resp.ok:
            data = resp.json()
            st.success(data.get("reply", ""))
        else:
            st.error(f"Error: {resp.status_code} {resp.text}")
    except Exception as e:
        st.error(str(e))
