export function openMapsWithDirections(destination: string) {
  const appleMapsUrl = `maps://maps.apple.com/?daddr=${encodeURIComponent(destination)}`;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  const device = useDevice();

  window.open(device.isApple ? appleMapsUrl : googleMapsUrl, "_blank");
}
