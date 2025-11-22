import type { APIRoute } from 'astro';

// Validierung der Eingabedaten
function validateContactData(data: any) {
  const errors: string[] = [];

  if (!data.vorname || data.vorname.trim() === '') {
    errors.push('Vorname ist erforderlich');
  }

  if (!data.nachname || data.nachname.trim() === '') {
    errors.push('Nachname ist erforderlich');
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Gültige E-Mail-Adresse ist erforderlich');
  }

  if (!data.nachricht || data.nachricht.trim() === '') {
    errors.push('Nachricht ist erforderlich');
  }

  if (!data.datenschutz) {
    errors.push('Zustimmung zur Datenschutzerklärung ist erforderlich');
  }

  return errors;
}

// Sanitize input to prevent XSS
function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .slice(0, 1000); // Limit length
}

export const POST: APIRoute = async ({ request, locals }) => {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const data = await request.json();

    // Validate input
    const errors = validateContactData(data);
    if (errors.length > 0) {
      return new Response(JSON.stringify({ errors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Sanitize input
    const sanitizedData = {
      vorname: sanitizeInput(data.vorname),
      nachname: sanitizeInput(data.nachname),
      email: sanitizeInput(data.email),
      telefon: data.telefon ? sanitizeInput(data.telefon) : '',
      nachricht: sanitizeInput(data.nachricht),
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || 'unknown'
    };

    // Store in Cloudflare KV (if available)
    try {
      const kv = locals.runtime?.env?.CONTACTS_KV;
      if (kv) {
        const id = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await kv.put(id, JSON.stringify(sanitizedData), {
          expirationTtl: 7776000 // 90 days
        });
      }
    } catch (kvError) {
      console.error('KV storage error:', kvError);
      // Continue even if KV fails - we can still respond successfully
    }

    // Log to console (for debugging)
    console.log('Contact form submission:', sanitizedData);

    // Return success response
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Vielen Dank! Deine Nachricht wurde versendet.' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({ 
      error: 'Es gab einen Fehler beim Verarbeiten deiner Anfrage.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
