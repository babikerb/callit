import { Image } from 'expo-image';
import { MapPin } from 'lucide-react-native';
import { memo, useMemo, useState } from 'react';
import { View, type ViewStyle } from 'react-native';

import { colors, palette } from '@/theme/tokens';

type StaticMapProps = {
  latitude: number;
  longitude: number;
  zoom?: number;
  style?: ViewStyle;
};

const TILE = 256;

function lonToTileX(lon: number, z: number) {
  return ((lon + 180) / 360) * 2 ** z;
}
function latToTileY(lat: number, z: number) {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z;
}

/**
 * Reliable static map from raw OpenStreetMap tiles (keyless), centered on the
 * coordinate with a pin. Renders just enough tiles to fill the measured area.
 */
function StaticMapImpl({ latitude, longitude, zoom = 14, style }: StaticMapProps) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  const tiles = useMemo(() => {
    const { w, h } = size;
    if (!w || !h) return [];
    const n = 2 ** zoom;
    const offX = w / 2 - lonToTileX(longitude, zoom) * TILE;
    const offY = h / 2 - latToTileY(latitude, zoom) * TILE;
    const out: { key: string; left: number; top: number; uri: string }[] = [];
    for (let tx = Math.floor(-offX / TILE); tx <= Math.floor((w - offX) / TILE); tx++) {
      for (let ty = Math.floor(-offY / TILE); ty <= Math.floor((h - offY) / TILE); ty++) {
        if (ty < 0 || ty >= n) continue;
        const wx = ((tx % n) + n) % n;
        out.push({
          key: `${tx}_${ty}`,
          left: tx * TILE + offX,
          top: ty * TILE + offY,
          // CARTO "dark matter" basemap: clean, Apple-Maps-dark style (retina @2x).
          uri: `https://a.basemaps.cartocdn.com/dark_all/${zoom}/${wx}/${ty}@2x.png`,
        });
      }
    }
    return out;
  }, [size, latitude, longitude, zoom]);

  return (
    <View
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      style={[{ overflow: 'hidden', backgroundColor: colors.surface }, style]}>
      {tiles.map((t) => (
        <Image
          key={t.key}
          source={{ uri: t.uri }}
          style={{ position: 'absolute', width: TILE, height: TILE, left: t.left, top: t.top }}
          cachePolicy="disk"
          transition={150}
        />
      ))}
      {size.w > 0 ? (
        <View style={{ position: 'absolute', left: size.w / 2 - 16, top: size.h / 2 - 30 }}>
          <MapPin size={32} color={palette.pink} fill={palette.pink} strokeWidth={1.5} />
        </View>
      ) : null}
    </View>
  );
}

export const StaticMap = memo(StaticMapImpl);

export default StaticMap;
