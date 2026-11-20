from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class OrderItemCreate(BaseModel):

    product_id: int = Field(gt=0)

    quantity: int = Field(gt=0)


class OrderItemResponse(BaseModel):

    id: int
    product_id: int
    quantity: int
    unit_price: Decimal

    model_config = ConfigDict(from_attributes=True)