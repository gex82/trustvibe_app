import React from 'react';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { colors, radii } from '../theme/tokens';

type Props = {
  source?: ImageSourcePropType;
  uri?: string | null;
  name?: string | null;
  size?: number;
};

function initials(name: string | null | undefined): string {
  if (!name) {
    return '?';
  }
  const parts = name.split(' ').filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ source, uri, name, size = 56 }: Props): React.JSX.Element {
  if (source) {
    return <Image source={source} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} />;
  }

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} />;
  }

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.fallbackText}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  fallback: {
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  fallbackText: {
    color: colors.navyDark,
    fontSize: 16,
    fontWeight: '700',
  },
});
