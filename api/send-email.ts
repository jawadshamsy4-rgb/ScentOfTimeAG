export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }
  
  const RESEND_API_KEY = process.env.VITE_RESEND_API_KEY;
  
  try {
    const body = await req.json();
    const { templateData, recipientEmail } = body;
    
    // Construct HTML email content
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
        <h2 style="color: #333; text-align: center;">New Order Received!</h2>
        <p>A new order has been placed. Details below:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr style="background: #f9f9f9;">
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Customer Name</th>
            <td style="padding: 10px; border: 1px solid #ddd;">${templateData.customerName}</td>
          </tr>
          <tr>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Phone</th>
            <td style="padding: 10px; border: 1px solid #ddd;">${templateData.customerPhone}</td>
          </tr>
          <tr style="background: #f9f9f9;">
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Address</th>
            <td style="padding: 10px; border: 1px solid #ddd;">${templateData.customerAddress}</td>
          </tr>
          <tr>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Product</th>
            <td style="padding: 10px; border: 1px solid #ddd;">${templateData.productName}</td>
          </tr>
          <tr style="background: #f9f9f9;">
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Variant</th>
            <td style="padding: 10px; border: 1px solid #ddd;">${templateData.variant}</td>
          </tr>
          <tr>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Quantity</th>
            <td style="padding: 10px; border: 1px solid #ddd;">${templateData.quantity}</td>
          </tr>
          <tr style="background: #f9f9f9;">
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Delivery Charge</th>
            <td style="padding: 10px; border: 1px solid #ddd;">${templateData.deliveryCharge}</td>
          </tr>
          <tr>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Total Price</th>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${templateData.totalPrice}</td>
          </tr>
          ${templateData.selectedPerfumes ? `
          <tr style="background: #f9f9f9;">
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Selected Perfumes</th>
            <td style="padding: 10px; border: 1px solid #ddd;">${templateData.selectedPerfumes}</td>
          </tr>` : ''}
          <tr>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Order Time</th>
            <td style="padding: 10px; border: 1px solid #ddd;">${templateData.orderTime}</td>
          </tr>
        </table>
        <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">
          Sent automatically from Scent of Time storefront.
        </p>
      </div>
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
        subject: `New Order from ${templateData.customerName}`,
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
