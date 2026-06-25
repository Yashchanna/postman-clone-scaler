import httpx
import time
import json
import base64
from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from .. import models, schemas
from .variable_resolver import resolve_variables, resolve_dict
import traceback

async def execute_request(req_data: schemas.ProxyRequest, db: Session) -> schemas.ProxyResponse:
    start_time = time.time()
    
    # Get environment variables if needed
    env_vars = {}
    if req_data.environment_id:
        env = db.query(models.Environment).filter(models.Environment.id == req_data.environment_id).first()
        if env:
            for var in env.variables:
                if var.enabled:
                    env_vars[var.key] = var.value

    # Resolve variables in URL
    url = resolve_variables(req_data.url, env_vars)
    if not url.startswith(('http://', 'https://')):
        url = 'http://' + url
        
    # Process headers
    req_headers = {}
    for h in req_data.headers:
        if h.enabled and h.key.strip():
            resolved_val = resolve_variables(h.value, env_vars)
            req_headers[h.key] = resolved_val

    # Process query params
    params = {}
    for p in req_data.params:
        if p.enabled and p.key.strip():
            resolved_val = resolve_variables(p.value, env_vars)
            params[p.key] = resolved_val

    # Process Auth
    if req_data.auth_type == 'bearer' and req_data.auth.get('token'):
        token = resolve_variables(req_data.auth['token'], env_vars)
        req_headers['Authorization'] = f"Bearer {token}"
    elif req_data.auth_type == 'basic' and req_data.auth.get('username'):
        username = resolve_variables(req_data.auth['username'], env_vars)
        password = resolve_variables(req_data.auth.get('password', ''), env_vars)
        auth_str = f"{username}:{password}"
        b64_auth = base64.b64encode(auth_str.encode()).decode()
        req_headers['Authorization'] = f"Basic {b64_auth}"

    # Process Body
    req_body = None
    if req_data.method.upper() not in ['GET', 'HEAD', 'OPTIONS'] and req_data.body_type != 'none':
        if req_data.body_type == 'raw':
            req_body = resolve_variables(req_data.body, env_vars)
        elif req_data.body_type in ['form-data', 'x-www-form-urlencoded']:
            # Assuming body is a list of KeyValue dicts for forms
            try:
                body_items = json.loads(req_data.body) if isinstance(req_data.body, str) else req_data.body
                req_body = {}
                for item in body_items:
                    if item.get('enabled') and item.get('key'):
                        req_body[item['key']] = resolve_variables(item.get('value', ''), env_vars)
            except Exception:
                pass

    try:
        async with httpx.AsyncClient(verify=False, timeout=30.0) as client:
            # Prepare kwargs
            kwargs = {
                "method": req_data.method.upper(),
                "url": url,
                "headers": req_headers,
                "params": params,
            }
            
            if req_body is not None:
                if req_data.body_type == 'raw':
                    kwargs['content'] = req_body
                elif req_data.body_type == 'form-data':
                    # Simplistic form-data handling without files
                    kwargs['data'] = req_body
                elif req_data.body_type == 'x-www-form-urlencoded':
                    kwargs['data'] = req_body
                    if 'Content-Type' not in [k.lower() for k in req_headers.keys()]:
                        kwargs['headers']['Content-Type'] = 'application/x-www-form-urlencoded'

            response = await client.request(**kwargs)
            
            time_ms = int((time.time() - start_time) * 1000)
            content = response.content
            size_bytes = len(content)
            
            resp_headers = [schemas.KeyValue(key=k, value=v, enabled=True) for k, v in response.headers.items()]
            
            try:
                # Try to parse as JSON for pretty printing
                resp_body = response.json()
                body_type = "json"
            except Exception:
                # Fallback to text
                resp_body = response.text
                body_type = "text"
                
            # Log to history
            history = models.History(
                method=req_data.method,
                url=url,
                request_headers=json.dumps([h.model_dump() for h in req_data.headers]),
                request_body=json.dumps(req_data.body) if not isinstance(req_data.body, str) else req_data.body,
                body_type=req_data.body_type,
                status_code=response.status_code,
                response_headers=json.dumps([h.model_dump() for h in resp_headers]),
                response_body=json.dumps(resp_body) if body_type == "json" else resp_body,
                response_time_ms=time_ms,
                response_size_bytes=size_bytes
            )
            db.add(history)
            db.commit()

            return schemas.ProxyResponse(
                status_code=response.status_code,
                headers=resp_headers,
                body=resp_body,
                time_ms=time_ms,
                size_bytes=size_bytes,
                is_error=False
            )
            
    except httpx.RequestError as exc:
        time_ms = int((time.time() - start_time) * 1000)
        error_msg = f"Request error: {str(exc)}"
        
        # Log failed request to history too
        history = models.History(
            method=req_data.method,
            url=url,
            status_code=0,
            response_body=error_msg,
            response_time_ms=time_ms,
            response_size_bytes=0
        )
        db.add(history)
        db.commit()
        
        return schemas.ProxyResponse(
            status_code=0,
            headers=[],
            body=None,
            time_ms=time_ms,
            size_bytes=0,
            is_error=True,
            error_message=error_msg
        )
