import { NextRequest, NextResponse } from 'next/server';

// API publique gratuite, aucune clé requise : recherche-entreprises.api.gouv.fr
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q || q.trim().length < 3) {
    return NextResponse.json({ results: [] });
  }

  try {
    const res = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(q)}&est_association=true&limite=5`,
      { headers: { Accept: 'application/json' } }
    );

    if (!res.ok) {
      return NextResponse.json({ results: [], error: 'api_error' }, { status: 200 });
    }

    const data = await res.json();

    const results = (data.results || []).map((r: any) => {
      const siege = r.siege || {};
      return {
        nom: r.nom_complet || r.nom_raison_sociale || '',
        siren: r.siren,
        siret: siege.siret,
        adresse: siege.adresse || '',
        code_postal: siege.code_postal || '',
        ville: siege.libelle_commune || '',
        forme_juridique: r.nature_juridique || '',
        date_creation: r.date_creation || null,
      };
    });

    return NextResponse.json({ results });
  } catch (e) {
    return NextResponse.json({ results: [], error: 'fetch_failed' }, { status: 200 });
  }
}
