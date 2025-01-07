interface SpinnerProps {
  inline?: boolean;
  size?: number;
}

export default function Spinner({ inline = false, size = 16 }: SpinnerProps) {
  const baseStyles = {
    border: '2px solid lightgray',
    borderTop: '2px solid gray',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    width: `${size}px`,
    height: `${size}px`,
  };

  if (inline) {
    return (
      <div style={{
        ...baseStyles,
        display: 'inline-block',
        verticalAlign: 'middle',
        marginTop: '-2px'
      }} />
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="spinner" style={{
        ...baseStyles,
        width: '50px',
        height: '50px'
      }} />
    </div>
  );
}
