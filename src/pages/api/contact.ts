import type { APIRoute } from 'astro';

export const POST: APIRoute = () => Response.json({
  error: 'Das Kontaktformular befindet sich bei DriveLab.',
  url: 'https://drivelab.ch/kontakt/'
}, {status: 410, headers: {'Cache-Control': 'no-store'}});
