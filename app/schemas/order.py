from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field
from pydantic import EmailStr
from app.schemas.order_item import OrderItemCreate, OrderItemResponse


class OrderCreate(BaseModel):

    customer_name: str = Field(min_length=1, max_length=150)

    customer_email: EmailStr 

    items: list[OrderItemCreate] = Field(min_length=1)


class OrderResponse(BaseModel):

    id: int
    customer_name: str
    customer_email: EmailStr
    status: str
    total_amount: Decimal
    created_at: datetime
    updated_at: datetime
    order_items: list[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)


class OrderListResponse(BaseModel):

    orders: list[OrderResponse]