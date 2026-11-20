from fastapi import Depends
from sqlalchemy.orm import Session

from app.database.session import sessionlocal
from app.services.product import ProductService
from app.services.order import OrderService

def get_db():

    db = sessionlocal()

    try:
        yield db

    finally:
        db.close()
        
def get_product_service(
    db: Session = Depends(get_db)
) -> ProductService:

    return ProductService(db)


def get_order_service( db: Session = Depends(get_db)) -> OrderService:
    return OrderService(db)