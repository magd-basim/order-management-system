from sqlalchemy import (Boolean, CheckConstraint,Integer,String,Numeric,DateTime,Text,UniqueConstraint,func)
from sqlalchemy.orm import Mapped,mapped_column,relationship
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.order_item import OrderItem

from app.database.base import Base

class Product(Base):
    __tablename__="products"
    
    __table_args__ = (
        UniqueConstraint("sku", name="uq_products_sku"),
        CheckConstraint ("price>=0", name="ck_products_price"),
        CheckConstraint("stock_quantity>=0", name="ck_products_stock_quantity"),
        )
    
    id:Mapped[int]= mapped_column(
        Integer,
        primary_key=True
    )
    
    sku:Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )
    
    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text
    )

    price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    stock_quantity: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )
    is_active:Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )
    
    created_at:Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False        
    )
    
    updated_at:Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default= func.now(),
        onupdate= func.now(),
        nullable=False
    )
    
    order_items: Mapped[list["OrderItem"]] = relationship(
        back_populates="product"
    )

