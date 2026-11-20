
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ClipboardList,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Ban,
} from "lucide-react";

import { apiRequest } from "../api/client";
import type { Product } from "../types/product";
import type { Order } from "../types/order";

type DashboardData = {
  products: Product[];
  orders: Order[];
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

const formatMoney = (value: number | string) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getStatusClass = (status: string) => {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
      return "status-confirmed";
    case "PENDING":
      return "status-pending";
    case "CANCELLED":
      return "status-cancelled";
    default:
      return "status-default";
  }
};

function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    products: [],
    orders: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [products, orders] = await Promise.all([
        apiRequest<Product[]>("/products"),
        apiRequest<Order[]>("/orders"),
      ]);

      setData({ products, orders });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const { products, orders } = data;

  const pendingOrders = orders.filter(
    (order) => order.status.toUpperCase() === "PENDING"
  );

  const confirmedOrders = orders.filter(
    (order) => order.status.toUpperCase() === "CONFIRMED"
  );

  const cancelledOrders = orders.filter(
    (order) => order.status.toUpperCase() === "CANCELLED"
  );

  const totalRevenue = confirmedOrders.reduce(
    (total, order) => total + Number(order.total_amount || 0),
    0
  );

  const totalStock = products.reduce(
    (total, product) => total + Number(product.stock_quantity || 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) =>
      product.is_active && Number(product.stock_quantity) <= 5
  );

  const inactiveProducts = products.filter(
    (product) => !product.is_active
  );

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <RefreshCw size={24} className="spin-icon" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">OVERVIEW</span>
          <h1>Dashboard</h1>
          <p>Monitor your products, orders, and business activity.</p>
        </div>

        <button
          className="dashboard-refresh"
          onClick={() => void loadDashboard()}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="dashboard-error">
          <AlertTriangle size={19} />
          <div>
            <strong>Could not load dashboard data</strong>
            <p>{error}</p>
          </div>
          <button onClick={() => void loadDashboard()}>
            Try again
          </button>
        </div>
      )}

      <section className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span>Total Products</span>
            <div className="dashboard-stat-icon purple">
              <Package size={20} />
            </div>
          </div>
          <strong>{formatNumber(products.length)}</strong>
          <span className="dashboard-stat-caption">
            {formatNumber(products.filter((p) => p.is_active).length)} active products
          </span>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span>Total Orders</span>
            <div className="dashboard-stat-icon blue">
              <ClipboardList size={20} />
            </div>
          </div>
          <strong>{formatNumber(orders.length)}</strong>
          <span className="dashboard-stat-caption">
            All orders received
          </span>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span>Pending Orders</span>
            <div className="dashboard-stat-icon orange">
              <Clock3 size={20} />
            </div>
          </div>
          <strong>{formatNumber(pendingOrders.length)}</strong>
          <span className="dashboard-stat-caption">
            Waiting for confirmation
          </span>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span>Confirmed Orders</span>
            <div className="dashboard-stat-icon green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <strong>{formatNumber(confirmedOrders.length)}</strong>
          <span className="dashboard-stat-caption">
            Successfully confirmed
          </span>
        </div>
      </section>

      <section className="dashboard-main-grid">
        <div className="dashboard-panel revenue-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-panel-label">REVENUE</span>
              <h2>Confirmed Order Value</h2>
            </div>
            <div className="dashboard-panel-icon green">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="revenue-value">
            <span>{formatMoney(totalRevenue)}</span>
          </div>

          <p className="dashboard-muted">
            Total value of all confirmed orders
          </p>

          <div className="revenue-footer">
            <div>
              <CheckCircle2 size={17} />
              <span>{confirmedOrders.length} confirmed</span>
            </div>
            <div>
              <Ban size={17} />
              <span>{cancelledOrders.length} cancelled</span>
            </div>
            <div>
              <Clock3 size={17} />
              <span>{pendingOrders.length} pending</span>
            </div>
          </div>
        </div>

        <div className="dashboard-panel inventory-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-panel-label">INVENTORY</span>
              <h2>Inventory Overview</h2>
            </div>
            <div className="dashboard-panel-icon purple">
              <Activity size={20} />
            </div>
          </div>

          <div className="inventory-total">
            <strong>{formatNumber(totalStock)}</strong>
            <span>Total units in stock</span>
          </div>

          <div className="inventory-indicators">
            <div className="inventory-indicator">
              <div className="inventory-indicator-label">
                <span className="inventory-dot warning" />
                Low stock
              </div>
              <strong>{lowStockProducts.length}</strong>
            </div>

            <div className="inventory-indicator">
              <div className="inventory-indicator-label">
                <span className="inventory-dot danger" />
                Inactive products
              </div>
              <strong>{inactiveProducts.length}</strong>
            </div>
          </div>

          <Link to="/products" className="dashboard-text-link">
            Manage inventory <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="dashboard-bottom-grid">
        <div className="dashboard-panel recent-orders-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-panel-label">LATEST ACTIVITY</span>
              <h2>Recent Orders</h2>
            </div>
            <Link to="/orders" className="dashboard-view-all">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="dashboard-empty">
              <ClipboardList size={30} />
              <strong>No orders yet</strong>
              <p>New orders will appear here.</p>
            </div>
          ) : (
            <div className="recent-orders-list">
              {recentOrders.map((order) => (
                <div className="recent-order-row" key={order.id}>
                  <div className="recent-order-main">
                    <div className="recent-order-icon">
                      <ShoppingCart size={17} />
                    </div>
                    <div>
                      <strong>Order #{order.id}</strong>
                      <span>{order.customer_name}</span>
                    </div>
                  </div>

                  <div className="recent-order-info">
                    <strong>{formatMoney(Number(order.total_amount))}</strong>
                    <span>{formatDate(order.created_at)}</span>
                  </div>

                  <span
                    className={`dashboard-status ${getStatusClass(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-panel quick-actions-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-panel-label">SHORTCUTS</span>
              <h2>Quick Actions</h2>
            </div>
          </div>

          <Link to="/create-order" className="dashboard-action-link primary-action">
            <div className="dashboard-action-icon">
              <Plus size={19} />
            </div>
            <div>
              <strong>Create New Order</strong>
              <span>Start a new customer order</span>
            </div>
            <ArrowUpRight size={18} />
          </Link>

          <Link to="/products" className="dashboard-action-link">
            <div className="dashboard-action-icon">
              <Package size={19} />
            </div>
            <div>
              <strong>Manage Products</strong>
              <span>View and update your products</span>
            </div>
            <ArrowDownRight size={18} />
          </Link>

          <Link to="/orders" className="dashboard-action-link">
            <div className="dashboard-action-icon">
              <ClipboardList size={19} />
            </div>
            <div>
              <strong>Manage Orders</strong>
              <span>Review and process orders</span>
            </div>
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
