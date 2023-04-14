import sys
from pathlib import Path

sys.path.append(str(Path.cwd() / "backend"))

import fastapi
import uvicorn  # type: ignore

from app.api import routes  # type: ignore
from app.core import config  # type: ignore


def get_application():
    app = fastapi.FastAPI()

    # app.add_event_handler("shutdown", postgres.close_dbs_handler)  # type: ignore
    app.include_router(routes.router)

    return app


app = get_application()

if __name__ == "__main__":
    uvicorn.run(  # type: ignore
        app,
        host=config.config.web_service_ip_address,
        port=config.config.web_service_port,
    )
    uvicorn.run(app, host="172.20.10.2", port=config.config.web_service_port)  # type: ignore
