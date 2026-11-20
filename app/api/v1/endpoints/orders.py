from fastapi import APIRouter, Depends, status

from app.api.v1.dependencies import get_order_service
from app.services.order import OrderService
from app.schemas.order import OrderCreate, OrderResponse


router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED
)
def create_order(
    data: OrderCreate,
    service: OrderService = Depends(get_order_service)
):
    return service.create_order(data)


@router.get(
    "",
    response_model=list[OrderResponse]
)
def get_orders(
    service: OrderService = Depends(get_order_service)
):
    return service.get_orders()


@router.get(
    "/{order_id}",
    response_model=OrderResponse
)
def get_order(
    order_id: int,
    service: OrderService = Depends(get_order_service)
):
    return service.get_order(order_id)

@router.post(
    "/{order_id}/confirm",
    response_model=OrderResponse
)
def confirm_order(
    order_id: int,
    service: OrderService = Depends(get_order_service)
):
    return service.confirm_order(order_id)


@router.post(
    "/{order_id}/cancel",
    response_model=OrderResponse
)
def cancel_order(
    order_id: int,
    service: OrderService = Depends(get_order_service)
):
    return service.cancel_order(order_id)

