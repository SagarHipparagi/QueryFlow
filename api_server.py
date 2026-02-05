"""
AskDB AI - Simplified Backend API Server
Provides REST API endpoints for direct SQL execution (Query Builder)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
import os
from dotenv import load_dotenv
import time

# Import LangChain helper for AI queries
try:
    from langchain_helper import get_few_shot_db_chain
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    print("⚠️  LangChain not available - AI queries will be disabled")

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'atliq_tshirts'),
}

def get_db_connection():
    """Create database connection"""
    return pymysql.connect(**DB_CONFIG)

def execute_sql_query(sql):
    """Execute SQL query and return results"""
    connection = get_db_connection()
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(sql)
            results = cursor.fetchall()
            return results
    finally:
        connection.close()

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'API is running'})

# ----------------------------------------------------------------------------
# Direct SQL Execution (for Query Builder)
# ----------------------------------------------------------------------------
@app.route('/api/execute-sql', methods=['POST'])
def execute_sql():
    """Execute raw SQL query directly"""
    try:
        print("=" * 60)
        print("📥 Received SQL execution request")
        print(f"Content-Type: {request.content_type}")
        print(f"Request data: {request.data}")
        
        data = request.json
        print(f"Parsed JSON: {data}")
        
        if data is None:
            print("❌ ERROR: request.json is None")
            return jsonify({'error': 'Invalid JSON in request body'}), 400
        
        sql = data.get('sql', '')
        print(f"SQL Query: {sql}")
        
        if not sql:
            print("❌ ERROR: SQL query is empty")
            return jsonify({'error': 'SQL query is required'}), 400
        
        # Security: Only allow SELECT queries
        sql_upper = sql.strip().upper()
        if not sql_upper.startswith('SELECT'):
            print(f"❌ ERROR: Non-SELECT query blocked: {sql_upper[:50]}")
            return jsonify({'error': 'Only SELECT queries are allowed'}), 403
        
        # Execute query
        print("✅ Executing query...")
        start_time = time.time()
        results = execute_sql_query(sql)
        execution_time = int((time.time() - start_time) * 1000)
        
        print(f"✅ Query executed successfully! {len(results)} rows returned in {execution_time}ms")
        print("=" * 60)
        
        return jsonify({
            'results': results,
            'execution_time': execution_time,
            'row_count': len(results)
        })
    
    except pymysql.Error as e:
        print(f"❌ Database error: {str(e)}")
        print("=" * 60)
        return jsonify({'error': f'Database error: {str(e)}'}), 400
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        print("=" * 60)
        return jsonify({'error': str(e)}), 500

# ----------------------------------------------------------------------------
# Natural Language Query (AI-powered)
# ----------------------------------------------------------------------------
@app.route('/api/query', methods=['POST'])
def process_natural_language_query():
    """Process natural language query using AI"""
    try:
        print("=" * 60)
        print("🤖 Received natural language query")
        
        data = request.json
        if data is None:
            return jsonify({'error': 'Invalid JSON in request body'}), 400
        
        question = data.get('query', '')
        print(f"Question: {question}")
        
        if not question:
            return jsonify({'error': 'Query is required'}), 400
        
        # Use direct Groq API call
        import requests as req
        
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            return jsonify({'error': 'Groq API key not configured'}), 503
        
        # Get database schema
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SHOW TABLES")
            tables = [row[0] for row in cursor.fetchall()]
            
            # Get schema for t_shirts table
            cursor.execute("DESCRIBE t_shirts")
            schema = cursor.fetchall()
        connection.close()
        
        schema_text = "Database: atliq_tshirts\\nTable: t_shirts\\nColumns:\\n"
        for col in schema:
            schema_text += f"- {col[0]} ({col[1]})\\n"
        
        # Create prompt for Groq
        prompt = f"""You are a MySQL expert. Given a database schema and a question, generate a SQL query and execute it.

{schema_text}

Question: {question}

