// Статус заявки на турнир: подпись и вариант Badge из UI kit (src/components/ui/badge.tsx)

export type RegistrationStatusKey = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
export type RegistrationStatusVariant = 'warning' | 'success' | 'destructive' | 'neutral';

export interface RegistrationStatusInfo {
  label: string;
  variant: RegistrationStatusVariant;
}

export const REGISTRATION_STATUS: Record<RegistrationStatusKey, RegistrationStatusInfo> = {
  PENDING: { label: 'На проверке', variant: 'warning' },
  APPROVED: { label: 'Одобрено', variant: 'success' },
  REJECTED: { label: 'Отклонено', variant: 'destructive' },
  WITHDRAWN: { label: 'Отозвано', variant: 'neutral' },
};

export function getRegistrationStatus(status: string): RegistrationStatusInfo {
  return REGISTRATION_STATUS[status as RegistrationStatusKey] ?? { label: status, variant: 'neutral' };
}
