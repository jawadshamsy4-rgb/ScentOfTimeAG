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
  
  // Luxury Palette
  const goldColor: [number, number, number] = [184, 134, 11]; // Dark Goldenrod
  const darkCharcoal: [number, number, number] = [32, 28, 26]; // Dark luxury charcoal
  const mutedGray: [number, number, number] = [110, 105, 100];
  const lightBg: [number, number, number] = [248, 246, 242];

  // Top Accent Bar (Gold)
  doc.setFillColor(...goldColor);
  doc.rect(0, 0, 210, 5, 'F');

  // Brand Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...darkCharcoal);
  doc.text("SCENT OF TIME", 14, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...goldColor);
  doc.text("BANGLADESH", 14, 28);

  doc.setFontSize(8.5);
  doc.setTextColor(...mutedGray);
  doc.text("Web: scentoftimebd.com | Email: scentoftimebd2025@gmail.com", 14, 33);

  // Invoice Meta on Right Side
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...darkCharcoal);
  doc.text("OFFICIAL INVOICE", 140, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...mutedGray);
  doc.text(`Invoice No:`, 140, 26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkCharcoal);
  doc.text(`${order.order_number}`, 165, 26);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedGray);
  doc.text(`Date:`, 140, 31);
  doc.setTextColor(...darkCharcoal);
  doc.text(`${new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`, 165, 31);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedGray);
  doc.text(`Payment:`, 140, 36);
  doc.setTextColor(...goldColor);
  doc.setFont("helvetica", "bold");
  doc.text(`Cash on Delivery`, 165, 36);

  // Divider line
  doc.setDrawColor(220, 215, 205);
  doc.setLineWidth(0.5);
  doc.line(14, 40, 196, 40);

  // Customer Delivery Info Section
  doc.setFillColor(...lightBg);
  doc.roundedRect(14, 45, 182, 28, 2, 2, 'F');
  doc.setDrawColor(230, 225, 215);
  doc.roundedRect(14, 45, 182, 28, 2, 2, 'S');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...goldColor);
  doc.text("DELIVERY RECIPIENT", 20, 52);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...darkCharcoal);
  doc.text(order.name, 20, 58);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...mutedGray);
  doc.text(`Phone: ${order.phone}`, 20, 64);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...goldColor);
  doc.text("DESTINATION ADDRESS", 105, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...darkCharcoal);
  const addressLines = doc.splitTextToSize(order.address, 85);
  doc.text(addressLines, 105, 58);

  // Item Details Table
  const unitPrice = (order.total_price - (order.delivery_charge || 0)) / (order.quantity || 1);
  const itemSubtotal = order.total_price - (order.delivery_charge || 0);

  const variantText = order.variant + (order.selected_perfumes && order.selected_perfumes.length > 0 
    ? `\nFragrances: ${order.selected_perfumes.join(", ")}` 
    : "");

  const tableData = [
    [
      order.product,
      variantText,
      order.quantity.toString(),
      `৳${Math.round(unitPrice).toLocaleString()}`,
      `৳${Math.round(itemSubtotal).toLocaleString()}`
    ]
  ];

  (doc as any).autoTable({
    startY: 80,
    head: [['Product Description', 'Variant / Specifications', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: darkCharcoal,
      textColor: [245, 235, 220],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 4,
    },
    bodyStyles: {
      textColor: darkCharcoal,
      fontSize: 9,
      cellPadding: 5,
    },
    alternateRowStyles: {
      fillColor: [252, 250, 247],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: 55 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'right', cellWidth: 26 },
      4: { halign: 'right', cellWidth: 26 },
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 105;

  // Calculation Summary Box
  const summaryX = 120;
  doc.setDrawColor(220, 215, 205);
  doc.line(summaryX, finalY + 4, 196, finalY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...mutedGray);
  doc.text("Items Subtotal:", summaryX, finalY + 11);
  doc.setTextColor(...darkCharcoal);
  doc.text(`BDT ৳${Math.round(itemSubtotal).toLocaleString()}`, 196, finalY + 11, { align: 'right' });

  doc.setTextColor(...mutedGray);
  doc.text("Delivery Charge:", summaryX, finalY + 17);
  doc.setTextColor(...darkCharcoal);
  doc.text(`BDT ৳${(order.delivery_charge || 0).toLocaleString()}`, 196, finalY + 17, { align: 'right' });

  // Grand Total Highlight
  doc.setFillColor(...lightBg);
  doc.rect(summaryX - 4, finalY + 22, 80, 11, 'F');
  doc.setDrawColor(...goldColor);
  doc.rect(summaryX - 4, finalY + 22, 80, 11, 'S');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...goldColor);
  doc.text("Total Payable (COD):", summaryX, finalY + 29);
  doc.setFontSize(11);
  doc.setTextColor(...darkCharcoal);
  doc.text(`BDT ৳${order.total_price.toLocaleString()}`, 194, finalY + 29, { align: 'right' });

  // Bottom Notice & Sign-off
  const footerY = Math.max(finalY + 48, 250);
  doc.setDrawColor(230, 225, 215);
  doc.line(14, footerY, 196, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...goldColor);
  doc.text("THANK YOU FOR YOUR PATRONAGE", 105, footerY + 7, { align: 'center' });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedGray);
  doc.text("Authentic luxury fragrances bottled with precision. Inspect parcel upon delivery before Cash on Delivery settlement.", 105, footerY + 12, { align: 'center' });
  doc.text("For customer support, order inquiries, or assistance, reach us at scentoftimebd2025@gmail.com", 105, footerY + 16, { align: 'center' });

  // Save the document
  doc.save(`ScentOfTime_Invoice_${order.order_number}.pdf`);
};
