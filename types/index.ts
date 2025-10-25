// ==================== ENUMS ====================

export enum StepType {
  INFO = 'info',
  MULTIPLE_CHOICE = 'multipleChoice',
  YES_NO = 'yesNo',
  STRING_INPUT = 'stringInput',
  REPLAY = 'replay',
  CLOSING = 'closing',
}

export enum DataType {
  FREETEXT = 'freetext',
  NAME = 'name',
  DATE_OF_BIRTH = 'dateOfBirth',
  PHONE = 'phone',
  COUNTRY_CODE = 'countryCode',
  ADDRESS = 'address',
  EMAIL = 'email',
  NUMBER = 'number',
  CUSTOM_ENUM = 'customEnum',
  CUSTOM_DATE = 'customDate',
}

export enum OutputType {
  STRING_QUESTION = 'stringQuestion',
  STRING_INFO = 'stringInfo',
  SINGLE_IMAGE = 'singleImage',
  IMAGE_CAROUSEL = 'imageCarousel',
  LINKS = 'links',
  BUTTON_LIST = 'buttonList',
}

export enum FormStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum SubmissionStatus {
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

export enum ConditionalOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'notContains',
  GREATER_THAN = 'greaterThan',
  LESS_THAN = 'lessThan',
  GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual',
  LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
  IN = 'in',
  NOT_IN = 'notIn',
}

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
}

export enum FormActionType {
  EMAIL = 'email',
  API = 'api',
}

export enum HttpMethod {
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
}

// ==================== STEP COMPONENTS ====================

export interface MediaItem {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
}

export interface LinkItem {
  id: string;
  text: string;
  url: string;
  openInNewTab?: boolean;
}

export interface ChoiceOption {
  id: string;
  label: string;
  value: string | number | boolean;
  redirectUrl?: string;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: number | string;
  message: string;
}

export interface Condition {
  variableName: string;
  operator: ConditionalOperator;
  value: any;
}

export interface ConditionalLogic {
  showIf: Condition[];
  operator: LogicalOperator;
}

export interface NextStepRule {
  conditions: Condition[];
  operator: LogicalOperator;
  targetStepId: string;
}

export interface DisplayContent {
  messages: {
    text: string;
    delay?: number; // in milliseconds
  }[];
  media?: {
    type: 'image' | 'carousel' | 'video';
    items: MediaItem[];
  };
  links?: LinkItem[];
}

export interface InputConfig {
  type: 'text' | 'choice' | 'none';
  dataType?: DataType;
  choices?: ChoiceOption[];
  validation?: ValidationRule[];
  placeholder?: string;
  helperText?: string;
}

export interface DataCollection {
  enabled: boolean;
  variableName: string;
  storageKey: string;
  updateExisting?: boolean;
}

export interface TrackingConfig {
  conversionEvent?: string;
  analyticsLabel?: string;
}

// ==================== FORM ACTION TYPES ====================

export interface EmailActionConfig {
  recipients: string[]; // Array of email addresses
}

export interface ApiActionConfig {
  targetUrl: string;
  method: HttpMethod;
  headers: Record<string, string>; // User-configurable headers (e.g., API keys)
}

export type FormActionConfig = EmailActionConfig | ApiActionConfig;

export interface FormAction {
  _id?: string;
  clientId: string;
  name: string;
  description?: string;
  type: FormActionType;
  config: FormActionConfig;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== MAIN TYPES ====================

export interface Step {
  id: string;
  order: number;
  type: StepType;
  outputType: OutputType;

  // Display configuration
  display: DisplayContent;

  // Input configuration
  input?: InputConfig;

  // Data handling
  collect?: DataCollection;

  // Flow control
  conditionalLogic?: ConditionalLogic;
  nextStepOverride?: {
    rules: NextStepRule[];
    default?: string; // default next step ID
  };
  replayTarget?: string; // for REPLAY type: target step ID

  // Tracking
  tracking?: TrackingConfig;

  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

export enum TypingDelay {
  NONE = 'none',
  SHORT = 'short',
  NORMAL = 'normal'
}

export interface FormSettings {
  brandColor?: string;
  backgroundImageUrl?: string;
  useDarkText?: boolean;
  typingDelay?: TypingDelay | string;
  logo?: string;
  welcomeMessage?: string;
  thankYouMessage?: string;
  enableProgressBar?: boolean;
  allowBackNavigation?: boolean;
  emailNotifications?: boolean;
  passwordProtected?: boolean;
  password?: string;
}

export interface Form {
  _id?: string;
  clientId: string;
  name: string;
  description?: string;
  steps: Step[];
  status: FormStatus;
  publicUrl: string;
  settings: FormSettings;
  formActions?: string[]; // Array of FormAction IDs
  createdAt: Date;
  updatedAt: Date;

  // Analytics
  stats?: {
    views: number;
    starts: number;
    completions: number;
    completionRate: number;
    averageTimeToComplete?: number; // in seconds
  };
}

export interface StepAnswer {
  stepId: string;
  answeredAt: Date;
  answer: any;
  variableName?: string;
}

export interface SubmissionMetadata {
  startedAt: Date;
  completedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  conversions: string[]; // array of step IDs that triggered conversions
  timeSpentPerStep: {
    stepId: string;
    seconds: number;
  }[];
}

export interface Submission {
  _id?: string;
  formId: string;
  sessionId: string;
  status: SubmissionStatus;
  data: Record<string, any>; // dynamic key-value pairs
  metadata: SubmissionMetadata;
  stepHistory: StepAnswer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id?: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'client' | 'admin';
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    formsLimit: number;
    submissionsLimit: number;
    validUntil?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ==================== API TYPES ====================

export interface CreateFormRequest {
  name: string;
  description?: string;
}

export interface UpdateFormRequest {
  name?: string;
  description?: string;
  steps?: Step[];
  settings?: FormSettings;
  status?: FormStatus;
}

export interface PublishFormRequest {
  publicUrl?: string; // optional custom URL
}

export interface StartSessionRequest {
  publicUrl: string;
}

export interface StartSessionResponse {
  sessionId: string;
  form: {
    _id: string;
    name: string;
    settings: FormSettings;
  };
  firstStep: Step;
}

export interface SubmitAnswerRequest {
  sessionId: string;
  stepId: string;
  answer: any;
  replayStepId?: string; // if answering a replayed step, the ID of the REPLAY step
}

export interface SubmitAnswerResponse {
  success: boolean;
  nextStep?: Step | null;
  isComplete: boolean;
  errors?: string[];
}

export interface FinalSubmitRequest {
  sessionId: string;
}

export interface FinalSubmitResponse {
  success: boolean;
  submissionId: string;
  redirectUrl?: string;
}

export interface ExportSubmissionsRequest {
  formId: string;
  startDate?: Date;
  endDate?: Date;
  status?: SubmissionStatus;
}

// ==================== CLIENT TYPES ====================

export interface FormBuilderState {
  form: Form | null;
  selectedStepId: string | null;
  isDirty: boolean;
  isSaving: boolean;
}

export interface ChatSession {
  sessionId: string;
  formId: string;
  currentStepIndex: number;
  collectedData: Record<string, any>;
  stepHistory: StepAnswer[];
  isComplete: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ==================== UTILITY TYPES ====================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;
