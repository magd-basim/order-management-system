from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.order import Order


class OrderRepository:

    def __init__(self, session: Session):
        self.session = session

    def create(self, order: Order) -> Order:

        self.session.add(order)

        self.session.flush()

        return order

    def get_by_id(self, order_id: int) -> Order | None:

        statement = select(Order).where(
            Order.id == order_id
        )

        return self.session.scalar(statement)

    def get_all(self) -> list[Order]:

        statement = select(Order)

        return list(self.session.scalars(statement).all())

    def get_by_id_for_update(self,order_id: int) -> Order | None:

        statement = (select(Order).where(Order.id == order_id).with_for_update())

        return self.session.scalar(statement)

    def update_status(
        self,
        order: Order,
        status: str
    ) -> Order:

        order.status = status

        self.session.flush()

        return order
    
