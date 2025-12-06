// Cloudflare Worker for Grace Found Contact Form
// Sends emails via SendGrid

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const data = await request.json();

      // Validate required fields
      const required = ['firstName', 'lastName', 'email', 'phone'];
      for (const field of required) {
        if (!data[field]) {
          return new Response(JSON.stringify({ error: `${field} is required` }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      // Build email content
      const emailHtml = `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Service Needed:</strong> ${data.service || 'Not specified'}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message || 'No message provided'}</p>
        <hr>
        <p><em>Submitted from Grace Found Home Care Agency website</em></p>
      `;

      const emailText = `
New Contact Form Submission

Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone}
Service Needed: ${data.service || 'Not specified'}
Message: ${data.message || 'No message provided'}

---
Submitted from Grace Found Home Care Agency website
      `;

      // Send via SendGrid
      const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: env.NOTIFICATION_EMAIL }],
          }],
          from: {
            email: env.FROM_EMAIL,
            name: 'Grace Found Website',
          },
          reply_to: {
            email: data.email,
            name: `${data.firstName} ${data.lastName}`,
          },
          subject: `New Inquiry from ${data.firstName} ${data.lastName}`,
          content: [
            { type: 'text/plain', value: emailText },
            { type: 'text/html', value: emailHtml },
          ],
        }),
      });

      if (!sendGridResponse.ok) {
        const error = await sendGridResponse.text();
        console.error('SendGrid error:', error);
        return new Response(JSON.stringify({ error: 'Failed to send email' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Server error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
