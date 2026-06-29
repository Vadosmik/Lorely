export function Button({ children, onClick, variant = 'primary', type = 'button' }) {
  const buttonClass = `custom-btn btn-${variant}`;

  return (
    <button type={type} className={buttonClass} onClick={onClick}>
      {children}
    </button>
  );
}