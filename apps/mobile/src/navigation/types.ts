export type AuthStackParamList = {
  RoleSelect: undefined;
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Search: undefined;
  ProjectsList: undefined;
  ContractorProfile: { contractorId?: string } | undefined;
  Profile: undefined;
  EditProfile: undefined;
  Documents: undefined;
  Notifications: undefined;
  PaymentMethods: undefined;
  CreateProject: undefined;
  ProjectDetail: { projectId: string };
  SubmitQuote: { projectId: string };
  QuotesCompare: { projectId: string };
  AgreementReview: { projectId: string };
  FundEscrow: { projectId: string };
  CompletionReview: { projectId: string };
  JointRelease: { projectId: string };
  ResolutionSubmission: { projectId: string };
  ReviewSubmission: { projectId: string };
  Messages: undefined;
  History: undefined;
  Settings: undefined;
  Earnings: undefined;
  Availability: undefined;
  Recommendations: undefined;
};

export type RootTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  ProjectsTab: undefined;
  ProfileTab: undefined;
};
