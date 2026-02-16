import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { getDoc, doc } from 'firebase/firestore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { CredentialRow } from '../../components/CredentialRow';
import { PhotoGallery } from '../../components/PhotoGallery';
import { CTAButton } from '../../components/CTAButton';
import { Card } from '../../components/Card';
import { db } from '../../services/firebase';
import type { HomeStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/tokens';
import { demoAvatars, demoProjectPhotos } from '../../assets/demoAssets';

type Props = NativeStackScreenProps<HomeStackParamList, 'ContractorProfile'>;

type ContractorView = {
  contractorId: string;
  name: string;
  rating: number;
  projects: string;
  license: string;
  avatarUrl?: string;
  avatarSource?: ImageSourcePropType;
  portfolio: Array<string | ImageSourcePropType>;
};

const demoPortfolioMap: Record<string, ImageSourcePropType> = {
  'demo://projects/bathroom_remodel_01.png': demoProjectPhotos[0],
  'demo://projects/bathroom_remodel_02.png': demoProjectPhotos[1],
  'demo://projects/bathroom_remodel_03.png': demoProjectPhotos[2],
  'demo://projects/kitchen_remodel_01.png': demoProjectPhotos[3],
  'demo://projects/kitchen_remodel_02.png': demoProjectPhotos[4],
  'demo://projects/concrete_driveway_01.png': demoProjectPhotos[5],
};

function resolvePortfolioAsset(value: string): string | ImageSourcePropType | null {
  if (demoPortfolioMap[value]) {
    return demoPortfolioMap[value];
  }
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  return null;
}

const fallbackProfile: ContractorView = {
  contractorId: 'contractor-013',
  name: "Juan's Services",
  rating: 4.9,
  projects: '50+',
  license: 'DACO #12345',
  avatarSource: demoAvatars.juan,
  portfolio: demoProjectPhotos,
};

export function ContractorProfileScreen({ route, navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const [profile, setProfile] = React.useState<ContractorView>(fallbackProfile);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const contractorId = route.params?.contractorId;
    if (!contractorId) {
      setLoading(false);
      return;
    }

    void (async () => {
      try {
        const [userSnap, contractorSnap] = await Promise.all([
          getDoc(doc(db, 'users', contractorId)),
          getDoc(doc(db, 'contractorProfiles', contractorId)),
        ]);
        if (!userSnap.exists() || !contractorSnap.exists()) {
          setLoading(false);
          return;
        }
        const userData = userSnap.data() as any;
        const contractorData = contractorSnap.data() as any;
        const portfolio = Array.isArray(contractorData.portfolio)
          ? contractorData.portfolio
              .map((item: any) => resolvePortfolioAsset(String(item.imageUrl ?? '')))
              .filter(Boolean)
          : [];
        setProfile({
          contractorId,
          name: String(userData.name ?? fallbackProfile.name),
          rating: Number(contractorData.ratingAvg ?? fallbackProfile.rating),
          projects: `${Number(contractorData.reviewCount ?? 50)}+`,
          license: 'DACO #12345',
          avatarUrl: typeof userData.avatarUrl === 'string' ? userData.avatarUrl : undefined,
          avatarSource: contractorId === 'contractor-001' ? demoAvatars.juan : undefined,
          portfolio: portfolio.length ? portfolio : fallbackProfile.portfolio,
        });
      } catch {
        setProfile(fallbackProfile);
      } finally {
        setLoading(false);
      }
    })();
  }, [route.params?.contractorId]);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Text testID="contractor-profile-title" style={styles.screenTitle}>{t('contractor.verifiedPortfolio')}</Text>
        <Card>
          <View style={styles.header}>
            <Avatar name={profile.name} uri={profile.avatarUrl} source={profile.avatarSource} size={84} />
            <View style={styles.headerInfo}>
              <Badge label={t('contractor.verifiedPro')} />
              <Text style={styles.name}>{profile.name}</Text>
            </View>
          </View>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profile.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>{t('contractor.ratingLabel')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profile.projects}</Text>
              <Text style={styles.statLabel}>{t('contractor.projectsLabel')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>DACO</Text>
              <Text style={styles.statLabel}>{t('contractor.licenseLabel', { license: profile.license })}</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>{t('contractor.credentialsTitle')}</Text>
        <CredentialRow title={t('contractor.licenseAndCerts')} subtitle={t('contractor.verified')} iconName="document-text-outline" />
        <CredentialRow title={t('contractor.generalLiability')} subtitle={t('contractor.coverageVerified')} iconName="shield-checkmark-outline" />

        <Text style={styles.sectionTitle}>{t('contractor.featuredProjects')}</Text>
        <PhotoGallery photos={profile.portfolio} />

        <CTAButton
          testID="contractor-profile-request-quote"
          label={loading ? t('common.loading') : t('contractor.requestQuote')}
          onPress={() => {
            Alert.alert(t('common.status'), t('contractor.requestQuoteHint'));
            navigation.navigate('CreateProject');
          }}
          disabled={loading}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  screenTitle: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '800',
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '800',
  },
  stats: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 25,
    fontWeight: '800',
  },
});
