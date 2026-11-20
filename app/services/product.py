from sqlalchemy.orm import Session

from app.core.exceptions import (
    BusinessError,
    DuplicateSKUError,
    ProductNotFoundError,
)
from app.models.product import Product
from app.repositories.product import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:

    def __init__(self, session: Session):
        self.session = session
        self.repository = ProductRepository(session)

    def create_product(self, data: ProductCreate) -> Product:

        existing_product = self.repository.get_by_sku(data.sku)

        if existing_product:
            raise DuplicateSKUError(
                f"Product with SKU '{data.sku}' already exists"
            )

        product = Product(**data.model_dump())

        try:
            self.repository.create(product)
            self.session.commit()

            return product

        except Exception:
            self.session.rollback()
            raise

    def get_product(self, product_id: int) -> Product:

        product = self.repository.get_by_id(product_id)

        if product is None:
            raise ProductNotFoundError(
                f"Product {product_id} not found"
            )

        return product

    def get_products(self) -> list[Product]:

        return self.repository.get_all()

    def update_product(self, product_id: int, data: ProductUpdate) -> Product:

        product = self.get_product(product_id)

        update_data = data.model_dump(exclude_unset=True)

        if not update_data:
            return product

        non_nullable_fields = {
            "sku",
            "name",
            "price",
            "stock_quantity",
            "is_active"
        }

        for field, value in update_data.items():

            if field in non_nullable_fields and value is None:
                raise BusinessError(
                    f"{field} cannot be None"
                )

        new_sku = update_data.get("sku")

        if new_sku is not None and new_sku != product.sku:

            existing_product = self.repository.get_by_sku(new_sku)

            if existing_product:
                raise DuplicateSKUError(
                    f"Product with SKU '{new_sku}' already exists"
                )

        try:
            self.repository.update(product, update_data)
            self.session.commit()

            return product

        except Exception:
            self.session.rollback()
            raise

    def deactivate_product(self, product_id: int) -> Product:

        product = self.get_product(product_id)

        try:
            self.repository.deactivate(product)
            self.session.commit()

            return product

        except Exception:
            self.session.rollback()
            raise