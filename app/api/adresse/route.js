export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const limit = searchParams.get('limit') || '6';

    if (!q || q.length < 1) {
      return Response.json({ features: [] });
    }

    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=${limit}&autocomplete=1`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      return Response.json({ features: [] });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error('Address proxy error:', error);
    return Response.json({ features: [] });
  }
}
