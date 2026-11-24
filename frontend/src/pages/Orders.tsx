
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Search,
  Plus,
  Eye,
  X,
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  AlertCircle,
  User,
  Mail,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

import { apiRequest } from "../api/client";

import type { Product } from "../types/product";

import type {
  Order,
  OrderCreate,
} from "../types/order";


type OrderFilter = "ALL" | "PENDING" | "CONFIRMED" | "CANCELLED";

interface OrderItemDraft {
  product_id: string;
  quantity: number;
}


// --------------------------------------------------
// Helper Functions
// --------------------------------------------------

function normalizeStatus(status: string): string {
  const normalized = status.trim().toUpperCase();

  return normalized === "CANCELED"
    ? "CANCELLED"
    : normalized;
}

function formatMoney(value: number | string): string {
  return Number(value).toFixed(2);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

function getStatusLabel(status: string): string {
  const normalized = normalizeStatus(status);

  return normalized.charAt(0) + normalized.slice(1).toLowerCase();
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}


// --------------------------------------------------
// Orders Page
// --------------------------------------------------

function Orders() {

  // Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search and Filter
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<OrderFilter>("ALL");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Create Order Form
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [draftItems, setDraftItems] = useState<OrderItemDraft[]>([
    { product_id: "", quantity: 1 },
  ]);


  // --------------------------------------------------
  // Fetch Orders
  // --------------------------------------------------

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await apiRequest<Order[]>("/orders");

      setOrders(data);

    } catch (err) {
      setError(getErrorMessage(err));

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);


  // --------------------------------------------------
  // Fetch Products
  // --------------------------------------------------

  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true);

      const data = await apiRequest<Product[]>("/products");

      setProducts(data);

    } catch (err) {
      setError(getErrorMessage(err));

    } finally {
      setProductsLoading(false);
    }
  }, []);


  // Initial Data Loading
  useEffect(() => {
    void fetchOrders();
    void fetchProducts();
  }, [fetchOrders, fetchProducts]);


  // --------------------------------------------------
  // Available Products
  // --------------------------------------------------

  const activeProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.is_active &&
        product.stock_quantity > 0
    );
  }, [products]);


  // --------------------------------------------------
  // Search and Filter
  // --------------------------------------------------

  const filteredOrders = useMemo(() => {

    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {

      const matchesSearch =
        normalizedSearch === "" ||
        String(order.id).includes(normalizedSearch) ||
        order.customer_name.toLowerCase().includes(normalizedSearch) ||
        order.customer_email.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        filter === "ALL" ||
        normalizeStatus(order.status) === normalizeStatus(filter);

      return matchesSearch && matchesStatus;
    });

  }, [orders, search, filter]);


  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------

  const statistics = useMemo(() => {

    return {
      total: orders.length,

      pending: orders.filter(
        (order) => normalizeStatus(order.status) === "PENDING"
      ).length,

      confirmed: orders.filter(
        (order) => normalizeStatus(order.status) === "CONFIRMED"
      ).length,

      cancelled: orders.filter(
        (order) => normalizeStatus(order.status) === "CANCELLED"
      ).length,
    };

  }, [orders]);


  // --------------------------------------------------
  // Create Order Calculations
  // --------------------------------------------------

  const selectedProducts = draftItems
    .map((item) => Number(item.product_id))
    .filter((id) => id > 0);


  const estimatedTotal = draftItems.reduce((total, item) => {

    const product = products.find(
      (current) => current.id === Number(item.product_id)
    );

    if (!product) {
      return total;
    }

    return total + Number(product.price) * item.quantity;

  }, 0);


  // --------------------------------------------------
  // Create Order Form Functions
  // --------------------------------------------------

  function resetCreateForm() {
    setCustomerName("");
    setCustomerEmail("");

    setDraftItems([
      { product_id: "", quantity: 1 },
    ]);
  }


  function openCreateModal() {
    setError("");
    setSuccess("");

    resetCreateForm();

    setShowCreateModal(true);
  }


  function closeCreateModal() {
    if (submitting) return;

    setShowCreateModal(false);

    resetCreateForm();
  }


  function addItemRow() {
    setDraftItems((current) => [
      ...current,
      { product_id: "", quantity: 1 },
    ]);
  }


  function removeItemRow(index: number) {
    setDraftItems((current) =>
      current.length === 1
        ? current
        : current.filter(
            (_, itemIndex) => itemIndex !== index
          )
    );
  }


  function updateItem(
    index: number,
    field: keyof OrderItemDraft,
    value: string | number
  ) {
    setDraftItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );
  }


  // --------------------------------------------------
  // Submit Create Order
  // --------------------------------------------------

  async function handleCreateOrder(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");
    setSuccess("");


    // Validate Customer Information

    if (!customerName.trim() || !customerEmail.trim()) {
      setError("Customer name and email are required.");
      return;
    }


    // Validate Order Items

    if (draftItems.some((item) => !item.product_id)) {
      setError("Please select a product for every item.");
      return;
    }


    // Prevent Duplicate Products

    const productIds = draftItems.map(
      (item) => Number(item.product_id)
    );

    if (new Set(productIds).size !== productIds.length) {
      setError("Each product can only be added once to an order.");
      return;
    }


    // Validate Quantities

    for (const item of draftItems) {

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        setError("Every item quantity must be at least 1.");
        return;
      }

      const product = products.find(
        (current) => current.id === Number(item.product_id)
      );

      if (!product) {
        setError("One of the selected products was not found.");
        return;
      }

      if (item.quantity > product.stock_quantity) {
        setError(
          `Insufficient stock for ${product.name}. Available stock: ${product.stock_quantity}.`
        );
        return;
      }
    }


    // Prepare Request Body

    const payload: OrderCreate = {
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim(),

      items: draftItems.map((item) => ({
        product_id: Number(item.product_id),
        quantity: item.quantity,
      })),
    };


    // Send Request

    try {
      setSubmitting(true);

      await apiRequest<Order>("/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setShowCreateModal(false);

      resetCreateForm();

      setSuccess("Order created successfully.");

      await fetchOrders(true);

      await fetchProducts();

    } catch (err) {
      setError(getErrorMessage(err));

    } finally {
      setSubmitting(false);
    }
  }


  // --------------------------------------------------
  // Order Details
  // --------------------------------------------------

  async function openOrderDetails(orderId: number) {

    try {
      setError("");

      setDetailsLoading(true);

      setSelectedOrder(null);

      const data = await apiRequest<Order>(
        `/orders/${orderId}`
      );

      setSelectedOrder(data);

    } catch (err) {
      setError(getErrorMessage(err));

    } finally {
      setDetailsLoading(false);
    }
  }


  function closeOrderDetails() {
    if (actionLoading) return;

    setSelectedOrder(null);
  }


  // --------------------------------------------------
  // Confirm / Cancel Order
  // --------------------------------------------------

  async function handleOrderAction(
    orderId: number,
    action: "confirm" | "cancel"
  ) {

    const confirmationMessage =
      action === "confirm"
        ? "Are you sure you want to confirm this order?"
        : "Are you sure you want to cancel this order?";


    if (!window.confirm(confirmationMessage)) {
      return;
    }


    try {
      setActionLoading(true);

      setError("");
      setSuccess("");


      const updatedOrder = await apiRequest<Order>(
        `/orders/${orderId}/${action}`,
        {
          method: "POST",
        }
      );


      setSelectedOrder(updatedOrder);


      setSuccess(
        action === "confirm"
          ? "Order confirmed successfully."
          : "Order cancelled successfully."
      );


      // Refresh Orders and Products

      await fetchOrders(true);

      await fetchProducts();


    } catch (err) {

      setError(getErrorMessage(err));


      // Reload latest order details if action fails

      try {
        const latestOrder = await apiRequest<Order>(
          `/orders/${orderId}`
        );

        setSelectedOrder(latestOrder);

      } catch {
        // Keep the original error.
      }

    } finally {
      setActionLoading(false);
    }
  }


  // --------------------------------------------------
  // Product Name
  // --------------------------------------------------

  function getProductName(productId: number): string {

    const product = products.find(
      (item) => item.id === productId
    );

    return product
      ? product.name
      : `Product #${productId}`;
  }


  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (

    <div className="orders-page">


      {/* Page Header */}

      <div className="page-heading">

        <div>
          <span className="page-eyebrow">
            ORDER MANAGEMENT
          </span>

          <h1>Orders</h1>

          <p>
            Manage customer orders and track their status.
          </p>
        </div>


        <button
          className="primary-button"
          onClick={openCreateModal}
          type="button"
        >
          <Plus size={18} />
          Create Order
        </button>

      </div>


      {/* Error Message */}

      {error && (

        <div className="orders-alert orders-alert-error">

          <AlertCircle size={18} />

          <span>{error}</span>

          <button
            onClick={() => setError("")}
            type="button"
          >
            <X size={16} />
          </button>

        </div>
      )}


      {/* Success Message */}

      {success && (

        <div className="orders-alert orders-alert-success">

          <CheckCircle2 size={18} />

          <span>{success}</span>

          <button
            onClick={() => setSuccess("")}
            type="button"
          >
            <X size={16} />
          </button>

        </div>
      )}


      {/* Statistics */}

      <div className="orders-stats">


        <div className="orders-stat-card">

          <div className="orders-stat-icon stat-icon-blue">
            <ShoppingBag size={20} />
          </div>

          <div>
            <span>Total Orders</span>
            <strong>{statistics.total}</strong>
          </div>

        </div>


        <div className="orders-stat-card">

          <div className="orders-stat-icon stat-icon-orange">
            <Clock size={20} />
          </div>

          <div>
            <span>Pending</span>
            <strong>{statistics.pending}</strong>
          </div>

        </div>


        <div className="orders-stat-card">

          <div className="orders-stat-icon stat-icon-green">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Confirmed</span>
            <strong>{statistics.confirmed}</strong>
          </div>

        </div>


        <div className="orders-stat-card">

          <div className="orders-stat-icon stat-icon-red">
            <XCircle size={20} />
          </div>

          <div>
            <span>Cancelled</span>
            <strong>{statistics.cancelled}</strong>
          </div>

        </div>

      </div>


      {/* Orders Table */}

      <section className="orders-content">


        {/* Search and Filter */}

        <div className="orders-toolbar">


          <div className="orders-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

          </div>


          <div className="orders-toolbar-actions">


            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as OrderFilter)
              }
              aria-label="Filter orders by status"
            >

              <option value="ALL">
                All statuses
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="CONFIRMED">
                Confirmed
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>

            </select>


            <button
              className="icon-button"
              onClick={() => void fetchOrders(true)}
              type="button"
              title="Refresh orders"
              disabled={refreshing}
            >
              <RefreshCw
                size={17}
                className={refreshing ? "refreshing-icon" : ""}
              />
            </button>

          </div>

        </div>


        {/* Table */}

        <div className="orders-table-wrapper">

          <table className="orders-table">


            <thead>

              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>


            <tbody>


              {loading ? (

                <tr>
                  <td colSpan={6} className="orders-table-message">
                    Loading orders...
                  </td>
                </tr>

              ) : filteredOrders.length === 0 ? (

                <tr>
                  <td colSpan={6} className="orders-table-message">

                    <ShoppingBag size={30} />

                    <strong>No orders found</strong>

                    <span>
                      {search || filter !== "ALL"
                        ? "Try changing your search or filter."
                        : "Create your first order to get started."}
                    </span>

                  </td>
                </tr>

              ) : (

                filteredOrders.map((order) => {

                  const status = normalizeStatus(order.status);

                  return (

                    <tr key={order.id}>


                      <td>
                        <strong className="order-number">
                          #{order.id}
                        </strong>
                      </td>


                      <td>

                        <div className="order-customer">

                          <strong>
                            {order.customer_name}
                          </strong>

                          <span>
                            {order.customer_email}
                          </span>

                        </div>

                      </td>


                      <td className="order-date">
                        {formatDate(order.created_at)}
                      </td>


                      <td>

                        <strong className="order-amount">
                          {formatMoney(order.total_amount)}
                        </strong>

                      </td>


                      <td>

                        <span
                          className={`order-status status-${status.toLowerCase()}`}
                        >

                          <span />

                          {getStatusLabel(status)}

                        </span>

                      </td>


                      <td>

                        <button
                          className="view-order-button"
                          type="button"
                          onClick={() => void openOrderDetails(order.id)}
                        >
                          <Eye size={16} />
                          View
                        </button>

                      </td>

                    </tr>

                  );
                })

              )}

            </tbody>

          </table>

        </div>


        {/* Table Footer */}

        <div className="orders-table-footer">

          <span>
            Showing {filteredOrders.length} of {orders.length} orders
          </span>

        </div>

      </section>



      {/* ==================================================
          CREATE ORDER MODAL
      ================================================== */}

      {showCreateModal && (

        <div className="orders-modal-overlay">

          <div className="orders-modal create-order-modal">


            {/* Modal Header */}

            <div className="orders-modal-header">

              <div>

                <span className="page-eyebrow">
                  NEW TRANSACTION
                </span>

                <h2>Create Order</h2>

                <p>
                  Add customer information and order items.
                </p>

              </div>


              <button
                className="modal-close-button"
                onClick={closeCreateModal}
                type="button"
              >
                <X size={20} />
              </button>

            </div>



            {/* Form */}

            <form onSubmit={handleCreateOrder}>


              <div className="orders-modal-body">


                {/* Customer Information */}

                <div className="form-section-title">

                  <User size={17} />

                  Customer Information

                </div>


                <div className="order-form-grid">


                  <label className="order-form-field">

                    <span>Customer Name</span>

                    <input
                      value={customerName}
                      onChange={(event) =>
                        setCustomerName(event.target.value)
                      }
                      placeholder="Enter customer name"
                      maxLength={150}
                      required
                    />

                  </label>


                  <label className="order-form-field">

                    <span>Email Address</span>

                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(event) =>
                        setCustomerEmail(event.target.value)
                      }
                      placeholder="customer@example.com"
                      maxLength={255}
                      required
                    />

                  </label>


                </div>



                {/* Order Items Header */}

                <div className="form-section-heading">


                  <div className="form-section-title">

                    <Package size={17} />

                    Order Items

                  </div>


                  <button
                    type="button"
                    className="add-order-item-button"
                    onClick={addItemRow}
                    disabled={
                      activeProducts.length === 0 ||
                      productsLoading
                    }
                  >
                    <Plus size={15} />
                    Add Item
                  </button>


                </div>



                {/* Products Loading */}

                {productsLoading ? (

                  <div className="order-products-message">
                    Loading products...
                  </div>

                ) : activeProducts.length === 0 ? (

                  <div className="order-products-message">
                    No active products with available stock.
                  </div>

                ) : (


                  <div className="order-draft-items">


                    {draftItems.map((item, index) => {


                      const product = products.find(
                        (current) =>
                          current.id === Number(item.product_id)
                      );


                      const lineTotal = product
                        ? Number(product.price) * item.quantity
                        : 0;


                      return (

                        <div
                          className="order-draft-row"
                          key={index}
                        >


                          {/* Product Select */}

                          <div className="order-form-field draft-product-field">

                            <span>Product</span>

                            <select
                              value={item.product_id}
                              onChange={(event) =>
                                updateItem(
                                  index,
                                  "product_id",
                                  event.target.value
                                )
                              }
                              required
                            >

                              <option value="">
                                Select a product
                              </option>


                              {activeProducts.map((availableProduct) => {

                                const alreadySelected =
                                  selectedProducts.includes(availableProduct.id) &&
                                  Number(item.product_id) !== availableProduct.id;


                                return (

                                  <option
                                    key={availableProduct.id}
                                    value={availableProduct.id}
                                    disabled={alreadySelected}
                                  >
                                    {availableProduct.name} — {availableProduct.sku}
                                  </option>

                                );

                              })}

                            </select>


                            {product && (

                              <small>
                                Stock: {product.stock_quantity}
                                {" · "}
                                Price: {formatMoney(product.price)}
                              </small>

                            )}

                          </div>



                          {/* Quantity */}

                          <div className="order-form-field draft-quantity-field">

                            <span>Quantity</span>

                            <input
                              type="number"
                              min="1"
                              max={product?.stock_quantity}
                              step="1"
                              value={item.quantity}
                              onChange={(event) =>
                                updateItem(
                                  index,
                                  "quantity",
                                  Number(event.target.value)
                                )
                              }
                              required
                            />

                          </div>



                          {/* Subtotal */}

                          <div className="draft-line-total">

                            <span>Subtotal</span>

                            <strong>
                              {formatMoney(lineTotal)}
                            </strong>

                          </div>



                          {/* Remove Item */}

                          <button
                            className="remove-order-item-button"
                            type="button"
                            onClick={() => removeItemRow(index)}
                            disabled={draftItems.length === 1}
                            title="Remove item"
                          >
                            <Trash2 size={17} />
                          </button>


                        </div>

                      );

                    })}


                  </div>

                )}



                {/* Estimated Total */}

                <div className="order-estimated-total">


                  <div>

                    <span>Estimated Total</span>

                    <small>
                      Final amount is calculated by the server.
                    </small>

                  </div>


                  <strong>
                    {formatMoney(estimatedTotal)}
                  </strong>


                </div>


              </div>



              {/* Form Actions */}

              <div className="orders-modal-footer">


                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeCreateModal}
                  disabled={submitting}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    submitting ||
                    productsLoading ||
                    activeProducts.length === 0
                  }
                >

                  {submitting
                    ? "Creating..."
                    : "Create Order"}

                  {!submitting && <ArrowRight size={17} />}

                </button>


              </div>


            </form>


          </div>

        </div>

      )}



      {/* ==================================================
          ORDER DETAILS MODAL
      ================================================== */}

      {(selectedOrder || detailsLoading) && (

        <div className="orders-modal-overlay">

          <div className="orders-modal order-details-modal">


            {detailsLoading ? (

              <div className="order-details-loading">

                <RefreshCw size={24} />

                <span>
                  Loading order details...
                </span>

              </div>

            ) : selectedOrder ? (

              <>


                {/* Details Header */}

                <div className="orders-modal-header">


                  <div>

                    <span className="page-eyebrow">
                      ORDER DETAILS
                    </span>

                    <h2>
                      Order #{selectedOrder.id}
                    </h2>


                    <span
                      className={`order-status status-${normalizeStatus(
                        selectedOrder.status
                      ).toLowerCase()}`}
                    >

                      <span />

                      {getStatusLabel(selectedOrder.status)}

                    </span>


                  </div>


                  <button
                    className="modal-close-button"
                    onClick={closeOrderDetails}
                    type="button"
                    disabled={actionLoading}
                  >
                    <X size={20} />
                  </button>


                </div>



                {/* Details Body */}

                <div className="orders-modal-body">


                  {/* Customer Details */}

                  <div className="order-detail-customer">


                    <div className="order-detail-info">

                      <User size={17} />

                      <div>

                        <span>Customer</span>

                        <strong>
                          {selectedOrder.customer_name}
                        </strong>

                      </div>

                    </div>



                    <div className="order-detail-info">

                      <Mail size={17} />

                      <div>

                        <span>Email</span>

                        <strong>
                          {selectedOrder.customer_email}
                        </strong>

                      </div>

                    </div>



                    <div className="order-detail-info">

                      <CalendarDays size={17} />

                      <div>

                        <span>Created At</span>

                        <strong>
                          {formatDate(selectedOrder.created_at)}
                        </strong>

                      </div>

                    </div>


                  </div>



                  {/* Order Items */}

                  <div className="form-section-title order-detail-items-title">

                    <Package size={17} />

                    Items

                  </div>



                  <div className="order-detail-items">


                    {selectedOrder.order_items?.length ? (

                      selectedOrder.order_items.map((item) => (

                        <div
                          className="order-detail-item"
                          key={item.id}
                        >

<div className="order-detail-left">

                            <div className="order-detail-icon">
                              <Package size={16} />
                            </div>

                            <div className="order-detail-product">

                              <strong>
                                {getProductName(item.product_id)}
                              </strong>

                              <span>
                                {formatMoney(item.unit_price)}
                                {" × "}
                                {item.quantity}
                              </span>

                            </div>

                          </div>


                          <strong>
                            {formatMoney(
                              Number(item.unit_price) * item.quantity
                            )}
                          </strong>


                        </div>

                      ))

                    ) : (

                      <div className="order-products-message">
                        No item details were returned for this order.
                      </div>

                    )}


                  </div>



                  {/* Order Total */}

                  <div className="order-detail-total">

                    <span>Order Total</span>

                    <strong>
                      {formatMoney(selectedOrder.total_amount)}
                    </strong>

                  </div>


                </div>



                {/* Details Actions */}

                <div className="orders-modal-footer order-actions-footer">


                  <button
                    type="button"
                    className="secondary-button"
                    onClick={closeOrderDetails}
                    disabled={actionLoading}
                  >
                    Close
                  </button>



                  {/* Confirm Button */}

                  {normalizeStatus(selectedOrder.status) === "PENDING" && (

                    <button
                      type="button"
                      className="primary-button"
                      onClick={() =>
                        void handleOrderAction(
                          selectedOrder.id,
                          "confirm"
                        )
                      }
                      disabled={actionLoading}
                    >

                      <CheckCircle2 size={17} />

                      {actionLoading
                        ? "Processing..."
                        : "Confirm Order"}

                    </button>

                  )}



                  {/* Cancel Button */}

                  {(
                    normalizeStatus(selectedOrder.status) === "PENDING" ||
                    normalizeStatus(selectedOrder.status) === "CONFIRMED"
                  ) && (

                    <button
                      type="button"
                      className="danger-button"
                      onClick={() =>
                        void handleOrderAction(
                          selectedOrder.id,
                          "cancel"
                        )
                      }
                      disabled={actionLoading}
                    >

                      <XCircle size={17} />

                      {actionLoading
                        ? "Processing..."
                        : "Cancel Order"}

                    </button>

                  )}


                </div>


              </>

            ) : null}


          </div>

        </div>

      )}


    </div>

  );

}

export default Orders;
