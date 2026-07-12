export default function LoadingSpinner({ size = 20 }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-current border-t-transparent"
      style={{ width: size, height: size }}
    />
  );
}
