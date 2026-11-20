import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../api/client";
import type { Product } from "../types/product";
import type { OrderCreate } from "../types/order";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CreateOrder() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [selectedProductId, setSelectedProductId] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest<Product[]>("/products");

        if (active) {
          setProducts(data);
        }
      } catch {
        if (active) {
          setError("Failed to load products.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      active = false;
    };
  }, []);

  const availableProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.is_active && product.stock_quantity > 0
    );
  }, [products]);

  const totalAmount = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.product.price) * item.quantity,
      0
    );
  }, [cart]);

  function handleAddProduct() {
    const product = availableProducts.find(
      (item) => String(item.id) === selectedProductId
    );

    if (!product) return;

    const existingItem = cart.find(
      (item) => item.product.id === product.id
    );

    if (existingItem) {
      setError("This product is already in the order.");
      return;
    }

    setCart((currentCart) => [
      ...currentCart,
      {
        product,
        quantity: 1,
      },
    ]);

    setSelectedProductId("");
    setError("");
  }

  function handleQuantityChange(
    productId: number,
    quantity: number
  ) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: Math.max(
                1,
                Math.min(quantity, item.product.stock_quantity)
              ),
            }
          : item
      )
    );
  }

  function handleRemoveProduct(productId: number) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.product.id !== productId
      )
    );
  }

  async function handleSubmitOrder() {
    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (!customerEmail.trim()) {
      setError("Customer email is required.");
      return;
    }

    if (cart.length === 0) {
      setError("Please add at least one product.");
      return;
    }

    const orderData: OrderCreate = {
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim(),
      items: cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    };

    try {
      setSubmitting(true);
      setError("");

      await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      navigate("/orders");
    } catch {
      setError("Failed to create order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="create-order-page">
      <div className="page-header">
        <div>
          <span className="page-eyebrow">ORDERS</span>
          <h1>Create Order</h1>
          <p>Create a new customer order.</p>
        </div>

        <button
          className="secondary-button"
          onClick={() => navigate("/orders")}
        >
          Back to Orders
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <section className="order-section">
        <h2>Customer Information</h2>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="customerName">
              Customer Name
            </label>

            <input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(event) =>
                setCustomerName(event.target.value)
              }
              placeholder="Enter customer name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerEmail">
              Customer Email
            </label>

            <input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(event) =>
                setCustomerEmail(event.target.value)
              }
              placeholder="Enter customer email"
            />
          </div>
        </div>
      </section>

      <section className="order-section">
        <h2>Add Products</h2>

        {loading ? (
          <p className="empty-state">Loading products...</p>
        ) : (
          <div className="add-product-row">
            <select
              value={selectedProductId}
              onChange={(event) =>
                setSelectedProductId(event.target.value)
              }
            >
              <option value="">
                Select a product
              </option>

              {availableProducts.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name} - $
                  {Number(product.price).toFixed(2)}
                </option>
              ))}
            </select>

            <button
              className="primary-button"
              onClick={handleAddProduct}
              disabled={!selectedProductId}
            >
              Add Product
            </button>
          </div>
        )}
      </section>

      <section className="order-section">
        <h2>Order Items</h2>

        {cart.length === 0 ? (
          <p className="empty-state">
            No products added yet.
          </p>
        ) : (
          <div className="order-items-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {cart.map((item) => (
                  <tr key={item.product.id}>
                    <td>{item.product.name}</td>

                    <td>
                      $
                      {Number(item.product.price).toFixed(2)}
                    </td>

                    <td>
                      <input
                        type="number"
                        min="1"
                        max={item.product.stock_quantity}
                        value={item.quantity}
                        onChange={(event) =>
                          handleQuantityChange(
                            item.product.id,
                            Number(event.target.value)
                          )
                        }
                        className="quantity-input"
                      />
                    </td>

                    <td>
                      $
                      {(
                        Number(item.product.price) *
                        item.quantity
                      ).toFixed(2)}
                    </td>

                    <td>
                      <button
                        className="remove-button"
                        onClick={() =>
                          handleRemoveProduct(item.product.id)
                        }
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="order-summary">
        <div>
          <span>Total Items</span>
          <strong>{cart.length}</strong>
        </div>

        <div>
          <span>Total Amount</span>
          <strong className="total-amount">
            ${totalAmount.toFixed(2)}
          </strong>
        </div>
      </div>

      <div className="order-actions">
        <button
          className="secondary-button"
          onClick={() => navigate("/orders")}
          disabled={submitting}
        >
          Cancel
        </button>

        <button
          className="primary-button"
          onClick={handleSubmitOrder}
          disabled={submitting || loading}
        >
          {submitting ? "Creating..." : "Create Order"}
        </button>
      </div>
    </div>
  );
}