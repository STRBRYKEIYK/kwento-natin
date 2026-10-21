import { m, useReducedMotion } from 'framer-motion';

export function Reveal({ children, className = '', as = 'div', ...props }) {
  const reduced = useReducedMotion();
  const Component = as === 'p' ? m.p : as === 'blockquote' ? m.blockquote : m.div;
  return <Component className={className}
    initial={reduced ? false : { opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: .12 }}
    transition={{ duration: reduced ? 0 : .55, ease: [.22, 1, .36, 1] }} {...props}>{children}</Component>;
}
