import pytest
pytestmark = pytest.mark.integration

def test_create_product(client):

    payload = {
        "sku": "TEST-001",
        "name": "Test Product",
        "price": "25.00",
        "stock_quantity": 100,
    }

    response = client.post(
        "/api/v1/products",
        json=payload,
    )

    assert response.status_code == 201

    data = response.json()

    assert data["sku"] == "TEST-001"
    assert data["name"] == "Test Product"


def test_get_products(client):

    payload = {
        "sku": "TEST-002",
        "name": "Another Product",
        "price": "15.00",
        "stock_quantity": 50,
    }

    client.post(
        "/api/v1/products/",
        json=payload,
    )

    response = client.get(
        "/api/v1/products/"
    )

    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_duplicate_sku(client):

    payload = {
        "sku": "TEST-003",
        "name": "Product One",
        "price": "10.00",
        "stock_quantity": 20,
    }

    first_response = client.post(
        "/api/v1/products/",
        json=payload,
    )

    second_response = client.post(
        "/api/v1/products/",
        json=payload,
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 409


def test_product_not_found(client):

    response = client.get(
        "/api/v1/products/999999"
    )

    assert response.status_code == 404


@pytest.mark.parametrize(
    "payload",
    [
        {
            "sku": "",
            "name": "Product",
            "price": "10.00",
            "stock_quantity": 10,
        },
        {
            "sku": "INVALID-001",
            "name": "",
            "price": "10.00",
            "stock_quantity": 10,
        },
        {
            "sku": "INVALID-002",
            "name": "Product",
            "price": "-10.00",
            "stock_quantity": 10,
        },
        {
            "sku": "INVALID-003",
            "name": "Product",
            "price": "10.00",
            "stock_quantity": -1,
        },
    ],
)
def test_create_product_invalid_data(client, payload):
    response = client.post("/api/v1/products/", json=payload)

    assert response.status_code == 422