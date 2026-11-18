/**
 * Vidéos associées aux gammes (intégration YouTube officielle, autorisée par l'auteur de la vidéo).
 * Aucune vidéo n'est copiée sur le site : elle reste hébergée et lue depuis YouTube.
 */
export interface LineVideo {
  youtubeId: string;
  title: string;
  /** Chaîne YouTube qui publie la vidéo (crédit affiché sous le lecteur). */
  channel: string;
  channelUrl: string;
  /** Précision affichée sous la vidéo. */
  note: string;
}

export const LINE_VIDEOS: Record<string, LineVideo> = {
  // Vidéo explicative générale sur le musc Tahara (les flacons montrés ne sont pas ceux de Gris Montaigne).
  'Musc Tahara': {
    youtubeId: '2sYo9yZ3Q68',
    title: 'Tout sur le Musc Tahara',
    channel: 'MUSC TAHARA INTIME',
    channelUrl: 'https://www.youtube.com/@MuscTahara',
    note: 'Vidéo explicative sur le musc Tahara en général : les flacons présentés peuvent différer de ceux de notre gamme.',
  },
};

export function videoForLine(line: string | null | undefined): LineVideo | null {
  return line ? LINE_VIDEOS[line] ?? null : null;
}
