// src/utils/dueDate.resolver.ts
import { DueDateEnum } from '@/types/app.types';
import { DateCalculator, ensureDate } from 'core-ts';

export type DueDateCategory = DueDateEnum | 'overdue' | 'none';

/**
 * FORMULAIRE -> API
 * Convertit le choix du bouton en chaîne ISO 8601 calée à 23:59:59
 */
export const dueDateEnumToIso = (
  enumValue: DueDateEnum | null | undefined
): string | null => {
  if (!enumValue) return null;

  const now = new Date();
  let target: Date;

  switch (enumValue) {
    case 'today':
      target = new Date(now);
      break;

    case 'tomorrow':
      // Utilisation de DateCalculator.modify pour ajouter 1 jour
      target = DateCalculator.modify(now, { days: 1 });
      break;

    case 'this_week': {
      // Dimanche de la semaine courante (0 = dimanche en JS)
      const dayOfWeek = now.getDay();
      const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      target = DateCalculator.modify(now, { days: daysUntilSunday });
      break;
    }

    case 'later':
      // Le jour 0 du mois M+1 renvoie le dernier jour du mois M (gestion automatique des années bissextiles)
      target = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
  }

  target.setHours(23, 59, 59, 999);
  return target.toISOString();
};

/**
 * API -> AFFICHAGE (TasksPage / TaskEditModal)
 * Détermine la section ou le bouton actif à partir de la date reçue
 */
export const isoToDueDateCategory = (
  isoDate: string | null | undefined
): DueDateCategory => {
  if (!isoDate) return 'none';

  let target: Date;
  try {
    target = ensureDate(isoDate);
  } catch {
    return 'none';
  }

  // Détection du retard via DateCalculator.isPast
  if (DateCalculator.isPast(target)) {
    return 'overdue';
  }

  // Normalisation au début de journée pour comparer les écarts calendaires
  const now = new Date();
  const todayMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const targetMidnight = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  ).getTime();

  const oneDayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((targetMidnight - todayMidnight) / oneDayMs);

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';

  const dayOfWeek = now.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  if (diffDays <= daysUntilSunday) return 'this_week';

  return 'later';
};
