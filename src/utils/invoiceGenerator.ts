import { Sale, SaleItem } from '../lib/supabase';

export const generateInvoiceHTML = (
  sale: Sale,
  items: SaleItem[]
): string => {
  const invoiceDate = new Date(sale.sale_date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          padding: 20px;
          background: white;
          max-width: 400px;
          margin: 0 auto;
        }
        .invoice {
          border: 2px solid #000;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 15px;
          margin-bottom: 15px;
        }
        .header h1 {
          font-size: 24px;
          margin-bottom: 5px;
        }
        .header p {
          font-size: 12px;
          color: #666;
        }
        .info {
          margin-bottom: 15px;
          font-size: 13px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        .items {
          border-top: 1px solid #ddd;
          border-bottom: 1px solid #ddd;
          padding: 10px 0;
          margin: 15px 0;
        }
        .item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;
        }
        .item-details {
          flex: 1;
        }
        .item-name {
          font-weight: 600;
        }
        .item-qty {
          color: #666;
          font-size: 12px;
        }
        .item-price {
          font-weight: 600;
          text-align: right;
        }
        .totals {
          margin-top: 15px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .total-row.grand {
          font-size: 18px;
          font-weight: bold;
          border-top: 2px solid #000;
          padding-top: 10px;
          margin-top: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <h1>GARMENT STORE</h1>
          <p>Tax Invoice</p>
        </div>

        <div class="info">
          <div class="info-row">
            <span><strong>Invoice #:</strong></span>
            <span>${sale.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div class="info-row">
            <span><strong>Date:</strong></span>
            <span>${invoiceDate}</span>
          </div>
          ${sale.customer_phone ? `
          <div class="info-row">
            <span><strong>Phone:</strong></span>
            <span>${sale.customer_phone}</span>
          </div>
          ` : ''}
        </div>

        <div class="items">
          ${items.map(item => `
            <div class="item">
              <div class="item-details">
                <div class="item-name">${item.product_name}</div>
                <div class="item-qty">${item.quantity} × ₹${item.unit_price.toFixed(2)}</div>
              </div>
              <div class="item-price">₹${item.subtotal.toFixed(2)}</div>
            </div>
          `).join('')}
        </div>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>₹${sale.total_amount.toFixed(2)}</span>
          </div>
          <div class="total-row grand">
            <span>TOTAL:</span>
            <span>₹${sale.total_amount.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for shopping with us!</p>
          <p>Visit again soon</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const shareInvoiceToWhatsApp = (phoneNumber: string, invoiceId: string, items: any[], total: number) => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');

  let message = `*INVOICE #${invoiceId.slice(0, 8).toUpperCase()}*\n\n`;
  message += `*Items:*\n`;

  items.forEach(item => {
    message += `• ${item.product_name}\n`;
    message += `  Qty: ${item.quantity} × ₹${item.unit_price.toFixed(2)}\n`;
    message += `  Amount: ₹${item.subtotal.toFixed(2)}\n\n`;
  });

  message += `*Total: ₹${total.toFixed(2)}*\n\n`;
  message += `Thank you for shopping with us!`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');
};
