export default function Icon({ name, alt = "", style = {} }) {
  return (
    <span
      role="img"
      aria-label={alt}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url(/icons/${name}.svg)`,
        maskImage: `url(/icons/${name}.svg)`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        ...style,
      }}
    />
  );
}