from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product


class ProductRepository:

    def __init__(self, session: Session):
        self.session = session

    def create(self, product: Product) -> Product:

        self.session.add(product)

        self.session.flush()

        return product

    def get_by_id(self, product_id: int) -> Product | None:

        statement = select(Product).where(
            Product.id == product_id
        )

        return self.session.scalar(statement)

    def get_by_sku(self, sku: str) -> Product | None:

        statement = select(Product).where(
            Product.sku == sku
        )

        return self.session.scalar(statement)

    def get_all(self) -> list[Product]:

        statement = select(Product)

        return list(self.session.scalars(statement).all())

    def update(
        self,
        product: Product,
        update_data: dict
    ) -> Product:

        for field, value in update_data.items():

            setattr(product, field, value)

        self.session.flush()

        return product

    def deactivate(self, product: Product) -> Product:

        product.is_active = False

        self.session.flush()

        return product
    
    def get_by_id_for_update(self, product_id: int) -> Product | None:

      stmt = (
        select(Product)
        .where(Product.id == product_id)
        .with_for_update()
    )

      return self.session.scalar(stmt)