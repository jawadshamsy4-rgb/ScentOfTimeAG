import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Define the Order interface loosely matching the Supabase row
export interface Order {
  order_number: string;
  created_at: string;
  name: string;
  phone: string;
  address: string;
  product: string;
  variant: string;
  quantity: number;
  total_price: number;
  delivery_charge?: number;
  selected_perfumes?: string[];
}

export const generateInvoice = (order: Order) => {
  const doc = new jsPDF();
  
  // Store Header
  doc.setFontSize(22);
  doc.setTextColor(33, 33, 33);
  doc.text("Scent Of Time", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Luxury fragrance house in Bangladesh", 14, 28);
  doc.text("Email: scentoftimebd2025@gmail.com", 14, 34);
  
  // Invoice Title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("INVOICE", 150, 22);
  
  doc.setFontSize(10);
  doc.text(`Order No: ${order.order_number}`, 150, 28);
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 150, 34);
  doc.text(`Status: Cash on Delivery`, 150, 40);
  
  // Customer Info
  doc.setFontSize(12);
  doc.setTextColor(33, 33, 33);
  doc.text("Bill To:", 14, 50);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(order.name, 14, 56);
  doc.text(order.phone, 14, 62);
  
  // Split address if it's too long
  const addressLines = doc.splitTextToSize(order.address, 80);
  doc.text(addressLines, 14, 68);
  
  // Table
  const tableData = [
    [
      order.product,
      order.variant + (order.selected_perfumes ? `\n(${order.selected_perfumes.join(", ")})` : ""),
      order.quantity.toString(),
      `BDT ${((order.total_price - (order.delivery_charge || 0)) / order.quantity).toLocaleString()}`,
      `BDT ${(order.total_price - (order.delivery_charge || 0)).toLocaleString()}`
    ]
  ];
  
  (doc as any).autoTable({
    startY: 85,
    head: [['Product', 'Variant', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
  });
  
  const finalY = (doc as any).lastAutoTable.finalY || 85;
  
  // Totals
  doc.text("Subtotal:", 130, finalY + 10);
  doc.text(`BDT ${(order.total_price - (order.delivery_charge || 0)).toLocaleString()}`, 170, finalY + 10);
  
  doc.text("Delivery Charge:", 130, finalY + 16);
  doc.text(`BDT ${(order.delivery_charge || 0).toLocaleString()}`, 170, finalY + 16);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Grand Total:", 130, finalY + 24);
  doc.text(`BDT ${order.total_price.toLocaleString()}`, 170, finalY + 24);
  
  doc.save(`Invoice_${order.order_number}.pdf`);
};
