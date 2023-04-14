import os
from pathlib import Path

from pydantic import Field, BaseSettings

class Config(BaseSettings):
    secret_key: str = Field(..., env="SECRET_KEY")
    ip_address: str = Field(..., env="IP_ADDRESS")
    port: int = Field(..., env="PORT")
    
    project_name = "Stress-Free Chat"
    version = "1.0.0"
    
    class Config:
        env_prefix = ""
        case_sensitive = True
        env_file = Path(os.getcwd()) / ".env"
        
config = Config()