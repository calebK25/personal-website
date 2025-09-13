export default function Head() {
  return (
    <>
      <link rel="icon" href="/favicon" type="image/png" />
      <link rel="shortcut icon" href="/favicon" type="image/png" />
      <link rel="apple-touch-icon" href="/favicon" />
      {/* Preload paper texture to avoid late paint */}
      <link rel="preload" as="image" href="/White%20Concrete%20Background.jpg" />
    </>
  );
}


