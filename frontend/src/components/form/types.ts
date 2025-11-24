export type FormAlertVariant = 'success' | 'error' | 'info';

export interface FormAlertAction {
  type: 'link';
  to: string;
  label: string;
}

export interface FormFeedback {
  variant: FormAlertVariant;
  message: string;
  action?: FormAlertAction;
}
