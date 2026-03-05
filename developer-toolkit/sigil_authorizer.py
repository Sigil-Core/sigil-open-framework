import os
import re
import yaml
import requests
import json
from langchain_core.tools import tool
from pydantic import BaseModel, Field

# ============================================================================
# TEMPLATE CONFIGURATION
# ============================================================================
SIGIL_API_ENDPOINT = os.getenv("SIGIL_API_ENDPOINT", "http://localhost:3000/v1/authorize")
SIGIL_API_KEY = os.getenv("SIGIL_API_KEY", "DEV_MOCK_KEY_123")
ASSURANCE_POLICY_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "ASSURANCE.md"))

class SigilAuthInput(BaseModel):
    to_address: str = Field(description="The destination wallet or smart contract address (0x...).")
    amount: str = Field(description="The amount to send or swap, as a string.")
    token: str = Field(description="The token ticker or address (e.g., 'USDC' or 'ETH').")
    contract_method: str = Field(description="The specific smart contract method being called (e.g., 'exactInputSingle').")
    call_data: str = Field(default="0x", description="The raw hex call data for the transaction, if applicable.")

def get_deterministic_policy() -> dict:
    """Extracts and parses the YAML block from the assurance template"""
    try:
        with open(ASSURANCE_POLICY_PATH, 'r') as file:
            content = file.read()
            
        match = re.search(r'```yaml\n(.*?)\n```', content, re.DOTALL)
        if not match:
            raise ValueError("Could not locate valid 'sigil-policy' YAML block")
            
        return yaml.safe_load(match.group(1))
    except Exception as e:
        print(f"❌ Policy Extraction Failed: {e}")
        raise

@tool("request_sigil_intent_attestation", args_schema=SigilAuthInput)
def request_sigil_intent_attestation(to_address: str, amount: str, token: str, contract_method: str, call_data: str = "0x") -> str:
    """MANDATORY: Call this tool to obtain cryptographic authorization before executing ANY on-chain transaction."""
    print("🛡️ Requesting Intent Attestation for execution...")

    try:
        policy_data = get_deterministic_policy()
        
        intent_payload = {
            "agent_intent": {
                "to": to_address,
                "value": amount,
                "asset": token,
                "method": contract_method,
                "data": call_data,
            },
            "policy_constraints": policy_data.get('sigil-policy', {})
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {SIGIL_API_KEY}"
        }

        response = requests.post(SIGIL_API_ENDPOINT, json=intent_payload, headers=headers)
        result = response.json()

        if response.status_code != 200:
            return f"❌ EXECUTION BLOCKED by Sigil Engine. Reason: {result.get('rebound_reason', 'Policy Violation')}"

        print("✅ Intent Attestation Granted.")
        return json.dumps({
            "status": "AUTHORIZED",
            "attestation_id": result.get("attestation_id"),
            "signature": result.get("ed25519_signature")
        })

    except Exception as e:
         return f"❌ ERROR: {str(e)}"
