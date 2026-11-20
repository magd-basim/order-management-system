from fastapi import APIRouter, Depends, status

from app.api.v1.dependencies import get_product_service
from app.services.product import ProductService
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
)


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED
)
def create_product(
    data: ProductCreate,
    service: ProductService = Depends(get_product_service)
):
    return service.create_product(data)


@router.get(
    "",
    response_model=list[ProductResponse]
)
def get_products(
    service: ProductService = Depends(get_product_service)
):
    return service.get_products()


@router.get(
    "/{product_id}",
    response_model=ProductResponse
)
def get_product(
    product_id: int,
    service: ProductService = Depends(get_product_service)
):
    return service.get_product(product_id)


@router.patch(
    "/{product_id}",
    response_model=ProductResponse
)
def update_product(
    product_id: int,
    data: ProductUpdate,
    service: ProductService = Depends(get_product_service)
):
    return service.update_product(product_id, data)


@router.patch(
    "/{product_id}/deactivate",
    response_model=ProductResponse
)
def deactivate_product(
    product_id: int,
    service: ProductService = Depends(get_product_service)
):
    return service.deactivate_product(product_id)