import pathway as pw
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
    try:
        if isinstance(request.input, list):
            input_data = request.input
            input_table = pw.debug.table_from_dict(input_data)
            
            result_table = input_table.select(
                total_amount=pw.this.get("value", 0) if isinstance(pw.this, dict) else 0
            )
            
            pw.run()
            
            results = {
                "processed": len(input_data),
                "data": input_data
            }
            
            return {"result": results}
        else:
            return {"result": {"processed": request.input}}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.post("/query")
async def query_data(request: QueryRequest):
    try:
        result = {
            "query": request.query,
            "response": f"Processed query: {request.query}",
            "context": request.context or {}
        }
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query error: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "pathway"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"Starting Pathway service on http://localhost:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)

