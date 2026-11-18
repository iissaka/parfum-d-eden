import { videoForLine } from '@/lib/catalog/product-videos';
import { Reveal } from '@/components/ui/Reveal';
import { VideoEmbed } from '@/components/media/VideoEmbed';

/** Section « en vidéo » d'une gamme ; ne rend rien si la gamme n'a pas de vidéo. */
export function LineVideoSection({ line, className = '' }: { line: string | null | undefined; className?: string }) {
  const video = videoForLine(line);
  if (!video || !line) return null;

  return (
    <section aria-labelledby="video-gamme" className={className}>
      <Reveal>
        <div className="grid items-center gap-8 rounded-3xl bg-petal-light p-6 md:grid-cols-[1fr_1.4fr] md:p-10">
          <div>
            <p className="eyebrow text-plum">En vidéo</p>
            <h2 id="video-gamme" className="mt-3 font-serif text-3xl leading-tight md:text-4xl">
              Découvrir le {line}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft md:text-base">
              Texture, utilisation, origine : deux minutes pour tout comprendre du musc Tahara avant de choisir
              votre fragrance.
            </p>
          </div>
          <VideoEmbed video={video} />
        </div>
      </Reveal>
    </section>
  );
}
