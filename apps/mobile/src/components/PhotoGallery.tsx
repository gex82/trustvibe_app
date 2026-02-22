import React from 'react';
import { FlatList, Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';

type Props = {
  photos: Array<ImageSourcePropType | string>;
};

function toImageSource(value: ImageSourcePropType | string): ImageSourcePropType {
  if (typeof value === 'string') {
    return { uri: value };
  }
  return value;
}

export function PhotoGallery({ photos }: Props): React.JSX.Element {
  return (
    <FlatList
      horizontal
      data={photos}
      keyExtractor={(_, index) => `photo-${index}`}
      contentContainerStyle={styles.list}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={styles.itemWrap}>
          <Image source={toImageSource(item)} style={styles.image} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  itemWrap: {
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  image: {
    width: 120,
    height: 90,
    resizeMode: 'cover',
    backgroundColor: colors.backgroundSecondary,
  },
});
