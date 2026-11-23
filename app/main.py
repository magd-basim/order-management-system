from fastapi import FastAPI
from app.core.config import settings
from app.api.v1.router import api_router
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.logging import setup_logging

from app.api.exception_handlers import register_exception_handlers

setup_logging(settings.DEBUG)

logger = logging.getLogger(__name__)
logger.info("Application starting")

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    debug=settings.DEBUG
)

app.include_router(
    api_router,
    prefix="/api/v1"
)

register_exception_handlers(app)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://order-management-system-coh.pages.dev",
    ],
    allow_origin_regex=r"^https://([a-z0-9-]+\.)?order-management-system-coh\.pages\.dev$",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)