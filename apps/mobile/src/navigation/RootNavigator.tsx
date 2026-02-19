import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import {
  getCurrentConfig,
  getUserProfile,
  onAuthChange,
} from '../services/api';
import { useAppStore } from '../store/appStore';
import type { AuthStackParamList, HomeStackParamList, RootTabParamList } from './types';
import { RoleSelectScreen } from '../screens/auth/RoleSelectScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { HomeScreen } from '../screens/customer/HomeScreen';
import { SearchScreen } from '../screens/customer/SearchScreen';
import { ProjectsListScreen } from '../screens/customer/ProjectsListScreen';
import { CreateProjectScreen } from '../screens/customer/CreateProjectScreen';
import { ContractorProfileScreen } from '../screens/contractor/ContractorProfileScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { EditProfileScreen } from '../screens/shared/EditProfileScreen';
import { DocumentsScreen } from '../screens/shared/DocumentsScreen';
import { NotificationsScreen } from '../screens/shared/NotificationsScreen';
import { PaymentMethodsScreen } from '../screens/shared/PaymentMethodsScreen';
import { ProjectDetailScreen } from '../screens/shared/ProjectDetailScreen';
import { MessagesScreen } from '../screens/shared/MessagesScreen';
import { HistoryScreen } from '../screens/shared/HistoryScreen';
import { SettingsScreen } from '../screens/shared/SettingsScreen';
import { QuotesCompareScreen } from '../screens/shared/QuotesCompareScreen';
import { AgreementReviewScreen } from '../screens/shared/AgreementReviewScreen';
import { FundEscrowScreen } from '../screens/shared/FundEscrowScreen';
import { CompletionReviewScreen } from '../screens/shared/CompletionReviewScreen';
import { JointReleaseScreen } from '../screens/shared/JointReleaseScreen';
import { ResolutionSubmissionScreen } from '../screens/shared/ResolutionSubmissionScreen';
import { ReviewSubmissionScreen } from '../screens/shared/ReviewSubmissionScreen';
import { RecommendationsScreen } from '../screens/shared/RecommendationsScreen';
import { AvailabilityScreen } from '../screens/contractor/AvailabilityScreen';
import { EarningsScreen } from '../screens/contractor/EarningsScreen';
import { SubmitQuoteScreen } from '../screens/contractor/SubmitQuoteScreen';
import { TabBarIcon } from '../components/TabBarIcon';
import { colors } from '../theme/tokens';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const SearchStack = createNativeStackNavigator<HomeStackParamList>();
const ProjectsStack = createNativeStackNavigator<HomeStackParamList>();
const ProfileStack = createNativeStackNavigator<HomeStackParamList>();
const Tabs = createBottomTabNavigator<RootTabParamList>();
type Translate = (key: string) => string;

const sharedScreenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.textPrimary,
  contentStyle: { backgroundColor: colors.background },
};

type AppStack = ReturnType<typeof createNativeStackNavigator<HomeStackParamList>>;

function FlowScreens(Stack: AppStack, t: Translate): React.JSX.Element {
  return (
    <>
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: t('project.detailTitle') }} />
      <Stack.Screen name="CreateProject" component={CreateProjectScreen} options={{ title: t('project.create.title') }} />
      <Stack.Screen name="SubmitQuote" component={SubmitQuoteScreen} options={{ title: t('quote.submit') }} />
      <Stack.Screen name="QuotesCompare" component={QuotesCompareScreen} options={{ title: t('quote.compare') }} />
      <Stack.Screen name="AgreementReview" component={AgreementReviewScreen} options={{ title: t('agreement.title') }} />
      <Stack.Screen name="FundEscrow" component={FundEscrowScreen} options={{ title: t('escrow.fund') }} />
      <Stack.Screen name="CompletionReview" component={CompletionReviewScreen} options={{ title: t('escrow.approveCompletion') }} />
      <Stack.Screen name="JointRelease" component={JointReleaseScreen} options={{ title: t('escrow.jointRelease') }} />
      <Stack.Screen name="ResolutionSubmission" component={ResolutionSubmissionScreen} options={{ title: t('escrow.resolutionUpload') }} />
      <Stack.Screen name="ReviewSubmission" component={ReviewSubmissionScreen} options={{ title: t('reviews.submit') }} />
      <Stack.Screen name="Messages" component={MessagesScreen} options={{ title: t('messaging.title') }} />
      <Stack.Screen name="History" component={HistoryScreen} options={{ title: t('history.title') }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings.title') }} />
      <Stack.Screen name="Availability" component={AvailabilityScreen} options={{ title: t('availability.title') }} />
      <Stack.Screen name="Earnings" component={EarningsScreen} options={{ title: t('earnings.title') }} />
      <Stack.Screen name="Recommendations" component={RecommendationsScreen} options={{ title: t('phase2.recommendationsTitle') }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: t('settings.notifications') }} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ title: t('settings.paymentMethods') }} />
    </>
  );
}

