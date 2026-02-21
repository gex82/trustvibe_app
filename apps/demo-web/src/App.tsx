import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import PhoneFrame from "./components/layout/PhoneFrame";
import DevSwitcher from "./components/ui/DevSwitcher";

// Auth
import LoginScreen from "./screens/auth/LoginScreen";
import RoleSelectScreen from "./screens/auth/RoleSelectScreen";

// Customer
import CustomerHomeScreen from "./screens/customer/CustomerHomeScreen";
import SearchScreen from "./screens/customer/SearchScreen";
import ContractorProfileScreen from "./screens/customer/ContractorProfileScreen";
import MyProjectsScreen from "./screens/customer/MyProjectsScreen";
import ProjectDetailScreen from "./screens/customer/ProjectDetailScreen";
import FundEscrowScreen from "./screens/customer/FundEscrowScreen";
import ApproveReleaseScreen from "./screens/customer/ApproveReleaseScreen";
import SubmitReviewScreen from "./screens/customer/SubmitReviewScreen";
import MessagesScreen from "./screens/customer/MessagesScreen";
import NewProjectScreen from "./screens/customer/NewProjectScreen";

// Contractor
import ContractorHomeScreen from "./screens/contractor/ContractorHomeScreen";
import BrowseProjectsScreen from "./screens/contractor/BrowseProjectsScreen";
import ProjectBidScreen from "./screens/contractor/ProjectBidScreen";
import MyJobsScreen from "./screens/contractor/MyJobsScreen";
import EarningsScreen from "./screens/contractor/EarningsScreen";
import {
  AgreementReviewScreen,
  AvailabilityScreen,
  DocumentsScreen,
  EditProfileScreen,
  HistoryScreen,
  IssueScreen,
  NotificationsScreen,
  PaymentMethodsScreen,
  ProfileScreen,
  RecommendationsScreen,
  SettingsScreen,
} from "./screens/shared/WorkflowScreens";

// Admin
import AdminDashboardScreen from "./screens/admin/AdminDashboardScreen";
import AdminProjectsScreen from "./screens/admin/AdminProjectsScreen";
import AdminCasesScreen from "./screens/admin/AdminCasesScreen";
import AdminUsersScreen from "./screens/admin/AdminUsersScreen";
import AdminDepositsScreen from "./screens/admin/AdminDepositsScreen";
import AdminReliabilityScreen from "./screens/admin/AdminReliabilityScreen";
import AdminSubscriptionsScreen from "./screens/admin/AdminSubscriptionsScreen";
import AdminConciergeScreen from "./screens/admin/AdminConciergeScreen";
import AdminReviewsScreen from "./screens/admin/AdminReviewsScreen";
import AdminConfigScreen from "./screens/admin/AdminConfigScreen";

function AppRoutes() {
  const { currentUser, hydrating } = useAuth();

  if (hydrating) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        Loading session...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/role" element={<RoleSelectScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="*" element={<Navigate to="/role" replace />} />
      </Routes>
    );
  }

  if (currentUser.role === "customer") {
    return (
      <Routes>
        <Route path="/home" element={<CustomerHomeScreen />} />
        <Route path="/search" element={<SearchScreen />} />
        <Route path="/contractor/:id" element={<ContractorProfileScreen />} />
        <Route path="/projects" element={<MyProjectsScreen />} />
        <Route path="/projects/new" element={<NewProjectScreen />} />
        <Route path="/project/:id" element={<ProjectDetailScreen />} />
        <Route path="/project/:id/quotes" element={<ProjectDetailScreen />} />
        <Route path="/project/:id/agreement" element={<AgreementReviewScreen />} />
        <Route path="/project/:id/fund" element={<FundEscrowScreen />} />
        <Route path="/project/:id/completion" element={<ApproveReleaseScreen />} />
        <Route path="/project/:id/release" element={<ApproveReleaseScreen />} />
        <Route path="/project/:id/review" element={<SubmitReviewScreen />} />
        <Route path="/project/:id/issue" element={<IssueScreen />} />
        <Route path="/messages" element={<MessagesScreen />} />
        <Route path="/history" element={<HistoryScreen />} />
        <Route path="/recommendations" element={<RecommendationsScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/profile/edit" element={<EditProfileScreen />} />
        <Route path="/profile/documents" element={<DocumentsScreen />} />
        <Route path="/notifications" element={<NotificationsScreen />} />
        <Route path="/payment-methods" element={<PaymentMethodsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    );
  }

  if (currentUser.role === "contractor") {
    return (
      <Routes>
        <Route path="/home" element={<ContractorHomeScreen />} />
        <Route path="/browse" element={<BrowseProjectsScreen />} />
        <Route path="/project/:id/bid" element={<ProjectBidScreen />} />
        <Route path="/project/:id" element={<ProjectDetailScreen />} />
        <Route path="/jobs" element={<MyJobsScreen />} />
        <Route path="/earnings" element={<EarningsScreen />} />
        <Route path="/availability" element={<AvailabilityScreen />} />
        <Route path="/messages" element={<MessagesScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/profile/edit" element={<EditProfileScreen />} />
        <Route path="/profile/documents" element={<DocumentsScreen />} />
        <Route path="/history" element={<HistoryScreen />} />
        <Route path="/recommendations" element={<RecommendationsScreen />} />
        <Route path="/notifications" element={<NotificationsScreen />} />
        <Route path="/payment-methods" element={<PaymentMethodsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    );
  }

  // Admin
  return (
    <Routes>
      <Route path="/admin" element={<AdminDashboardScreen />} />
      <Route path="/admin/users" element={<AdminUsersScreen />} />
      <Route path="/admin/projects" element={<AdminProjectsScreen />} />
      <Route path="/admin/cases" element={<AdminCasesScreen />} />
      <Route path="/admin/deposits" element={<AdminDepositsScreen />} />
      <Route path="/admin/reliability" element={<AdminReliabilityScreen />} />
      <Route path="/admin/subscriptions" element={<AdminSubscriptionsScreen />} />
      <Route path="/admin/concierge" element={<AdminConciergeScreen />} />
      <Route path="/admin/reviews" element={<AdminReviewsScreen />} />
      <Route path="/admin/config" element={<AdminConfigScreen />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <>
      <PhoneFrame>
        <AppRoutes />
      </PhoneFrame>
      <DevSwitcher />
    </>
  );
}
