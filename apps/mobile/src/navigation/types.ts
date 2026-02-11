export type AuthStackParamList = {
  RoleSelect: undefined;
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  CreateProject: undefined;
  ProjectDetail: { projectId: string };
  QuotesCompare: { projectId: string };
  AgreementReview: { projectId: string };
  FundEscrow: { projectId: string };
  CompletionReview: { projectId: string };
  JointRelease: { projectId: string };
  ResolutionSubmission: { projectId: string };
  ReviewSubmission: { projectId: string };
  Availability: undefined;
  Recommendations: undefined;
};

export type RootTabParamList = {
  Projects: undefined;
  Messages: undefined;
  History: undefined;
  Earnings: undefined;
  Settings: undefined;
};
