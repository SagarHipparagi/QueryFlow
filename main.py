import streamlit as st
from streamlit.components.v1 import html
from langchain_helper import get_few_shot_db_chain

# Streamlit Page Config - must be first
st.set_page_config(page_title="AskDB AI", page_icon="⚡", layout="centered")

# Theme state management
if "theme" not in st.session_state:
    st.session_state.theme = "light-mode"

def toggle_theme():
    st.session_state.theme = "dark-mode" if st.session_state.theme == "light-mode" else "light-mode"

# Premium Apple-inspired CSS
apple_css = f"""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* ═══════════════════════════════════════════════════════════════
   DIRECT THEME STYLES (Streamlit-compatible)
   ═══════════════════════════════════════════════════════════════ */
.stApp {{
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    background-color: {'#0f172a' if st.session_state.theme == 'dark-mode' else '#fafafa'} !important;
    transition: background-color 0.4s ease;
}}

/* Hide Streamlit chrome */
#MainMenu, footer, header {{ visibility: hidden; }}
.stDeployButton {{ display: none; }}

/* ═══════════════════════════════════════════════════════════════
   THEME TOGGLE - Icon Only Circle Button
   ═══════════════════════════════════════════════════════════════ */
.theme-toggle-container {{
    position: fixed;
    top: 20px;
    right: 24px;
    z-index: 9999;
}}

.theme-toggle-btn {{
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: {'#1e293b' if st.session_state.theme == 'dark-mode' else '#ffffff'};
    border: 1px solid {'#334155' if st.session_state.theme == 'dark-mode' else '#e5e5e7'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: all 0.25s ease;
    color: {'#94a3b8' if st.session_state.theme == 'dark-mode' else '#86868b'};
}}

.theme-toggle-btn:hover {{
    background: {'#334155' if st.session_state.theme == 'dark-mode' else '#f5f5f7'};
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
    transform: scale(1.05);
}}

/* ═══════════════════════════════════════════════════════════════
   HEADER
   ═══════════════════════════════════════════════════════════════ */
.header-container {{
    text-align: center;
    padding: 4rem 0 2.5rem 0;
    margin-bottom: 1rem;
}}

.app-title {{
    font-size: 52px;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: {'#f1f5f9' if st.session_state.theme == 'dark-mode' else '#1d1d1f'};
    margin: 0;
    line-height: 1.1;
}}

.app-subtitle {{
    font-size: 19px;
    font-weight: 400;
    color: {'#94a3b8' if st.session_state.theme == 'dark-mode' else '#86868b'};
    margin-top: 14px;
    letter-spacing: 0.01em;
}}

/* ═══════════════════════════════════════════════════════════════
   GLASS CARDS
   ═══════════════════════════════════════════════════════════════ */
.glass-card {{
    background: {'rgba(30, 41, 59, 0.8)' if st.session_state.theme == 'dark-mode' else 'rgba(255, 255, 255, 0.72)'};
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid {'rgba(255, 255, 255, 0.08)' if st.session_state.theme == 'dark-mode' else 'rgba(0, 0, 0, 0.06)'};
    border-radius: 14px;
    padding: 28px 32px;
    margin: 24px 0;
    box-shadow: {'0 4px 24px rgba(0,0,0,0.3)' if st.session_state.theme == 'dark-mode' else '0 4px 24px rgba(0,0,0,0.08)'};
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}}

.glass-card:hover {{
    transform: translateY(-2px);
}}

.card-label {{
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: {'#64748b' if st.session_state.theme == 'dark-mode' else '#aeaeb2'};
    font-weight: 600;
    margin-bottom: 14px;
}}

.card-content {{
    font-size: 16px;
    color: {'#f1f5f9' if st.session_state.theme == 'dark-mode' else '#1d1d1f'};
    line-height: 1.65;
}}

/* ═══════════════════════════════════════════════════════════════
   INPUT BOX - Apple Style
   ═══════════════════════════════════════════════════════════════ */
.stTextInput > div > div > input {{
    background-color: {'#1e293b' if st.session_state.theme == 'dark-mode' else '#ffffff'} !important;
    border: 1.5px solid {'#334155' if st.session_state.theme == 'dark-mode' else '#e5e5e7'} !important;
    border-radius: 12px !important;
    padding: 18px 22px !important;
    font-size: 16px !important;
    line-height: 1.5 !important;
    color: {'#f1f5f9' if st.session_state.theme == 'dark-mode' else '#1d1d1f'} !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04) !important;
    transition: all 0.25s ease !important;
}}

.stTextInput > div > div > input:focus {{
    border-color: {'#3b82f6' if st.session_state.theme == 'dark-mode' else '#007AFF'} !important;
    box-shadow: 0 0 0 4px {'rgba(59, 130, 246, 0.15)' if st.session_state.theme == 'dark-mode' else 'rgba(0, 122, 255, 0.12)'} !important;
    outline: none !important;
}}

.stTextInput > div > div > input::placeholder {{
    color: {'#64748b' if st.session_state.theme == 'dark-mode' else '#aeaeb2'} !important;
}}

/* ═══════════════════════════════════════════════════════════════
   ALERT BANNERS - Slim Style
   ═══════════════════════════════════════════════════════════════ */
.alert-banner {{
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    border-radius: 10px;
    margin: 16px 0;
    font-size: 14px;
    line-height: 1.5;
}}

.alert-error {{
    background: {'rgba(248, 113, 113, 0.1)' if st.session_state.theme == 'dark-mode' else 'rgba(255, 59, 48, 0.06)'};
    border-left: 3px solid {'#f87171' if st.session_state.theme == 'dark-mode' else '#ff3b30'};
    color: {'#f1f5f9' if st.session_state.theme == 'dark-mode' else '#1d1d1f'};
}}

.alert-tip {{
    background: rgba(52, 199, 89, 0.08);
    border-left: 3px solid #34c759;
    color: {'#f1f5f9' if st.session_state.theme == 'dark-mode' else '#1d1d1f'};
}}

/* ═══════════════════════════════════════════════════════════════
   FOOTER - Minimal
   ═══════════════════════════════════════════════════════════════ */
.footer-minimal {{
    text-align: center;
    padding: 3rem 0 2rem 0;
    color: {'#64748b' if st.session_state.theme == 'dark-mode' else '#aeaeb2'};
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0.02em;
}}

/* ═══════════════════════════════════════════════════════════════
   SPINNER
   ═══════════════════════════════════════════════════════════════ */
.stSpinner > div {{
    border-top-color: {'#3b82f6' if st.session_state.theme == 'dark-mode' else '#007AFF'} !important;
}}

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════════ */
@media (max-width: 768px) {{
    .app-title {{ font-size: 38px; }}
    .app-subtitle {{ font-size: 16px; }}
    .glass-card {{ padding: 22px 20px; }}
    .header-container {{ padding: 3rem 0 2rem 0; }}
}}
</style>
"""


