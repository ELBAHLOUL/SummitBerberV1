export interface GpxPoint {
  lat: number;
  lon: number;
  ele: number;
}

export interface GpxParseResult {
  points: GpxPoint[];
  distance: number; // km
  elevationGain: number; // meters
  elevationProfile: number[];
}

function haversineDistance(pt1: GpxPoint, pt2: GpxPoint): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((pt2.lat - pt1.lat) * Math.PI) / 180;
  const dLon = ((pt2.lon - pt1.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pt1.lat * Math.PI) / 180) *
      Math.cos((pt2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function parseGpxText(gpxText: string): GpxParseResult {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxText, "text/xml");
  const trkpts = xmlDoc.getElementsByTagName("trkpt");
  
  const points: GpxPoint[] = [];
  let distance = 0;
  let elevationGain = 0;

  for (let i = 0; i < trkpts.length; i++) {
    const node = trkpts[i];
    const lat = parseFloat(node.getAttribute("lat") || "0");
    const lon = parseFloat(node.getAttribute("lon") || "0");
    const eleNode = node.getElementsByTagName("ele")[0];
    const ele = eleNode ? parseFloat(eleNode.textContent || "0") : 0;
    points.push({ lat, lon, ele });
  }

  // Calculate stats
  for (let i = 1; i < points.length; i++) {
    distance += haversineDistance(points[i - 1], points[i]);
    const eleDiff = points[i].ele - points[i - 1].ele;
    if (eleDiff > 0) {
      elevationGain += eleDiff;
    }
  }

  // Downsample elevation profile to max 40 points for neat charts
  const profileSteps = 40;
  const elevationProfile: number[] = [];
  if (points.length > 0) {
    const step = Math.max(1, Math.floor(points.length / profileSteps));
    for (let i = 0; i < points.length; i += step) {
      elevationProfile.push(points[i].ele);
    }
  }

  return {
    points,
    distance: parseFloat(distance.toFixed(2)),
    elevationGain: Math.round(elevationGain),
    elevationProfile,
  };
}

// Generate a dummy GPX file content string for testing
export function generateSampleGpx(routeType: "toubkal" | "mgoun" | "gorge"): { filename: string; content: string } {
  let name = "toubkal_summit.gpx";
  let minEle = 3200;
  let maxEle = 4167;
  let length = 100;
  let startLat = 31.06;
  let startLon = -7.91;

  if (routeType === "mgoun") {
    name = "mgoun_ridge.gpx";
    minEle = 2900;
    maxEle = 4068;
    length = 150;
    startLat = 31.51;
    startLon = -6.22;
  } else if (routeType === "gorge") {
    name = "todra_gorge_circuit.gpx";
    minEle = 1500;
    maxEle = 1950;
    length = 80;
    startLat = 31.55;
    startLon = -5.59;
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="SummitBerber Simulator" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${name}</name>
  </metadata>
  <trk>
    <name>${name.replace(".gpx", "").replace(/_/g, " ").toUpperCase()}</name>
    <trkseg>`;

  for (let i = 0; i < length; i++) {
    const pct = i / (length - 1);
    const lat = startLat + pct * 0.05 + Math.sin(pct * Math.PI) * 0.01;
    const lon = startLon + pct * 0.05;
    // Bell curve style elevation
    const elevation = minEle + (maxEle - minEle) * Math.sin(pct * Math.PI) + Math.sin(pct * Math.PI * 10) * 15;
    xml += `
      <trkpt lat="${lat.toFixed(6)}" lon="${lon.toFixed(6)}">
        <ele>${elevation.toFixed(1)}</ele>
      </trkpt>`;
  }

  xml += `
    </trkseg>
  </trk>
</gpx>`;

  return { filename: name, content: xml };
}
