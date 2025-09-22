import React from "react";

const Documentation = () => {
  const sections = [
    {
      key: "0",
      title: "📋 Product & Inventory Management",
      content: (
        <>
          <p className="font-semibold mb-2">Product CRUD Operations</p>
          <ul className="list-disc ml-6 mb-4">
            <li>
              Create new products with detailed specifications and variations
            </li>
            <li>Update product information, pricing, and descriptions</li>
            <li>
              Browse a comprehensive product catalog with search and filtering
              options
            </li>
            <li>Delete or archive discontinued products</li>
          </ul>

          <p className="font-semibold mb-2">Item Management & Stock Control</p>
          <ul className="list-disc ml-6">
            <li>Automatic SKU generation and management</li>
            <li>Real-time stock level monitoring across all platforms</li>
            <li>Product variations management (size, color, model)</li>
            <li>Automated low-stock alerts with configurable thresholds</li>
            <li>Inventory valuation and cost tracking</li>
          </ul>
        </>
      ),
    },
    {
      key: "1",
      title: "🛒 Order Processing & Integration",
      content: (
        <>
          <p className="font-semibold mb-2">Multi-Platform Order Management</p>
          <ul className="list-disc ml-6 mb-4">
            <li>
              Import orders automatically from Shopee, TikTok Shop, and Lazada
            </li>
            <li>Real-time order status updates and tracking</li>
            <li>Bulk order import with data validation</li>
            <li>Track order statuses: Processing, Returned, Completed</li>
            <li>Automatic inventory adjustment upon order completion</li>
          </ul>
        </>
      ),
    },
    {
      key: "2",
      title: "🏪 Sales Channel Management",
      content: (
        <>
          <p className="font-semibold mb-2">Walk-in Transaction Processing</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Point-of-sale interface for physical store transactions</li>
            <li>
              Support for multiple payment methods (cash, GCash, bank transfer)
            </li>
            <li>Receipt generation and printing capabilities</li>
          </ul>

          <p className="font-semibold mb-2">Multi-Channel Sales Recording</p>
          <ul className="list-disc ml-6">
            <li>Import completed orders from multiple platforms</li>
            <li>Update order statuses across all connected platforms</li>
            <li>Track sales for paid and unpaid orders</li>
          </ul>
        </>
      ),
    },
    {
      key: "3",
      title: "↩️ Returns & Refunds Management",
      content: (
        <>
          <p className="font-semibold mb-2">Return & Refund Workflow</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Import return orders from e-commerce platforms</li>
            <li>Track and update return statuses across all platforms</li>
            <li>Automatic restocking and inventory reconciliation</li>
            <li>Refund tracking and customer communication</li>
          </ul>
        </>
      ),
    },
    {
      key: "4",
      title: "📊 Reporting & Analytics",
      content: (
        <>
          <p className="font-semibold mb-2">Comprehensive Reports</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Order reports with filtering and summaries</li>
            <li>Walk-in transaction reports</li>
            <li>Product performance and stock movement reports</li>
            <li>Inventory activity and adjustment reports</li>
            <li>Export reports in Excel (.xlsx) and PDF formats</li>
          </ul>
        </>
      ),
    },
    {
      key: "5",
      title: "🔗 Data Management & Integration",
      content: (
        <>
          <p className="font-semibold mb-2">
            Platform Integration & Data Tools
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li>Bulk product import using Excel templates</li>
            <li>Seamless synchronization of imported data and updates</li>
            <li>Error handling with retry mechanisms for failed imports</li>
            <li>Data validation and duplicate prevention</li>
            <li>Audit trail for all data modifications</li>
            <li>Backup and restore functionality</li>
          </ul>
        </>
      ),
    },
    {
      key: "6",
      title: "📤 Exporting Order Reports",
      content: (
        <>
          <p className="font-semibold mb-2 flex items-center gap-2">
            🛍️ Shopee – Exporting Returns/Refunds/Cancelled Orders
          </p>
          <ul className="list-disc ml-6 mb-4 text-sm text-gray-700">
            <li>
              Navigate to <span className="font-medium">My Orders</span>
            </li>
            <li>
              Go to{" "}
              <span className="font-medium">Return / Refund / Cancel</span> tab
            </li>
            <li>
              Select <span className="font-medium">All Orders</span>
            </li>
            <li>
              Apply the required{" "}
              <span className="font-medium">Date Filter</span>
            </li>
            <li>
              Click on the <span className="font-medium">Export</span> button to
              download the file
            </li>
          </ul>

          <p className="font-semibold mb-2 flex items-center gap-2">
            📦 Lazada – Exporting Failed/Cancelled Orders
          </p>
          <ul className="list-disc ml-6 mb-4 text-sm text-gray-700">
            <li>
              Navigate to <span className="font-medium">My Orders</span>
            </li>
            <li>
              Go to{" "}
              <span className="font-medium">
                Failed Delivery / Cancellation / Return / Refund
              </span>
            </li>
            <li>
              Select <span className="font-medium">All Orders</span>
            </li>
            <li>
              Apply the required{" "}
              <span className="font-medium">Date Filter</span>
            </li>
            <li>
              Click on the <span className="font-medium">Export</span> button to
              download the file
            </li>
          </ul>

          <p className="font-semibold mb-2 flex items-center gap-2">
            🎵 TikTok Shop – Exporting Cancelled Orders
          </p>
          <ul className="list-disc ml-6 mb-4 text-sm text-gray-700">
            <li>
              Navigate to <span className="font-medium">My Orders</span>
            </li>
            <li>
              Go to the <span className="font-medium">Cancelled</span> tab
            </li>
            <li>
              Select <span className="font-medium">All Orders</span>
            </li>
            <li>
              Apply the required{" "}
              <span className="font-medium">Date Filter</span>
            </li>
            <li>
              Click on the <span className="font-medium">Export</span> button to
              download the file
            </li>
          </ul>
        </>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-4">
        📦 Multi-Platform Inventory Management System – User Guide
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Welcome to your comprehensive inventory management solution for{" "}
        <strong>Shopee, TikTok Shop, and Lazada</strong>. This guide covers all
        major features and modules to help you streamline your e-commerce
        operations across multiple platforms.
      </p>

      <div className="accordion" id="documentationAccordion">
        {sections.map((section, idx) => (
          <div className="card" key={section.key}>
            <div className="card-header" id={`heading${section.key}`}>
              <h2 className="mb-0">
                <button
                  className="btn btn-link btn-block text-left"
                  type="button"
                  data-toggle="collapse"
                  data-target={`#collapse${section.key}`}
                  aria-expanded={idx === 0 ? "true" : "false"}
                  aria-controls={`collapse${section.key}`}
                >
                  {section.title}
                </button>
              </h2>
            </div>

            <div
              id={`collapse${section.key}`}
              className={`collapse ${idx === 0 ? "show" : ""}`}
              aria-labelledby={`heading${section.key}`}
              data-parent="#documentationAccordion"
            >
              <div className="card-body">{section.content}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h5 className="text-lg font-semibold mb-3">
          💡 System Benefits & Key Features
        </h5>
        <ul className="list-disc ml-6 space-y-1">
          <li>
            <strong>Centralized Management:</strong> Manage all platforms from a
            single dashboard
          </li>
          <li>
            <strong>Real-time Synchronization:</strong> Keep inventory and
            orders updated instantly across channels
          </li>
          <li>
            <strong>Automated Workflows:</strong> Reduce manual effort with
            intelligent automation
          </li>
          <li>
            <strong>Comprehensive Reporting:</strong> Make informed decisions
            with detailed analytics
          </li>
          <li>
            <strong>Scalable Architecture:</strong> Flexible system that grows
            with your business
          </li>
        </ul>
        <p className="mt-4 text-sm">
          🔧 <strong>Need technical support?</strong> Contact our development
          team for assistance with system configuration, platform integrations,
          or custom reporting requirements.
        </p>
      </div>
    </div>
  );
};

export default Documentation;
