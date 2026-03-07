# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "langchain>=0.2.0,<0.3.0",
#     "langchain-google-genai>=1.0.0,<2.0.0",
#     "langchain-groq>=0.1.0,<0.2.0",
#     "langchain-community>=0.2.0,<0.3.0",
#     "langchain-text-splitters>=0.2.0,<0.3.0",
#     "faiss-cpu>=1.8.0",
#     "pypdf>=4.2.0",
#     "tavily-python>=0.3.3",
#     "arxiv>=2.1.0",
# ]
# ///

import sys
import json
import os
from typing import List, Dict, Any

from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_groq import ChatGroq
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.tools import create_retriever_tool
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor


def get_llm():
    gemini_api_key = os.environ.get("GOOGLE_API_KEY")
    if not gemini_api_key:
        return None

    gemini = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.2,
        max_output_tokens=2000,
        google_api_key=gemini_api_key,
    )

    groq_api_key = os.environ.get("GROQ_API_KEY")
    if groq_api_key:
        groq = ChatGroq(
            api_key=groq_api_key,
            model_name="mixtral-8x7b-32768",
            temperature=0.2,
        )
        return gemini.with_fallbacks(fallbacks=[groq])

    return gemini


def process_pdfs_to_tool(files: List[Any]):
    if not files:
        return None

    try:
        try:
            from langchain_community.vectorstores import FAISS
        except Exception as e:
            sys.stderr.write(f"FAISS import failed; PDF tool disabled: {e}\n")
            return None

        all_docs = []
        for file in files:
            loader = PyPDFLoader(file['path'])
            docs = loader.load()
            all_docs.extend(docs)

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
        )
        split_docs = text_splitter.split_documents(all_docs)

        embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
        vectorstore = FAISS.from_documents(split_docs, embeddings)
        retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

        return create_retriever_tool(
            retriever,
            "pdf_document_search",
            "Searches and returns information from the uploaded PDF documents. Always use this tool first when asked about attached documents.",
        )
    except Exception as e:
        sys.stderr.write(f"Error processing PDFs: {e}\n")
        return None


def generate_system_prompt(active_addons: List[str], advanced_options: Dict[str, Any]):
    base_prompt = (
        "You are ScholarAI, an elite, highly intelligent academic research assistant. \n"
        "Your goal is to provide deeply analytical, accurate, and synthesized answers. \n"
        "Always cite your sources rigorously if querying the web or academic databases."
    )

    if active_addons:
        base_prompt += "\n\nCRITICAL INSTRUCTIONS ACTIVE (The user requires you to structure your answer according to these constraints):"
        if 'methodology' in active_addons:
            base_prompt += "\n- Methodology Focus: You MUST strictly analyze and critique the experimental designs, datasets, sample sizes, and empirical validation methods of the sources."
        if 'data' in active_addons:
            base_prompt += "\n- Data Analysis: You MUST extract specific statistical metrics (p-values, accuracy, F1 scores) and present quantifiable empirical findings prominently."
        if 'literature' in active_addons:
            base_prompt += "\n- Lit Review: You MUST synthesize the current state of the field, highlighting consensus, conflicting evidence, and chronological progression of the topic."
        if 'citations' in active_addons:
            base_prompt += "\n- Citations: You MUST map out prominent authors, institutional affiliations, and influential cited works related to the topic."

    if advanced_options and advanced_options.get('researchArea'):
        base_prompt += f"\n\nThe user's specified research domain is: {advanced_options['researchArea']}. Maintain domain-specific terminology and rigor."

    return base_prompt


def run_chat_orchestrator(query: str, active_sources: List[str], active_addons: List[str], advanced_options: Dict[str, Any], files: List[Any]):
    if not os.environ.get("GOOGLE_API_KEY"):
        return "Error: GOOGLE_API_KEY is not set on the backend. Please configure your environment to enable the ScholarAI AI Brain."

    llm = get_llm()
    if not llm:
         return "Error: Failed to initialize LLM."

    tools = []
    
    sys.stderr.write("Orchestrating tools...\n")

    if 'Internet' in active_sources and os.environ.get("TAVILY_API_KEY"):
        tools.append(TavilySearchResults(max_results=3))
        sys.stderr.write("- Added Tavily Internet Search Tool\n")

    if 'Papers' in active_sources:
        try:
            from langchain_community.utilities.arxiv import ArxivAPIWrapper
            from langchain_community.tools.arxiv.tool import ArxivQueryRun
            arxiv_tool = ArxivQueryRun(api_wrapper=ArxivAPIWrapper(top_k_results=3, doc_content_chars_max=1500))
            tools.append(arxiv_tool)
            sys.stderr.write("- Added Arxiv Academic Search Tool\n")
        except Exception as e:
            sys.stderr.write(f"Arxiv tool unavailable: {e}\n")

    if files:
        sys.stderr.write("Processing PDFs inside tool...\n")
        pdf_tool = process_pdfs_to_tool(files)
        if pdf_tool:
            tools.append(pdf_tool)
            sys.stderr.write("- Added Dynamic PDF Context Tool\n")

    if not tools:
        return "Error: No search tools were activated. Please enable 'Papers', 'Internet', or upload a PDF document."

    system_message = generate_system_prompt(active_addons, advanced_options)

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_message),
        ("human", "{input}"),
        MessagesPlaceholder("agent_scratchpad"),
    ])

    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        max_iterations=5,
    )

    sys.stderr.write("Invoking Agent Execution...\n")
    try:
        result = agent_executor.invoke({"input": query})
        return result.get("output", "No output generated.")
    except Exception as e:
        sys.stderr.write(f"Agent Execution Error: {str(e)}\n")
        return f"Agent Error: {str(e)}"

def main():
    try:
        # Read from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input provided"}))
            sys.exit(1)
            
        payload = json.loads(input_data)
        
        query = payload.get("query", "")
        active_sources = payload.get("activeSources", [])
        active_addons = payload.get("activeAddons", [])
        advanced_options = payload.get("advancedOptions", {})
        files = payload.get("files", [])
        
        response = run_chat_orchestrator(
            query=query, 
            active_sources=active_sources, 
            active_addons=active_addons, 
            advanced_options=advanced_options, 
            files=files
        )
        
        # Only stdout valid JSON response
        print(json.dumps({"response": response}))
        
    except Exception as e:
        sys.stderr.write(f"Fatal error: {e}\n")
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
