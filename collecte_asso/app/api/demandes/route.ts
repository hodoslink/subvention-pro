import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from('demandes')
    .insert({
      association_id: body.association_id,
      bailleur_type: body.bailleur_type,
      bailleur_nom: body.bailleur_nom,
      montant_demande: body.montant_demande,
      titre_projet: body.titre_projet,
      objectif_projet: body.objectif_projet,
      public_beneficiaire: body.public_beneficiaire,
      nb_beneficiaires_estime: body.nb_beneficiaires_estime,
      periode_debut: body.periode_debut || null,
      periode_fin: body.periode_fin || null,
      budget_previsionnel_json: body.budget_previsionnel_json || [],
      statut: 'collecte',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from('journal').insert({
    demande_id: data.id,
    evenement: 'demande_creee',
    detail: `Demande créée pour ${body.titre_projet || 'projet sans titre'}`,
  });

  return NextResponse.json({ demande: data });
}
