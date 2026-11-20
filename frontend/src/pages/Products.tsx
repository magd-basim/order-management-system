
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  Search,
  Plus,
  Pencil,
  Ban,
  Package,
  Boxes,
  AlertTriangle,
  RefreshCw,
  X,
} from "lucide-react";

import { apiRequest } from "../api/client";

import type {
  Product,
  ProductCreate,
  ProductUpdate,
} from "../types/product";

type StatusFilter = "all" | "active" | "inactive";
type StockFilter = "all" | "available" | "low" | "out";

const LOW_STOCK_LIMIT = 5;

const initialForm = {
  sku: "",
  name: "",
  description: "",
  price: "",
  stock_quantity: "0",
};

function Products() {
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [stockFilter, setStockFilter] =
    useState<StockFilter>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [form, setForm] = useState(initialForm);

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<Product[]>("/products");

      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Products Statistics
  const activeCount = products.filter(
    (product) => product.is_active
  ).length;

  

  const lowStockCount = products.filter(
    (product) =>
      product.stock_quantity > 0 &&
      product.stock_quantity <= LOW_STOCK_LIMIT
  ).length;

  const outOfStockCount = products.filter(
    (product) => product.stock_quantity === 0
  ).length;

  // Search and Filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        product.name.toLowerCase().includes(searchValue) ||
        product.sku.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.is_active) ||
        (statusFilter === "inactive" && !product.is_active);

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "available" &&
          product.stock_quantity > LOW_STOCK_LIMIT) ||
        (stockFilter === "low" &&
          product.stock_quantity > 0 &&
          product.stock_quantity <= LOW_STOCK_LIMIT) ||
        (stockFilter === "out" &&
          product.stock_quantity === 0);

      return matchesSearch && matchesStatus && matchesStock;
    });
  }, [products, search, statusFilter, stockFilter]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (product: Product) => {
    setEditingProduct(product);

    setForm({
      sku: product.sku,
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      stock_quantity: String(product.stock_quantity),
    });

    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingProduct(null);
    setForm(initialForm);
  };

  // Handle Form Submission
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload: ProductCreate = {
        sku: form.sku.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity),
      };

      if (editingProduct) {
        const updatePayload: ProductUpdate = payload;

        await apiRequest<Product>(
          `/products/${editingProduct.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(updatePayload),
          }
        );

        setSuccess("Product updated successfully.");
      } else {
        await apiRequest<Product>("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setSuccess("Product created successfully.");
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      setForm(initialForm);

      await fetchProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  // Deactivate Product
  const handleDeactivate = async (product: Product) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await apiRequest<Product>(
        `/products/${product.id}/deactivate`,
        {
          method: "PATCH",
        }
      );

      setSuccess("Product deactivated successfully.");

      await fetchProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to deactivate product."
      );
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return {
        label: "Out of stock",
        className: "stock-out",
      };
    }

    if (quantity <= LOW_STOCK_LIMIT) {
      return {
        label: "Low stock",
        className: "stock-low",
      };
    }

    return {
      label: "In stock",
      className: "stock-available",
    };
  };

  return (
    <div className="products-page">

      {/* Page Header */}
      <div className="page-header">
        <div>
          <span className="page-eyebrow">
            INVENTORY MANAGEMENT
          </span>

          <h1>Products</h1>

          <p>
            Manage your products, prices and inventory.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
          <button onClick={() => setSuccess("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="products-stats">

        <div className="product-stat-card">
          <div className="product-stat-icon purple">
            <Package size={21} />
          </div>

          <div>
            <span>Total Products</span>
            <h3>{products.length}</h3>
          </div>
        </div>

        <div className="product-stat-card">
          <div className="product-stat-icon green">
            <Boxes size={21} />
          </div>

          <div>
            <span>Active Products</span>
            <h3>{activeCount}</h3>
          </div>
        </div>

        <div className="product-stat-card">
          <div className="product-stat-icon orange">
            <AlertTriangle size={21} />
          </div>

          <div>
            <span>Low Stock</span>
            <h3>{lowStockCount}</h3>
          </div>
        </div>

        <div className="product-stat-card">
          <div className="product-stat-icon red">
            <Package size={21} />
          </div>

          <div>
            <span>Out of Stock</span>
            <h3>{outOfStockCount}</h3>
          </div>
        </div>

      </div>

      {/* Products Table Section */}
      <div className="products-container">

        <div className="products-toolbar">

          <div className="products-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="products-filters">

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as StatusFilter
                )
              }
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={stockFilter}
              onChange={(event) =>
                setStockFilter(
                  event.target.value as StockFilter
                )
              }
            >
              <option value="all">All Stock</option>
              <option value="available">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>

            <button
              className="refresh-button"
              onClick={fetchProducts}
              title="Refresh products"
            >
              <RefreshCw size={17} />
            </button>

          </div>
        </div>

        {/* Table Header */}
        <div className="products-table-header">
          <div>
            <h2>All Products</h2>
            <span>
              {filteredProducts.length} products found
            </span>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="products-state">
            <RefreshCw className="loading-icon" size={28} />
            <p>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (

          /* Empty State */
          <div className="products-state">
            <Package size={38} />
            <h3>No products found</h3>
            <p>
              Try changing your search or filters.
            </p>
          </div>

        ) : (

          /* Products Table */
          <div className="products-table-wrapper">
            <table className="products-table">

              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Stock Status</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(
                    product.stock_quantity
                  );

                  return (
                    <tr key={product.id}>

                      <td>
                        <div className="product-name-cell">
                          <div className="product-avatar">
                            <Package size={19} />
                          </div>

                          <div>
                            <strong>{product.name}</strong>
                            <span>#{product.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="product-sku">
                          {product.sku}
                        </span>
                      </td>

                      <td className="product-price">
                        ${Number(product.price).toFixed(2)}
                      </td>

                      <td>
                        <strong>
                          {product.stock_quantity}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${stockStatus.className}`}
                        >
                          {stockStatus.label}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            product.is_active
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          {product.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div className="product-actions">

                          <button
                            className="action-button edit-action"
                            title="Edit product"
                            onClick={() =>
                              openEditModal(product)
                            }
                          >
                            <Pencil size={16} />
                          </button>

                          {product.is_active && (
                            <button
                              className="action-button deactivate-action"
                              title="Deactivate product"
                              onClick={() =>
                                handleDeactivate(product)
                              }
                            >
                              <Ban size={16} />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        )}

      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div
          className="product-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="product-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="product-modal-header">
              <div>
                <h2>
                  {editingProduct
                    ? "Edit Product"
                    : "Add New Product"}
                </h2>

                <p>
                  Enter the product information below.
                </p>
              </div>

              <button
                className="modal-close-button"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="product-form-grid">

                <div className="form-field">
                  <label>Product Name</label>

                  <input
                    type="text"
                    required
                    maxLength={150}
                    placeholder="Enter product name"
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>SKU</label>

                  <input
                    type="text"
                    required
                    maxLength={50}
                    placeholder="e.g. PRD-001"
                    value={form.sku}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        sku: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Price ($)</label>

                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        price: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Stock Quantity</label>

                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={form.stock_quantity}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        stock_quantity: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-field full-width">
                  <label>Description</label>

                  <textarea
                    rows={4}
                    placeholder="Enter product description..."
                    value={form.description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description: event.target.value,
                      })
                    }
                  />
                </div>

              </div>

              <div className="product-modal-footer">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingProduct
                      ? "Save Changes"
                      : "Create Product"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Products;
