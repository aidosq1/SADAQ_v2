/**
 * Tournament status utilities
 * Provides a unified way to calculate tournament status from dates and flags
 */

export type TournamentStatus =
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export interface TournamentForStatus {
  startDate: string | Date;
  endDate: string | Date;
  isRegistrationOpen?: boolean;
  // Legacy field - will be removed after migration
  isActive?: boolean;
  registrationDeadline?: string | Date | null;
}

/**
 * Calculate tournament status based on dates and registration flags
 *
 * Logic:
 * - Before startDate + registration open → REGISTRATION_OPEN (green)
 * - Before startDate + registration closed → REGISTRATION_CLOSED (yellow)
 * - During tournament (startDate <= now <= endDate) → IN_PROGRESS (blue)
 * - After endDate → COMPLETED (gray)
 *
 * Registration is considered closed if:
 * - isRegistrationOpen is false (manual close)
 * - registrationDeadline has passed (auto close)
 */
export function getTournamentStatus(tournament: TournamentForStatus): TournamentStatus {
  const now = new Date();
  const startDate = new Date(tournament.startDate);
  const endDate = new Date(tournament.endDate);

  // Support both new (isRegistrationOpen) and legacy (isActive) field names
  const isRegistrationOpen = tournament.isRegistrationOpen ?? tournament.isActive ?? true;

  // Check if registration deadline has passed
  const deadlinePassed = tournament.registrationDeadline
    ? now > new Date(tournament.registrationDeadline)
    : false;

  // Registration is closed if manually disabled OR deadline passed
  const registrationClosed = !isRegistrationOpen || deadlinePassed;

  // Tournament completed (after end date/time)
  if (now > endDate) {
    return 'COMPLETED';
  }

  // Tournament in progress (between start and end dates/times)
  if (now >= startDate && now <= endDate) {
    return 'IN_PROGRESS';
  }

  // Tournament not started yet - check registration status
  return registrationClosed ? 'REGISTRATION_CLOSED' : 'REGISTRATION_OPEN';
}

/**
 * Get status configuration for UI display
 */
// Варианты Badge из UI kit (src/components/ui/badge.tsx)
export type StatusVariant = 'success' | 'warning' | 'info' | 'neutral';

export interface StatusConfig {
  label: string;
  labelKk: string;
  labelEn: string;
  variant: StatusVariant;
}

export const TOURNAMENT_STATUS_CONFIG: Record<TournamentStatus, StatusConfig> = {
  REGISTRATION_OPEN: {
    label: 'Регистрация открыта',
    labelKk: 'Тіркеу ашық',
    labelEn: 'Registration open',
    variant: 'success',
  },
  REGISTRATION_CLOSED: {
    label: 'Регистрация закрыта',
    labelKk: 'Тіркеу жабық',
    labelEn: 'Registration closed',
    variant: 'warning',
  },
  IN_PROGRESS: {
    label: 'Идёт турнир',
    labelKk: 'Турнир өтуде',
    labelEn: 'Ongoing',
    variant: 'info',
  },
  COMPLETED: {
    label: 'Завершён',
    labelKk: 'Аяқталды',
    labelEn: 'Finished',
    variant: 'neutral',
  },
};

/**
 * Get localized status label
 */
export function getStatusLabel(status: TournamentStatus, locale: string = 'ru'): string {
  const config = TOURNAMENT_STATUS_CONFIG[status];
  if (!config) return status;

  switch (locale) {
    case 'kk':
      return config.labelKk;
    case 'en':
      return config.labelEn;
    default:
      return config.label;
  }
}

/**
 * Get Badge variant for status
 */
export function getStatusVariant(status: TournamentStatus): StatusVariant {
  return TOURNAMENT_STATUS_CONFIG[status]?.variant ?? 'neutral';
}

/**
 * Check if registration is available for a tournament
 */
export function isRegistrationAvailable(tournament: TournamentForStatus): boolean {
  return getTournamentStatus(tournament) === 'REGISTRATION_OPEN';
}

/**
 * Check if tournament has results (completed)
 */
export function isTournamentCompleted(tournament: TournamentForStatus): boolean {
  return getTournamentStatus(tournament) === 'COMPLETED';
}
