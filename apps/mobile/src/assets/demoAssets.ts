import type { ImageSourcePropType } from 'react-native';

export const demoAvatars: Record<'maria' | 'juan', ImageSourcePropType> = {
  maria: require('../../assets/demo/avatars/maria_rodriguez.png'),
  juan: require('../../assets/demo/avatars/juan_services.png'),
};

export const demoProjectPhotos: ImageSourcePropType[] = [
  require('../../assets/demo/projects/bathroom_remodel_01.png'),
  require('../../assets/demo/projects/bathroom_remodel_02.png'),
  require('../../assets/demo/projects/bathroom_remodel_03.png'),
];

export const demoBranding: Record<'logoPrimary' | 'splashLight', ImageSourcePropType> = {
  logoPrimary: require('../../assets/demo/branding/logo_variant_primary.png'),
  splashLight: require('../../assets/demo/branding/splash_variant_light.png'),
};
