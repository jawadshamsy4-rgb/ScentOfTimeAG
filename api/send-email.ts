export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }
  
  const RESEND_API_KEY = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;
  
  try {
    const body = await req.json();
    const { templateData, recipientEmail, idempotencyKey } = body;
    
    // Clean currency string helper (standardizes "৳ 4,500" or "4500" to "BDT 4,500")
    const formatBdt = (val: string | number) => {
      if (!val) return "BDT 0";
      const cleaned = String(val).replace(/[৳,]/g, '').trim();
      const num = parseFloat(cleaned);
      if (isNaN(num)) return String(val);
      return `BDT ${Math.round(num).toLocaleString()}`;
    };

    const deliveryFormatted = formatBdt(templateData.deliveryCharge);
    const totalFormatted = formatBdt(templateData.totalPrice);
    
    // Calculate item subtotal for clarity
    const totalNum = parseFloat(String(templateData.totalPrice).replace(/[৳,]/g, '').trim()) || 0;
    const deliveryNum = parseFloat(String(templateData.deliveryCharge).replace(/[৳,]/g, '').trim()) || 0;
    const subtotalNum = Math.max(0, totalNum - deliveryNum);
    const subtotalFormatted = `BDT ${Math.round(subtotalNum).toLocaleString()}`;

    // Extract Order ID if present in idempotency key (e.g. order-notif-ST000003 or ST000003)
    let orderNumberDisplay = "";
    if (idempotencyKey) {
      const match = idempotencyKey.match(/(?:order-notif-)?([A-Z0-9]+)/i);
      if (match && match[1] && !match[1].startsWith("undefined")) {
        orderNumberDisplay = match[1];
      }
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order Notification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f4f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f6f4f0; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e8e4dc;">
          
          <!-- Top Gold Accent Ribbon -->
          <tr>
            <td style="background: linear-gradient(90deg, #d4af37 0%, #b8860b 50%, #d4af37 100%); height: 5px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header Section -->
          <tr>
            <td style="padding: 35px 35px 25px 35px; text-align: center; border-bottom: 1px solid #f0ede6;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 2px; color: #1a1816; text-transform: uppercase;">SCENT OF TIME</h1>
              <p style="margin: 5px 0 0 0; font-size: 11px; font-weight: 600; letter-spacing: 2.5px; color: #b8860b; text-transform: uppercase;">Luxury Fragrance House • Bangladesh</p>
              
              <div style="margin-top: 25px; display: inline-block; padding: 6px 16px; background-color: #fbf7ee; border: 1px solid #ebd9a4; border-radius: 20px;">
                <span style="font-size: 12px; font-weight: 600; color: #926c05; letter-spacing: 0.5px; text-transform: uppercase;">
                  🎉 New Order Received ${orderNumberDisplay ? `• #${orderNumberDisplay}` : ''}
                </span>
              </div>
            </td>
          </tr>

          <!-- Order Summary Intro -->
          <tr>
            <td style="padding: 25px 35px 15px 35px;">
              <p style="margin: 0; font-size: 14px; color: #666057; line-height: 1.6;">
                A new order has been submitted on the storefront. Payment method: <strong style="color: #b8860b;">Cash on Delivery (COD)</strong>. Details are recorded below:
              </p>
            </td>
          </tr>

          <!-- Customer & Delivery Box -->
          <tr>
            <td style="padding: 0 35px 25px 35px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf8f5; border-radius: 8px; border: 1px solid #ede7db;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #f0eae0; width: 35%; font-size: 11px; font-weight: 700; color: #8c8273; text-transform: uppercase; letter-spacing: 1px;">
                    Customer Name
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #f0eae0; font-size: 14px; font-weight: 600; color: #1a1816;">
                    ${templateData.customerName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #f0eae0; font-size: 11px; font-weight: 700; color: #8c8273; text-transform: uppercase; letter-spacing: 1px;">
                    Contact Phone
                  </td>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #f0eae0; font-size: 14px; font-weight: 600; color: #1a1816;">
                    <a href="tel:${templateData.customerPhone}" style="color: #1a1816; text-decoration: none;">${templateData.customerPhone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; font-size: 11px; font-weight: 700; color: #8c8273; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">
                    Shipping Address
                  </td>
                  <td style="padding: 14px 20px; font-size: 13.5px; color: #2c2824; line-height: 1.5;">
                    ${templateData.customerAddress}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Ordered Products Table -->
          <tr>
            <td style="padding: 0 35px 20px 35px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border-radius: 8px; overflow: hidden; border: 1px solid #ede7db;">
                <thead>
                  <tr style="background-color: #1f1b18;">
                    <th align="left" style="padding: 12px 16px; font-size: 11px; font-weight: 600; color: #f2ede4; text-transform: uppercase; letter-spacing: 1px;">Item Description</th>
                    <th align="center" style="padding: 12px 12px; font-size: 11px; font-weight: 600; color: #f2ede4; text-transform: uppercase; letter-spacing: 1px; width: 50px;">Qty</th>
                    <th align="right" style="padding: 12px 16px; font-size: 11px; font-weight: 600; color: #f2ede4; text-transform: uppercase; letter-spacing: 1px; width: 110px;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="background-color: #ffffff;">
                    <td style="padding: 16px; border-bottom: 1px solid #f0eae0;">
                      <div style="font-size: 15px; font-weight: 600; color: #1a1816;">${templateData.productName}</div>
                      <div style="font-size: 12.5px; color: #7a7266; margin-top: 3px;">Variant / Size: <strong style="color: #4a453d;">${templateData.variant}</strong></div>
                      ${templateData.selectedPerfumes ? `<div style="font-size: 11.5px; color: #9c7314; margin-top: 5px; background-color: #fbf7ee; padding: 4px 8px; border-radius: 4px; display: inline-block;">Fragrances: ${templateData.selectedPerfumes}</div>` : ''}
                    </td>
                    <td align="center" style="padding: 16px 12px; border-bottom: 1px solid #f0eae0; font-size: 14px; font-weight: 600; color: #1a1816;">
                      ${templateData.quantity}
                    </td>
                    <td align="right" style="padding: 16px; border-bottom: 1px solid #f0eae0; font-size: 14px; font-weight: 600; color: #1a1816;">
                      ${subtotalFormatted}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Cost Breakdown / Financial Summary -->
          <tr>
            <td style="padding: 0 35px 25px 35px;" align="right">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="width: 260px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #7a7266;">Items Subtotal:</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 500; color: #2c2824;">${subtotalFormatted}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #7a7266;">Delivery Fee:</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 500; color: #2c2824;">${deliveryFormatted}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 4px 0;"><div style="border-top: 1px solid #e8e2d5;"></div></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0 0 0; font-size: 14px; font-weight: 700; color: #1a1816;">Total (COD):</td>
                  <td align="right" style="padding: 10px 0 0 0; font-size: 17px; font-weight: 700; color: #b8860b;">${totalFormatted}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Timestamp & Admin Footer -->
          <tr>
            <td style="background-color: #fcfbfa; padding: 20px 35px; border-top: 1px solid #f0ede6; text-align: center;">
              <p style="margin: 0; font-size: 11.5px; color: #8c8273;">
                Order Time: <strong style="color: #4a453d;">${templateData.orderTime}</strong>
              </p>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #aba496;">
                Automated order dispatch alert • Scent Of Time Storefront
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Scent of Time <onboarding@resend.dev>',
        to: [recipientEmail],
        subject: `New Order: ${templateData.customerName} (${totalFormatted})`,
        html: htmlContent
      })
    });
    
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.ok ? 200 : response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
