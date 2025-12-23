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
export interface StatusConfig {
  label: string;
  labelKk: string;
  labelEn: string;
  color: string;
  bgClass: string;
  textClass: string;
}

export const TOURNAMENT_STATUS_CONFIG: Record<TournamentStatus, StatusConfig> = {
  REGISTRATION_OPEN: {
    label: 'Регистрация открыта',
    labelKk: 'Тіркеу ашық',
    labelEn: 'Registration Open',
    color: 'green',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
  },
  REGISTRATION_CLOSED: {
    label: 'Регистрация закрыта',
    labelKk: 'Тіркеу жабық',
    labelEn: 'Registration Closed',
    color: 'yellow',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-700',
  },
  IN_PROGRESS: {
    label: 'Идёт турнир',
    labelKk: 'Турнир жүріп жатыр',
    labelEn: 'In Progress',
    color: 'blue',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
  },
  COMPLETED: {
    label: 'Завершён',
    labelKk: 'Аяқталды',
    labelEn: 'Completed',
    color: 'gray',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-600',
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
 * Get status CSS classes for Badge component
 */
export function getStatusClasses(status: TournamentStatus): string {
  const config = TOURNAMENT_STATUS_CONFIG[status];
  if (!config) return 'bg-gray-100 text-gray-600';
  return `${config.bgClass} ${config.textClass}`;
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
