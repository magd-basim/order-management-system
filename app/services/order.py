
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.exceptions import (
    ProductNotFoundError,
    OrderNotFoundError,
    DuplicateProductInOrderError,
    InactiveProductError,
    InvalidOrderStateError,
    InsufficientStockError,
)

from app.models.order import Order
from app.models.order_item import OrderItem

from app.repositories.order import OrderRepository
from app.repositories.order_item import OrderItemRepository
from app.repositories.product import ProductRepository

from app.schemas.order import OrderCreate


class OrderService:

    def __init__(self, session: Session):

        self.session = session

        self.order_repository = OrderRepository(session)
        self.order_item_repository = OrderItemRepository(session)
        self.product_repository = ProductRepository(session)

    def create_order(self, data: OrderCreate) -> Order:

        product_ids = [item.product_id for item in data.items]

        if len(product_ids) != len(set(product_ids)):
            raise DuplicateProductInOrderError(
                "Duplicate products are not allowed"
            )

        order_items = []
        total_amount = Decimal("0.00")

        for item_data in data.items:

            product = self.product_repository.get_by_id(
                item_data.product_id
            )

            if product is None:
                raise ProductNotFoundError(
                    f"Product {item_data.product_id} not found"
                )

            if not product.is_active:
                raise InactiveProductError(
                    f"Product {product.id} is not active"
                )

            unit_price = product.price

            order_item = OrderItem(
                product_id=product.id,
                quantity=item_data.quantity,
                unit_price=unit_price
            )

            order_items.append(order_item)

            total_amount += unit_price * item_data.quantity

        order = Order(
            customer_name=data.customer_name,
            customer_email=data.customer_email,
            status="pending",
            total_amount=total_amount
        )

        try:

            self.order_repository.create(order)

            for order_item in order_items:
                order_item.order_id = order.id

            self.order_item_repository.create_many(order_items)

            self.session.commit()

            return order

        except Exception:
            self.session.rollback()
            raise

    def get_order(self, order_id: int) -> Order:

        order = self.order_repository.get_by_id(order_id)

        if order is None:
            raise OrderNotFoundError("Order not found")

        return order

    def get_orders(self) -> list[Order]:

        return self.order_repository.get_all()

    def confirm_order(self, order_id: int) -> Order:

        try:

            order = self.order_repository.get_by_id_for_update(order_id)

            if order is None:
                raise OrderNotFoundError(
                    f"Order {order_id} not found"
                )

            if order.status != "pending":
                raise InvalidOrderStateError(
                    f"Cannot confirm order with status: {order.status}"
                )

            order_items = self.order_item_repository.get_by_order_id(
                order.id
            )

            product_ids = sorted({ item.product_id for item in order_items})

            products = {}

            for product_id in product_ids:

                product = self.product_repository.get_by_id_for_update(
                    product_id
                )

                if product is None:
                    raise ProductNotFoundError(
                        f"Product {product_id} not found"
                    )

                products[product_id] = product

            for item in order_items:

                product = products[item.product_id]

                if product.stock_quantity < item.quantity:
                    raise InsufficientStockError(
                        f"Product {product.id}: "
                        f"available {product.stock_quantity}, "
                        f"requested {item.quantity}"
                    )

            for item in order_items:

                product = products[item.product_id]

                product.stock_quantity -= item.quantity

            self.order_repository.update_status(
                order,
                "confirmed"
            )

            self.session.commit()

            return order

        except Exception:

            self.session.rollback()
            raise

    def cancel_order(self, order_id: int) -> Order:

        try:

            order = self.order_repository.get_by_id_for_update(order_id)

            if order is None:
                raise OrderNotFoundError(
                    f"Order {order_id} not found"
                )

            if order.status not in ("pending", "confirmed"):
                raise InvalidOrderStateError(
                    f"Cannot cancel order with status: {order.status}"
                )

            order_items = self.order_item_repository.get_by_order_id(
                order.id
            )

            if order.status == "confirmed":

                product_ids = sorted({
                    item.product_id for item in order_items
                })

                products = {}

                for product_id in product_ids:

                    product = self.product_repository.get_by_id_for_update(
                        product_id
                    )

                    if product is None:
                        raise ProductNotFoundError(
                            f"Product {product_id} not found"
                        )

                    products[product_id] = product

                for item in order_items:

                    product = products[item.product_id]

                    product.stock_quantity += item.quantity

            self.order_repository.update_status(
                order,
                "cancelled"
            )

            self.session.commit()

            return order

        except Exception:

            self.session.rollback()
            raise
