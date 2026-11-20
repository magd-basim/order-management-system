
from decimal import Decimal
import pytest
pytestmark = pytest.mark.integration

def create_test_product(
    client,
    sku,
    name,
    price,
    stock_quantity,
):

    response = client.post(
        "/api/v1/products/",
        json={
            "sku": sku,
            "name": name,
            "price": str(price),
            "stock_quantity": stock_quantity,
        },
    )

    assert response.status_code == 201

    return response.json()


def create_test_order(
    client,
    product_id,
    quantity,
):

    response = client.post(
        "/api/v1/orders/",
        json={
            "customer_name": "magd",
            "customer_email": "mgd@example.com",
            "items": [
                {
                    "product_id": product_id,
                    "quantity": quantity,
                }
            ],
        },
    )

    assert response.status_code == 201

    return response.json()


def test_create_order(client):

    product = create_test_product(
        client,
        "ORD-001",
        "Product One",
        "20.00",
        100,
    )

    order = create_test_order(
        client,
        product["id"],
        2,
    )

    assert order["customer_name"] == "magd"
    assert Decimal(str(order["total_amount"])) == Decimal("40.00")


def test_order_creation_does_not_deduct_stock(client):

    product = create_test_product(
        client,
        "ORD-002",
        "Product Two",
        "15.00",
        50,
    )

    create_test_order(
        client,
        product["id"],
        3,
    )

    response = client.get(
        f"/api/v1/products/{product['id']}"
    )

    assert response.status_code == 200

    assert response.json()["stock_quantity"] == 50


def test_confirm_order_deducts_stock(client):

    product = create_test_product(
        client,
        "ORD-003",
        "Product Three",
        "10.00",
        20,
    )

    order = create_test_order(
        client,
        product["id"],
        5,
    )

    response = client.post(
        f"/api/v1/orders/{order['id']}/confirm"
    )

    assert response.status_code == 200

    product_response = client.get(
        f"/api/v1/products/{product['id']}"
    )

    assert product_response.json()["stock_quantity"] == 15


def test_cancel_confirmed_order_restores_stock(client):

    product = create_test_product(
        client,
        "ORD-004",
        "Product Four",
        "10.00",
        30,
    )

    order = create_test_order(
        client,
        product["id"],
        5,
    )

    confirm_response = client.post(
        f"/api/v1/orders/{order['id']}/confirm"
    )

    assert confirm_response.status_code == 200

    cancel_response = client.post(
        f"/api/v1/orders/{order['id']}/cancel"
    )

    assert cancel_response.status_code == 200

    product_response = client.get(
        f"/api/v1/products/{product['id']}"
    )

    assert product_response.json()["stock_quantity"] == 30


def test_insufficient_stock(client):

    product = create_test_product(
        client,
        "ORD-005",
        "Limited Product",
        "10.00",
        2,
    )

    order = create_test_order(
        client,
        product["id"],
        5,
    )

    response = client.post(
        f"/api/v1/orders/{order['id']}/confirm"
    )

    assert response.status_code == 409

    product_response = client.get(
        f"/api/v1/products/{product['id']}"
    )

    assert product_response.json()["stock_quantity"] == 2


def test_order_confirmation_transaction_rollback(client):

    product_a = create_test_product(
        client,
        "ORD-006",
        "Product A",
        "10.00",
        20,
    )

    product_b = create_test_product(
        client,
        "ORD-007",
        "Product B",
        "15.00",
        2,
    )

    order_response = client.post(
        "/api/v1/orders/",
        json={
            "customer_name": "Ahmed",
            "customer_email": "ahmed@example.com",
            "items": [
                {
                    "product_id": product_a["id"],
                    "quantity": 5,
                },
                {
                    "product_id": product_b["id"],
                    "quantity": 5,
                },
            ],
        },
    )

    assert order_response.status_code == 201

    order = order_response.json()

    confirm_response = client.post(
        f"/api/v1/orders/{order['id']}/confirm"
    )

    assert confirm_response.status_code == 409

    product_a_response = client.get(
        f"/api/v1/products/{product_a['id']}"
    )

    product_b_response = client.get(
        f"/api/v1/products/{product_b['id']}"
    )

    assert (
        product_a_response.json()["stock_quantity"] == 20
    )

    assert (
        product_b_response.json()["stock_quantity"] == 2
    )

    order_response = client.get(
        f"/api/v1/orders/{order['id']}"
    )

    assert order_response.status_code == 200

    assert order_response.json()["status"].lower() == "pending"
    

def test_order_not_found(client):

    response = client.get(
        "/api/v1/orders/999999"
    )

    assert response.status_code == 404


def test_confirm_order_twice(client):

    product = create_test_product(
        client,
        "ORD-008",
        "Product Eight",
        "10.00",
        10,
    )

    order = create_test_order(
        client,
        product["id"],
        2,
    )

    first_response = client.post(
        f"/api/v1/orders/{order['id']}/confirm"
    )

    second_response = client.post(
        f"/api/v1/orders/{order['id']}/confirm"
    )

    assert first_response.status_code == 200
    assert second_response.status_code == 409

    product_response = client.get(
        f"/api/v1/products/{product['id']}"
    )

    assert product_response.json()["stock_quantity"] == 8


@pytest.mark.parametrize(
    "payload",
    [
        {
            "customer_name": "",
            "customer_email": "customer@example.com",
            "items": [{"product_id": 1, "quantity": 1}],
        },
        {
            "customer_name": "Ahmed",
            "customer_email": "invalid-email",
            "items": [{"product_id": 1, "quantity": 1}],
        },
        {
            "customer_name": "Ahmed",
            "customer_email": "customer@example.com",
            "items": [],
        },
        {
            "customer_name": "Ahmed",
            "customer_email": "customer@example.com",
            "items": [{"product_id": 1, "quantity": 0}],
        },
    ],
)
def test_create_order_invalid_data(client, payload):
    response = client.post("/api/v1/orders/", json=payload)

    assert response.status_code == 422