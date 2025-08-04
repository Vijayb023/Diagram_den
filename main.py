from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv
import os, json, re

# Load environment variables
load_dotenv()
client = OpenAI()

app = FastAPI()

# Enable CORS for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Models -----

class DiagramPrompt(BaseModel):
    prompt: str

class DiagramData(BaseModel):
    nodes: list
    links: list
    question: str | None = None

# ----- Routes -----

@app.post("/generate-diagram")
async def generate_diagram(data: DiagramPrompt):
    try:
        user_prompt = f"""
Design a modern, cloud-native, and scalable system for the following request:

\"{data.prompt}\"

Include realistic components:
- Modular microservices
- REST/GraphQL APIs
- Kafka or SQS for messaging
- Event queues or topics
- API Gateway / Load Balancer
- Auth mechanisms (OAuth, JWT, etc.)
- Observability (Prometheus, ELK, CloudWatch)
- Admin/Monitoring dashboards
- External integrations (Payment, Identity)
- SQL / NoSQL databases
- Storage layers (S3, GCS)

Return ONLY valid JSON in this format:
{{
  "nodes": [{{ "key": "...", "category": "actor|service|api|database|queue|monitoring|external" }}],
  "links": [{{ "from": "...", "to": "..." }}]
}}

Ensure services interact with one another and data flows make logical sense.
"""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a backend architect generating system diagrams for GoJS visualization. "
                        "Use valid JSON format. Ensure all components have correct categories such as: "
                        "'actor', 'service', 'api', 'database', 'queue', 'monitoring', 'external'. "
                        "Represent inter-service communication and follow modern architecture principles."
                    )
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],
            temperature=0.3,
        )

        message = response.choices[0].message.content.strip()
        print("Model raw output:\n", message)

        # Extract JSON object
        json_match = re.search(r"\{[\s\S]*\}", message)
        if not json_match:
            return {"error": "Unable to extract JSON from model output.", "raw": message}

        parsed_json = json.loads(json_match.group(0))
        return parsed_json

    except Exception as e:
        print("OpenAI API Error:", str(e))
        return {"error": str(e)}


@app.post("/analyze-diagram")
async def analyze_diagram(data: DiagramData):
    prompt = (
        "You are a cloud architecture expert. Review the system diagram defined below:\n"
        f"Nodes: {json.dumps(data.nodes, indent=2)}\n"
        f"Links: {json.dumps(data.links, indent=2)}\n\n"
    )

    if data.question:
        prompt += f"Answer this question: {data.question}"
    else:
        prompt += "Provide a detailed analysis with pros and cons, and suggest potential improvements."

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
        )

        return {"analysis": response.choices[0].message.content.strip()}

    except Exception as e:
        print("Analysis Error:", str(e))
        return {"error": str(e)}
