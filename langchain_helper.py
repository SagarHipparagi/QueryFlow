from langchain_openai import ChatOpenAI
from langchain_community.utilities import SQLDatabase
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import FewShotPromptTemplate
from langchain_core.prompts import PromptTemplate
from few_shots import few_shots
import os
from dotenv import load_dotenv
load_dotenv()
import urllib.parse
import pymysql

def get_few_shot_db_chain():
    db_user = "root"
    db_password = "Pavan@2005"
    db_host = "localhost"
    db_name = "atliq_tshirts"
    
    encoded_password = urllib.parse.quote_plus(db_password)
    db = SQLDatabase.from_uri(f"mysql+pymysql://{db_user}:{encoded_password}@{db_host}/{db_name}", sample_rows_in_table_info=3)
    
    llm = ChatOpenAI(
        model="llama-3.3-70b-versatile",
        api_key=os.getenv("GROQ_API_KEY"),
        base_url="https://api.groq.com/openai/v1",
        temperature=0.2
    )

    embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
    to_vectorize = [" ".join(example.values()) for example in few_shots]
    vectorstore = FAISS.from_texts(to_vectorize, embeddings, metadatas=few_shots)
    example_selector = SemanticSimilarityExampleSelector(vectorstore=vectorstore, k=2)
    
    mysql_prompt = """You are a MySQL expert. Given an input question, create a syntactically correct MySQL query.
Unless specified, query for at most 5 results using LIMIT.
Only use columns that exist in the tables.

Question: Question here
SQLQuery: SQL Query to run
"""

    example_prompt = PromptTemplate(
        input_variables=["Question", "SQLQuery", "SQLResult","Answer"],
        template="\nQuestion: {Question}\nSQLQuery: {SQLQuery}\nSQLResult: {SQLResult}\nAnswer: {Answer}",
    )

    few_shot_prompt = FewShotPromptTemplate(
        example_selector=example_selector,
        example_prompt=example_prompt,
        prefix=mysql_prompt,
        suffix="Only use the following tables:\n{table_info}\n\nQuestion: {input}\nSQLQuery:",
        input_variables=["input", "table_info"],
    )
    
    class SQLExecutionChain:
        def __init__(self):
            self.llm = llm
            self.db = db
            self.prompt = few_shot_prompt
            self.conn_params = {'host': db_host, 'user': db_user, 'password': db_password, 'database': db_name}
        
        def run(self, question):
            # Generate SQL
            prompt_text = self.prompt.format(input=question, table_info=self.db.get_table_info())
            sql_query = self.llm.invoke(prompt_text).content.strip()
            
            # Clean query
            sql_query = sql_query.replace("```sql", "").replace("```", "").strip()
            if "SQLQuery:" in sql_query:
                sql_query = sql_query.split("SQLQuery:")[1].strip()
            sql_query = sql_query.split(";")[0].strip()
            
            # Execute query
            conn = pymysql.connect(**self.conn_params)
            try:
                cursor = conn.cursor()
                cursor.execute(sql_query)
                rows = cursor.fetchall()
                column_count = len(cursor.description) if cursor.description else 0
                cursor.close()
                
                # Format results intelligently
                if not rows:
                    return "No results found."
                
                # Single value result (like COUNT, SUM, AVG, etc.)
                if len(rows) == 1 and len(rows[0]) == 1:
                    value = rows[0][0]
                    return f"**{value}**"
                
                # Multiple rows with multiple columns - detailed breakdown
                if len(rows) > 1 and column_count > 1:
                    result_lines = []
                    total_stock = 0
                    
                    # Try to extract meaningful information
                    for row in rows:
                        try:
                            # 2 columns: likely (size, stock) or (item, count)
                            if column_count == 2:
                                item = row[0]
                                value = row[1]
                                if isinstance(value, (int, float)):
                                    total_stock += value
                                    result_lines.append(f"Size {item}: {int(value)} items available")
                                else:
                                    result_lines.append(f"{item}: {value}")
                            # Full table: id, brand, color, size, price, stock_quantity (6 columns)
                            elif column_count >= 6:
                                size = row[3]
                                stock = row[5]
                                total_stock += stock if isinstance(stock, (int, float)) else 0
                                result_lines.append(f"Size {size}: {int(stock)} items available")
                            # Generic handling
                            else:
                                numeric_vals = [v for v in row if isinstance(v, (int, float))]
                                if numeric_vals:
                                    total_stock += sum(numeric_vals)
                                result_lines.append(" | ".join(map(str, row)))
                        except:
                            result_lines.append(str(row))
                    
                    formatted_output = "\n".join(result_lines)
                    if total_stock > 0:
                        formatted_output += f"\n\n**Total Stock: {int(total_stock)}**"
                    return formatted_output
                
                # Fallback: simple list
                if len(rows) <= 5:
                    return "\n".join([f"- {', '.join(map(str, row))}" for row in rows])
                else:
                    return f"Found {len(rows)} results"
            finally:
                conn.close()
        
        def invoke(self, inputs):
            q = inputs.get("query") or inputs.get("question") or inputs
            return {"result": self.run(q)}
    
    return SQLExecutionChain()
