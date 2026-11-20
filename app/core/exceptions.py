class BusinessError(Exception):
    pass


class ProductNotFoundError(BusinessError):
    pass


class OrderNotFoundError(BusinessError):
    pass


class DuplicateProductInOrderError(BusinessError):
    pass


class InactiveProductError(BusinessError):
    pass


class InvalidOrderStateError(BusinessError):
    pass


class InsufficientStockError(BusinessError):
    pass

class DuplicateSKUError(BusinessError):
    pass



