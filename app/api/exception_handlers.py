from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

from app.core.exceptions import (
    BusinessError,
    ProductNotFoundError,
    OrderNotFoundError,
    DuplicateSKUError,
    DuplicateProductInOrderError,
    InactiveProductError,
    InvalidOrderStateError,
    InsufficientStockError,
)


BUSINESS_ERROR_STATUS_CODES = {
    ProductNotFoundError: 404,
    OrderNotFoundError: 404,
    DuplicateSKUError: 409,
    DuplicateProductInOrderError: 409,
    InactiveProductError: 409,
    InvalidOrderStateError: 409,
    InsufficientStockError: 409,
}


async def business_exception_handler(
    request: Request,
    exc: BusinessError,
):
    status_code = BUSINESS_ERROR_STATUS_CODES.get(
        type(exc), 400
    )

    return JSONResponse(
        status_code=status_code,
        content={"detail": str(exc)},
    )

async def unexpected_exception_handler(
    request: Request,
    exc: Exception,
):
    logger.exception(
        "Unexpected error occurred while processing request: %s %s",
        request.method,
        request.url.path,
    )

    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )

def register_exception_handlers(app):

    app.add_exception_handler(
        BusinessError,
        business_exception_handler,
    )

    app.add_exception_handler(
        Exception,
        unexpected_exception_handler,
    )