import re
from typing import Dict, Any

def resolve_variables(text: str, variables: Dict[str, str]) -> str:
    if not text or not isinstance(text, str):
        return text
    
    def replace_match(match):
        var_name = match.group(1)
        return variables.get(var_name, match.group(0))

    # Matches {{variable_name}}
    pattern = re.compile(r'\{\{(.*?)\}\}')
    return pattern.sub(replace_match, text)

def resolve_dict(data: Dict[str, Any], variables: Dict[str, str]) -> Dict[str, Any]:
    resolved = {}
    for k, v in data.items():
        if isinstance(v, str):
            resolved[k] = resolve_variables(v, variables)
        elif isinstance(v, dict):
            resolved[k] = resolve_dict(v, variables)
        elif isinstance(v, list):
            resolved[k] = [resolve_variables(item, variables) if isinstance(item, str) else item for item in v]
        else:
            resolved[k] = v
    return resolved
