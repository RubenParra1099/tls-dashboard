import { neon } from '@neondatabase/serverless';

// Vercel Serverless Function: GET /api/registros (lectura pública de la tabla integrantes)
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ status: 'error', message: 'Método no permitido' });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return res.status(500).json({ status: 'error', message: 'DATABASE_URL no está configurada en el servidor.' });
  }

  try {
    const sql = neon(databaseUrl);
    const rows = await sql`
      SELECT folio, nombre_completo, edad, sexo, telefono, comunidad, registrado_en
      FROM integrantes
      ORDER BY registrado_en DESC
    `;
    return res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error al leer de Neon:', error);
    return res.status(500).json({ status: 'error', message: 'No se pudieron obtener los registros.' });
  }
}
