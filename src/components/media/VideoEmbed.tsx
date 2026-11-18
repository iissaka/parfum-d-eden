'use client';

import { useState } from 'react';
import type { LineVideo } from '@/lib/catalog/product-videos';

/**
 * Lecteur YouTube « léger » : seule la miniature est chargée ; le lecteur (domaine sans cookies
 * youtube-nocookie.com) ne se charge qu'au clic. Plus rapide, et aucun traceur avant l'action du visiteur.
 */
export function VideoEmbed({ video }: { video: LineVideo }) {
  const [playing, setPlaying] = useState(false);

  return (
    <figure>
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink shadow-[0_24px_50px_-28px_rgb(34_34_34/0.6)]">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 h-full w-full"
            aria-label={`Lire la vidéo : ${video.title}`}
          >
            {/* Miniature servie par YouTube : image distante, hors optimisation next/image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" aria-hidden="true" />
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-plum shadow-lg transition duration-300 group-hover:scale-110 group-hover:bg-white md:h-20 md:w-20">
              <span className="absolute inset-0 animate-ping rounded-full bg-white/40 [animation-duration:2.4s]" aria-hidden="true" />
              <svg viewBox="0 0 24 24" className="relative ml-1 h-7 w-7 md:h-8 md:w-8" fill="currentColor" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5-11-6.5Z" />
              </svg>
            </span>
            <span className="absolute bottom-4 left-4 right-4 text-left font-serif text-xl text-white md:text-2xl">{video.title}</span>
          </button>
        )}
      </div>
      <figcaption className="mt-3 text-xs leading-relaxed text-ink-soft">
        Vidéo publiée sur YouTube par{' '}
        <a href={video.channelUrl} target="_blank" rel="noopener noreferrer" className="link">{video.channel}</a>. {video.note}
      </figcaption>
    </figure>
  );
}