function HomeStackNavigator(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <HomeStack.Navigator screenOptions={sharedScreenOptions}>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: t('nav.home') }} />
      {FlowScreens(HomeStack, t)}
    </HomeStack.Navigator>
  );
}

function SearchStackNavigator(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <SearchStack.Navigator screenOptions={sharedScreenOptions}>
      <SearchStack.Screen name="Search" component={SearchScreen} options={{ title: t('nav.search') }} />
      <SearchStack.Screen name="ContractorProfile" component={ContractorProfileScreen} options={{ title: t('contractor.verifiedPortfolio') }} />
      {FlowScreens(SearchStack, t)}
    </SearchStack.Navigator>
  );
}

function ProjectsStackNavigator(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <ProjectsStack.Navigator screenOptions={sharedScreenOptions}>
      <ProjectsStack.Screen name="ProjectsList" component={ProjectsListScreen} options={{ title: t('nav.projects') }} />
      {FlowScreens(ProjectsStack, t)}
    </ProjectsStack.Navigator>
  );
}

function ProfileStackNavigator(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <ProfileStack.Navigator screenOptions={sharedScreenOptions}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: t('nav.profile') }} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: t('profile.edit') }} />
      <ProfileStack.Screen name="Documents" component={DocumentsScreen} options={{ title: t('profile.documents') }} />
      {FlowScreens(ProfileStack, t)}
    </ProfileStack.Navigator>
  );
}

function MainTabs(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarIcon: ({ focused }) => {
          const iconName =
            route.name === 'HomeTab'
              ? 'home-outline'
              : route.name === 'SearchTab'
              ? 'search-outline'
              : route.name === 'ProjectsTab'
              ? 'briefcase-outline'
              : 'person-outline';
          return <TabBarIcon focused={focused} name={iconName} />;
        },
      })}
    >
      <Tabs.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: t('nav.home'), tabBarTestID: 'tab-home' }}
      />
      <Tabs.Screen
        name="SearchTab"
        component={SearchStackNavigator}
        options={{ title: t('nav.search'), tabBarTestID: 'tab-search' }}
      />
      <Tabs.Screen
        name="ProjectsTab"
        component={ProjectsStackNavigator}
        options={{ title: t('nav.projects'), tabBarTestID: 'tab-projects' }}
      />
      <Tabs.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ title: t('nav.profile'), tabBarTestID: 'tab-profile' }}
      />
    </Tabs.Navigator>
  );
}

export function RootNavigator(): React.JSX.Element {
  const { t } = useTranslation();
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const setRole = useAppStore((s) => s.setRole);
  const setProfile = useAppStore((s) => s.setProfile);
  const setFeatureFlags = useAppStore((s) => s.setFeatureFlags);
  const clearSession = useAppStore((s) => s.clearSession);
  const [hydrating, setHydrating] = React.useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      if (!authUser) {
        clearSession();
        setHydrating(false);
        return;
      }

      setUser(authUser);
      setHydrating(true);

      void (async () => {
        try {
          const [profile, config] = await Promise.all([getUserProfile(authUser.uid), getCurrentConfig()]);
          if (profile) {
            setProfile(profile);
            setRole(profile.role);
          }
          setFeatureFlags(config.featureFlags);
        } catch {
          // keep app usable even if hydration fails
        } finally {
          setHydrating(false);
        }
      })();
    });

    return unsubscribe;
  }, [clearSession, setFeatureFlags, setProfile, setRole, setUser]);

  if (!user) {
    return (
      <AuthStack.Navigator screenOptions={sharedScreenOptions}>
        <AuthStack.Screen name="RoleSelect" component={RoleSelectScreen} options={{ headerShown: false }} />
        <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: t('auth.loginTitle') }} />
        <AuthStack.Screen name="Register" component={RegisterScreen} options={{ title: t('auth.registerTitle') }} />
      </AuthStack.Navigator>
    );
  }

  if (hydrating) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.navy} />
      </View>
    );
  }

  return <MainTabs />;
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
