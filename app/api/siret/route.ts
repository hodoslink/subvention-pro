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
      const complements = r.complements || {};
      return {
        nom: r.nom_complet || r.nom_raison_sociale || '',
        siren: r.siren,
        siret: siege.siret,
        // Le RNA n'est pas systématiquement renseigné dans cette base :
        // toujours proposer le lien de vérification à côté, jamais l'affirmer à 100%.
        rna: complements.identifiant_association || null,
        adresse: siege.adresse || '',
        code_postal: siege.code_postal || '',
        ville: siege.libelle_commune || '',
        forme_juridique: r.nature_juridique || '',
        date_creation: r.date_creation || null,
        est_association: complements.est_association ?? null,
        // Dirigeants déclarés au RNE — peuvent être incomplets ou non à jour,
        // donc à vérifier plutôt qu'à utiliser tel quel pour la liste officielle.
        dirigeants: (r.dirigeants || [])
          .filter((d: any) => d.type_dirigeant === 'personne physique')
          .map((d: any) => ({
            nom: d.nom || '',
            prenoms: d.prenoms || '',
            qualite: d.qualite || '',
          })),
      };
    });

    return NextResponse.json({ results });
  } catch (e) {
    return NextResponse.json({ results: [], error: 'fetch_failed' }, { status: 200 });
  }
}

