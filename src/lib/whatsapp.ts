import { Order } from '../types';

export function formatWhatsAppOrderMessage(order: Order, baseUrl = window.location.origin): string {
  const lines: string[] = [];

  lines.push('👑 *VELORA ORDER*');
  lines.push('');
  lines.push(`*Order ID:* ${order.order_number}`);
  lines.push('');
  lines.push('*Customer*');
  lines.push(`Name: ${order.customer_name}`);
  lines.push(`Phone: ${order.phone}`);
  lines.push(`WhatsApp: ${order.whatsapp}`);
  lines.push('');
  lines.push('*Delivery Address:*');
  lines.push(order.address);
  lines.push(`${order.city}, ${order.district}`);
  lines.push('');

  order.items.forEach((item, index) => {
    const itemNum = String(index + 1).padStart(2, '0');
    lines.push(`*ITEM ${itemNum}*`);
    lines.push(`Product: ${item.product_name_snapshot}`);
    lines.push(`Code: ${item.item_code_snapshot}`);

    if (item.variant_snapshot && Object.keys(item.variant_snapshot).length > 0) {
      const variantStr = Object.entries(item.variant_snapshot)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' / ');
      lines.push(`Variant: ${variantStr}`);
    }

    lines.push(`Qty: ${item.qty}`);
    lines.push(`Unit Price: Rs. ${item.unit_price_lkr.toLocaleString('en-US')}`);
    lines.push(`Line Total: Rs. ${item.line_total_lkr.toLocaleString('en-US')}`);

    if (item.product_id) {
      lines.push(`Product Link:\n${baseUrl}/product/${item.product_id}`);
    }
    lines.push('');
  });

  lines.push(`Subtotal: Rs. ${order.subtotal_lkr.toLocaleString('en-US')}`);
  lines.push(`Delivery: Rs. ${order.delivery_fee_lkr.toLocaleString('en-US')}`);
  lines.push('');
  lines.push(`*TOTAL PAYABLE: Rs. ${order.total_lkr.toLocaleString('en-US')}*`);
  lines.push('');
  lines.push('*Payment Method:* Online Bank Transfer');
  lines.push('*Payment Status:* Pending Transfer Slip');
  lines.push('(I have attached / will attach the bank transfer slip screenshot here)');

  if (order.note) {
    lines.push('');
    lines.push(`*Delivery Note:*\n${order.note}`);
  }

  lines.push('');
  lines.push('Please verify my bank payment and confirm my order.');
  lines.push('Thank you - VELORA');

  return lines.join('\n');
}

export function buildWhatsAppLink(
  phoneNumber: string,
  order: Order,
  baseUrl = window.location.origin
): string {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const message = formatWhatsAppOrderMessage(order, baseUrl);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
