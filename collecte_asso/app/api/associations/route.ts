import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from('associations')
    .insert({
      nom: body.nom,
      siret: body.siret,
      siren: body.siren,
      rna: body.rna,
      adresse: body.adresse,
      code_postal: body.code_postal,
      ville: body.ville,
      forme_juridique: body.forme_juridique,
      contact_nom: body.contact_nom,
      contact_role: body.contact_role,
      contact_email: body.contact_email,
      contact_telephone: body.contact_telephone,
      nb_membres: body.nb_membres,
      date_creation: body.date_creation || null,
      iban: body.iban,
      bic: body.bic,
      statut_profil: 'complet',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ association: data });
}
