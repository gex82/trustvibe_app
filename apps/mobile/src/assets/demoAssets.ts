import type { ImageSourcePropType } from 'react-native';

export const demoAvatars: Record<'maria' | 'juan', ImageSourcePropType> = {
  maria: require('../../assets/demo/avatars/maria_rodriguez.png'),
  juan: require('../../assets/demo/avatars/juan_services.png'),
};

export const demoImportedContractorAvatars: ImageSourcePropType[] = [
  require('../../assets/demo/avatars/contractor_mock_01.jpg'),
  require('../../assets/demo/avatars/contractor_mock_02.jpg'),
  require('../../assets/demo/avatars/contractor_mock_03.jpg'),
  require('../../assets/demo/avatars/contractor_mock_04.jpg'),
];

export const demoProjectPhotos: ImageSourcePropType[] = [
  require('../../assets/demo/projects/bathroom_remodel_01.png'),
  require('../../assets/demo/projects/bathroom_remodel_02.png'),
  require('../../assets/demo/projects/bathroom_remodel_03.png'),
  require('../../assets/demo/projects/kitchen_remodel_01.png'),
  require('../../assets/demo/projects/kitchen_remodel_02.png'),
  require('../../assets/demo/projects/concrete_driveway_01.png'),
];

export const demoImportedJobPhotos: ImageSourcePropType[] = [
  require('../../assets/demo/projects/job_mock_01_before.jpg'),
  require('../../assets/demo/projects/job_mock_01_after.jpg'),
  require('../../assets/demo/projects/job_mock_02_before.jpg'),
  require('../../assets/demo/projects/job_mock_02_after.jpg'),
  require('../../assets/demo/projects/job_mock_03_before.jpg'),
  require('../../assets/demo/projects/job_mock_03_after.jpg'),
  require('../../assets/demo/projects/job_mock_04_showcase.jpg'),
];

export const demoProjectPhotosByCategory: Record<'bathroom' | 'kitchen' | 'concreteDriveway', ImageSourcePropType[]> = {
  bathroom: demoProjectPhotos.slice(0, 3),
  kitchen: demoProjectPhotos.slice(3, 5),
  concreteDriveway: demoProjectPhotos.slice(5),
};

export const demoContractorAvatarById: Record<string, ImageSourcePropType> = {
  'contractor-001': demoImportedContractorAvatars[0],
  'contractor-013': demoImportedContractorAvatars[1],
  'contractor-012': demoImportedContractorAvatars[2],
  'contractor-011': demoImportedContractorAvatars[3],
};

const demoProjectPhotoByUri: Record<string, ImageSourcePropType> = {
  'demo://projects/bathroom_remodel_01.png': demoProjectPhotos[0],
  'demo://projects/bathroom_remodel_02.png': demoProjectPhotos[1],
  'demo://projects/bathroom_remodel_03.png': demoProjectPhotos[2],
  'demo://projects/kitchen_remodel_01.png': demoProjectPhotos[3],
  'demo://projects/kitchen_remodel_02.png': demoProjectPhotos[4],
  'demo://projects/concrete_driveway_01.png': demoProjectPhotos[5],
  'demo://projects/job_mock_01_before.jpg': demoImportedJobPhotos[0],
  'demo://projects/job_mock_01_after.jpg': demoImportedJobPhotos[1],
  'demo://projects/job_mock_02_before.jpg': demoImportedJobPhotos[2],
  'demo://projects/job_mock_02_after.jpg': demoImportedJobPhotos[3],
  'demo://projects/job_mock_03_before.jpg': demoImportedJobPhotos[4],
  'demo://projects/job_mock_03_after.jpg': demoImportedJobPhotos[5],
  'demo://projects/job_mock_04_showcase.jpg': demoImportedJobPhotos[6],
};

export function resolveDemoProjectImageUri(uri: string): ImageSourcePropType | undefined {
  return demoProjectPhotoByUri[uri];
}

export const demoBranding: Record<'logoPrimary' | 'splashLight', ImageSourcePropType> = {
  logoPrimary: require('../../assets/demo/branding/logo_variant_primary.png'),
  splashLight: require('../../assets/demo/branding/splash_variant_light.png'),
};
