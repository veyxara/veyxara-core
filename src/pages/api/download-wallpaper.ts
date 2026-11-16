import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const urlParam = new URL(request.url).searchParams.get('url');

  if (!urlParam) {
    return new Response(JSON.stringify({ success: false, error: 'URL de imagen no proporcionada.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const parsedUrl = new URL(urlParam);
    
    // Validación estricta de seguridad: solo permitir dominios de Pinterest
    if (!parsedUrl.hostname.includes('pinimg.com')) {
      return new Response(JSON.stringify({ success: false, error: 'Dominio de origen no permitido.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Petición server-to-server con User-Agent para evitar bloqueos del CDN de Pinterest
    const imageResponse = await fetch(urlParam, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 VeyxaraCore/1.0',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });

    if (!imageResponse.ok) {
      console.error(`[Pinterest CDN Error] Status: ${imageResponse.status} para URL: ${urlParam}`);
      return new Response(JSON.stringify({ success: false, error: 'No se pudo recuperar el archivo del recurso remoto.' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    // Extraer un nombre de archivo limpio o asignar uno por defecto basado en el hash
    const pathSegments = parsedUrl.pathname.split('/');
    const rawFileName = pathSegments[pathSegments.length - 1];
    const fileName = rawFileName.includes('.') ? rawFileName : 'veyxara-wallpaper.jpg';

    // Retornar el binario con las cabeceras requeridas para forzar la descarga local en el cliente
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000',
      },
    });

  } catch (err) {
    console.error('[Veyxara Proxy Exception]', err);
    return new Response(JSON.stringify({ success: false, error: 'Error interno procesando la descarga del wallpaper.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};