st.markdown(apple_css, unsafe_allow_html=True)

# Theme toggle button (icon-only in fixed position via HTML)
toggle_icon = "☀️" if st.session_state.theme == "dark-mode" else "🌙"
html(f"""
<script>
    // Apply theme class
    const theme = '{st.session_state.theme}';
    document.documentElement.classList.remove('light-mode', 'dark-mode');
    document.documentElement.classList.add(theme);
</script>
<div class="theme-toggle-container">
    <button class="theme-toggle-btn" onclick="
        const btn = document.querySelector('[data-testid=\\'stButton\\'] button');
        if (btn) btn.click();
    " title="Toggle theme">
        {toggle_icon}
    </button>
</div>
""", height=0)

# Hidden Streamlit button for actual toggle functionality
col_hidden = st.columns([1])[0]
with col_hidden:
    if st.button("toggle", key="theme_toggle", help="Toggle theme"):
        toggle_theme()
        st.rerun()

# Hide the button visually
st.markdown("""
<style>
[data-testid="stButton"] { 
    position: absolute; 
    opacity: 0; 
    pointer-events: none; 
    height: 0; 
    overflow: hidden;
}
</style>
""", unsafe_allow_html=True)

# Header
st.markdown("""
<div class="header-container">
    <h1 class="app-title">AskDB AI</h1>
    <p class="app-subtitle">Natural Language → SQL Intelligence</p>
</div>
""", unsafe_allow_html=True)

# Query Input
question = st.text_input(
    "Query",
    label_visibility="collapsed",
    placeholder="Ask a question about your inventory...",
    key="query_input"
)

# Process Query
if question:
    with st.spinner("Processing..."):
        try:
            chain = get_few_shot_db_chain()
            result_obj = chain.invoke({"query": question})
            
            answer = result_obj.get('result', str(result_obj)) if isinstance(result_obj, dict) else str(result_obj)
            
            st.markdown(f"""
            <div class="glass-card">
                <div class="card-label">Insights</div>
                <div class="card-content">{answer}</div>
            </div>
            """, unsafe_allow_html=True)
            
        except Exception as e:
            st.markdown(f"""
            <div class="alert-banner alert-error">
                <span class="alert-icon">●</span>
                <span>{str(e)}</span>
            </div>
            """, unsafe_allow_html=True)
            st.markdown("""
            <div class="alert-banner alert-tip">
                <span>💡</span>
                <span>Verify your database connection and API keys.</span>
            </div>
            """, unsafe_allow_html=True)

# Footer
st.markdown("""
<div class="footer-minimal">
    Powered by OpenRouter
</div>
""", unsafe_allow_html=True)
