export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    if (!q || q.length < 1) return Response.json({ features: [] });
    const res = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=7&autocomplete=1`,
      { headers: { 'Accept': 'application/json' } }
    );
    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    return Response.json({ features: [] });
  }
}
