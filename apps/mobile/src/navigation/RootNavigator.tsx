import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';
import { onAuthChange } from '../services/api';
import type { AuthStackParamList, HomeStackParamList, RootTabParamList } from './types';
import { RoleSelectScreen } from '../screens/auth/RoleSelectScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { HomeScreen } from '../screens/customer/HomeScreen';
import { CreateProjectScreen } from '../screens/customer/CreateProjectScreen';
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
import { AvailabilityScreen } from '../screens/contractor/AvailabilityScreen';
import { EarningsScreen } from '../screens/contractor/EarningsScreen';
import { RecommendationsScreen } from '../screens/shared/RecommendationsScreen';
import { colors } from '../theme/tokens';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const Tabs = createBottomTabNavigator<RootTabParamList>();

function HomeStackNavigator(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgCard },
        headerTintColor: colors.textPrimary,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: t('project.openForQuotes') }} />
      <HomeStack.Screen name="CreateProject" component={CreateProjectScreen} options={{ title: t('project.create.title') }} />
      <HomeStack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: t('common.status') }} />
      <HomeStack.Screen name="QuotesCompare" component={QuotesCompareScreen} options={{ title: t('quote.compare') }} />
      <HomeStack.Screen name="AgreementReview" component={AgreementReviewScreen} options={{ title: t('agreement.title') }} />
      <HomeStack.Screen name="FundEscrow" component={FundEscrowScreen} options={{ title: t('escrow.fund') }} />
      <HomeStack.Screen name="CompletionReview" component={CompletionReviewScreen} options={{ title: t('escrow.approveCompletion') }} />
      <HomeStack.Screen name="JointRelease" component={JointReleaseScreen} options={{ title: t('escrow.jointRelease') }} />
      <HomeStack.Screen name="ResolutionSubmission" component={ResolutionSubmissionScreen} options={{ title: t('escrow.resolutionUpload') }} />
      <HomeStack.Screen name="ReviewSubmission" component={ReviewSubmissionScreen} options={{ title: t('reviews.submit') }} />
      <HomeStack.Screen name="Availability" component={AvailabilityScreen} options={{ title: t('availability.title') }} />
      <HomeStack.Screen name="Recommendations" component={RecommendationsScreen} options={{ title: t('phase2.recommendationsTitle') }} />
    </HomeStack.Navigator>
  );
}

function MainTabs(): React.JSX.Element {
  const { t } = useTranslation();
  const role = useAppStore((s) => s.role);

  return (
    <Tabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgCard },
        headerTintColor: colors.textPrimary,
        tabBarStyle: { backgroundColor: colors.bgCard },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen name="Projects" component={HomeStackNavigator} options={{ headerShown: false, title: t('project.openForQuotes') }} />
      <Tabs.Screen name="Messages" component={MessagesScreen} options={{ title: t('messaging.title') }} />
      <Tabs.Screen name="History" component={HistoryScreen} options={{ title: t('history.title') }} />
      {role === 'contractor' ? <Tabs.Screen name="Earnings" component={EarningsScreen} options={{ title: t('earnings.title') }} /> : null}
      <Tabs.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings.title') }} />
    </Tabs.Navigator>
  );
}

export function RootNavigator(): React.JSX.Element {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
    });

    return unsubscribe;
  }, [setUser]);

  if (!user) {
    return (
      <AuthStack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.bgCard },
          headerTintColor: colors.textPrimary,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <AuthStack.Screen name="RoleSelect" component={RoleSelectScreen} options={{ headerShown: false }} />
        <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <AuthStack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      </AuthStack.Navigator>
    );
  }

  return <MainTabs />;
}
