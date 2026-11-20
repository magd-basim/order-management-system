from sqlalchemy import String,Integer,CheckConstraint,Numeric,func,DateTime
from sqlalchemy.orm import mapped_column,Mapped,relationship
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.order_item import OrderItem

from app.database.base import Base

class Order(Base):
    __tablename__="orders"
    __table_args__=(
        CheckConstraint("total_amount>=0",name="ck_orders_total_amount"),   
    )
    
    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    customer_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    customer_email: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        nullable=False
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=0,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    
    order_items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
        passive_deletes=True
    )