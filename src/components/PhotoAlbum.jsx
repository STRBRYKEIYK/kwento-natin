import { createContext, useContext } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { assetUrl, photoById } from '../data/content';
import { Icon } from './Icon';

export const PhotoAlbumContext = createContext(null);

export function Photo({ id }) {
  const { colored, onToggle, onZoom } = useContext(PhotoAlbumContext);
  const reduced = useReducedMotion();
  const photo = photoById[id];
  const color = colored.has(photo.src);
  return <m.figure className={`photo photo--${photo.shape} ${color ? 'is-colored' : ''}`}
    initial={reduced ? false : { opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .1 }}
    transition={{ duration: reduced ? 0 : .5 }}>
    <div className="photo-image">
      <img src={assetUrl(photo.src)} alt={photo.alt} loading={id === 'cover' ? 'eager' : 'lazy'} decoding="async" />
      <button className="photo-color" type="button" aria-pressed={color}
        aria-label={`Kulayan o ibalik sa black and white: ${photo.alt}`} onClick={() => onToggle(photo.src)} />
      <m.span className="photo-heart" aria-hidden="true" animate={{ scale: color && !reduced ? [1, 1.25, 1] : 1 }} transition={{ duration: .35 }}>
        <Icon name="heart" size={15} />
      </m.span>
      <button className="photo-zoom icon-button" type="button" aria-label={`Tingnan nang buo: ${photo.alt}`}
        onClick={event => onZoom(id, event.currentTarget)}><Icon name="expand" size={17} /></button>
    </div>
    <figcaption>{photo.caption}</figcaption>
  </m.figure>;
}
