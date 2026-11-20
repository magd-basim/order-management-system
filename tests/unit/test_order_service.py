"""
from unittest.mock import MagicMock, patch

import pytest

from app.services.order import OrderService
from app.core.exceptions import OrderNotFoundError


def test_get_order_not_found():

    with patch(
        "app.services.order.OrderRepository"
    ) as repository_class:

        service = OrderService(MagicMock())

        repository = repository_class.return_value

        repository.get_by_id.return_value = None

        with pytest.raises(OrderNotFoundError):

            service.get_order(999999)
"""

from unittest.mock import MagicMock, patch

import pytest
pytestmark = pytest.mark.unit

from app.services.order import OrderService
from app.core.exceptions import OrderNotFoundError


def test_get_order_not_found():
    with patch(
        "app.services.order.OrderRepository"
    ) as repository_class:

        service = OrderService(MagicMock())

        repository = repository_class.return_value
        repository.get_by_id.return_value = None

        with pytest.raises(OrderNotFoundError):
            service.get_order(999999)

        repository.get_by_id.assert_called_once_with(999999)