Generate ONLY a valid MySQL SELECT query. Do not include any explanation, just the SQL query."""
        
        # Call Groq API
        print("🔗 Calling Groq API...")
        start_time = time.time()
        
        groq_response = req.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2,
                "max_tokens": 200
            },
            timeout=30
        )
        
        if groq_response.status_code != 200:
            return jsonify({'error': f'Groq API error: {groq_response.text}'}), 500
        
        sql_query = groq_response.json()['choices'][0]['message']['content'].strip()
        # Remove markdown code blocks if present
        sql_query = sql_query.replace('```sql', '').replace('```', '').strip()
        
        print(f"Generated SQL: {sql_query}")
        
        # Execute the SQL
        results = execute_sql_query(sql_query)
        execution_time = int((time.time() - start_time) * 1000)
        
        # Format the answer
        if len(results) == 0:
            answer = "No results found."
        elif len(results) == 1 and len(results[0]) == 1:
            # Single value result
            answer = f"The answer is: {list(results[0].values())[0]}"
        else:
            # Multiple results - format as text
            answer = f"Found {len(results)} results:\\n"
            for i, row in enumerate(results[:5], 1):
                answer += f"{i}. {', '.join([f'{k}: {v}' for k, v in row.items()])}\\n"
            if len(results) > 5:
                answer += f"... and {len(results) - 5} more"
        
        print(f"✅ Query executed successfully in {execution_time}ms")
        print(f"Answer: {answer[:200]}...")
        print("=" * 60)
        
        return jsonify({
            'answer': answer,
            'sql': sql_query,
            'execution_time': execution_time,
            'query': question,
            'results': results[:10]  # Include first 10 results
        })
    
    except Exception as e:
        print(f"❌ AI Query Error: {str(e)}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'AI processing failed: {str(e)}'}), 500

# ----------------------------------------------------------------------------
# Database Info
# ----------------------------------------------------------------------------
@app.route('/api/database/info', methods=['GET'])
def get_database_info():
    """Get database information"""
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            # Get table count
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            table_count = len(tables)
            
            # Get total row count
            cursor.execute(f"SELECT SUM(TABLE_ROWS) as total FROM information_schema.TABLES WHERE TABLE_SCHEMA = '{DB_CONFIG['database']}'")
            result = cursor.fetchone()
            total_rows = result[0] if result and result[0] else 0
            
        connection.close()
        
        return jsonify({
            'tables': table_count,
            'totalRows': f'{total_rows:,}',
            'lastSync': 'Just now'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/database/tables', methods=['GET'])
def get_tables():
    """Get list of database tables"""
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SHOW TABLES")
            tables = [row[0] for row in cursor.fetchall()]
        connection.close()
        
        return jsonify({'tables': tables})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ----------------------------------------------------------------------------
# Metrics (Mock data for now)
# ----------------------------------------------------------------------------
@app.route('/api/metrics/queries', methods=['GET'])
def get_query_metrics():
    return jsonify({'value': '1,284', 'change': '+12.5%', 'changeType': 'increase'})

@app.route('/api/metrics/users', methods=['GET'])
def get_user_metrics():
    return jsonify({'value': '32', 'change': '+4 today', 'changeType': 'increase'})

@app.route('/api/metrics/response-time', methods=['GET'])
def get_response_time():
    return jsonify({'value': '0.8s', 'change': '-15%', 'changeType': 'increase'})

@app.route('/api/metrics/uptime', methods=['GET'])
def get_uptime():
    return jsonify({'value': '99.9%', 'change': '30 days', 'changeType': 'neutral'})

# ----------------------------------------------------------------------------
# Recent Queries (Mock data for now)
# ----------------------------------------------------------------------------
@app.route('/api/queries/recent', methods=['GET'])
def get_recent_queries():
    return jsonify([
        {'query': 'SELECT * FROM t_shirts WHERE brand = "Nike"', 'time': '2 min ago', 'status': 'success', 'executionTime': 1450, 'rows': 15},
        {'query': 'SELECT COUNT(*) FROM t_shirts', 'time': '15 min ago', 'status': 'success', 'executionTime': 567, 'rows': 1},
        {'query': 'SELECT * FROM t_shirts WHERE stock_quantity < 50', 'time': '1 hour ago', 'status': 'success', 'executionTime': 892, 'rows': 12},
    ])

# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 AskDB AI - Backend API Server (SQL Execution Only)")
    print("=" * 60)
    print(f"📊 Database: {DB_CONFIG['database']}")
    print(f"🌐 API URL: http://localhost:8000")
    print(f"📝 Endpoints:")
    print(f"   - POST /api/execute-sql (Direct SQL execution)")
    print(f"   - GET  /api/database/tables")
    print(f"   - GET  /api/database/info")
    print("=" * 60)
    print("✅ Server is ready! You can now use the Query Builder.")
    print("=" * 60)
    port = int(os.environ.get('PORT', 8000))
    # In production (Render), debug should ideally be False, but we'll leave it 
    # as-is or controllable via env var if you prefer. 
    # app.run is not used when running with Gunicorn, but good for local dev.
    app.run(host='0.0.0.0', port=port, debug=True)
