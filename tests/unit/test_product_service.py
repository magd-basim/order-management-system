"""
from unittest.mock import MagicMock, patch

import pytest

from app.services.product import ProductService
from app.core.exceptions import ProductNotFoundError


def test_get_product_not_found():

    with patch(
        "app.services.product.ProductRepository"
    ) as repository_class:

        service = ProductService(MagicMock())

        repository = repository_class.return_value

        repository.get_by_id.return_value = None

        with pytest.raises(ProductNotFoundError):

            service.get_product(999999)
"""
from unittest.mock import MagicMock, patch

import pytest
pytestmark = pytest.mark.unit

from app.services.product import ProductService
from app.core.exceptions import ProductNotFoundError


def test_get_product_not_found():
    with patch(
        "app.services.product.ProductRepository"
    ) as repository_class:

        service = ProductService(MagicMock())

        repository = repository_class.return_value
        repository.get_by_id.return_value = None

        with pytest.raises(ProductNotFoundError):
            service.get_product(999999)

        repository.get_by_id.assert_called_once_with(999999)