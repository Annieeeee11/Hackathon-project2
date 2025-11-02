from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List
import uvicorn
import os

app = FastAPI()

class ProcessRequest(BaseModel):
    input: Any
    pipeline: str = None

class QueryRequest(BaseModel):
    query: str
    context: Dict[str, Any] = None
    parameters: Dict[str, Any] = None

@app.post("/process")
async def process_data(request: ProcessRequest):
    """Process data - returns mock results"""
    try:
        print(f"Received process request: {len(str(request.input))} chars")
        
        
        if isinstance(request.input, list):
            result = {
                "processed": len(request.input),
                "message": "Data processed successfully (mock)",
                "sample": request.input[0] if request.input else None,
                "total_items": len(request.input)
            }
        else:
            result = {
                "processed": 1,
                "message": "Data processed successfully (mock)",
                "input_type": str(type(request.input).__name__)
            }
        
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.post("/query")
async def query_data(request: QueryRequest):
    """Query endpoint - returns mock results"""
    try:
        print(f"Received query: {request.query}")
        
        # Mock query response
        result = {
            "query": request.query,
            "response": f"Mock response for query: {request.query}",
            "context": request.context or {},
            "status": "success"
        }
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "pathway-mock",
        "message": "Service is running (mock mode - Pathway not installed)"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Pathway Service (Mock Mode)",
        "endpoints": {
            "POST /process": "Process data",
            "POST /query": "Query data",
            "GET /health": "Health check"
        }
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"\n Starting Pathway service (mock mode) on http://localhost:{port}")
    print(f" Available endpoints:")
    print(f"    GET  http://localhost:{port}/health")
    print(f"    POST http://localhost:{port}/process")
    print(f"    POST http://localhost:{port}/query")
    print(f"\n This is a mock service. Install Pathway to use real processing.\n")
    uvicorn.run(app, host="0.0.0.0", port=port)

