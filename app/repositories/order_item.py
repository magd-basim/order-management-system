from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.order_item import OrderItem


class OrderItemRepository:

    def __init__(self, session: Session):
        self.session = session

    def create_many(
        self,
        order_items: list[OrderItem]
    ) -> list[OrderItem]:

        self.session.add_all(order_items)

        self.session.flush()

        return order_items

    def get_by_order_id(self,order_id: int) -> list[OrderItem]:

        statement = select(OrderItem).where(
            OrderItem.order_id == order_id
        )

        return list(self.session.scalars(statement).all())