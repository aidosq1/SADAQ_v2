"use client";

import { useState, useCallback } from "react";

/**
 * Configuration for translation field groups
 * Each key is the base field name (RU), values are KK and EN field names
 */
type TranslationFieldConfig = {
  [baseField: string]: { kk: string; en: string };
};

/**
 * Hook for managing form state with auto-duplication of translation fields
 *
 * When user blurs a RU field, automatically copies the value to empty KK/EN fields.
 * Does not overwrite KK/EN fields that already have content.
 *
 * @param initialState - Initial form data
 * @param translationFields - Configuration mapping base fields to their translations
 * @returns Object with formData, setFormData, handleTranslationBlur, and resetForm
 *
 * @example
 * const TRANSLATION_FIELDS = {
 *   title: { kk: "titleKk", en: "titleEn" },
 *   content: { kk: "contentKk", en: "contentEn" },
 * };
 *
 * const { formData, setFormData, handleTranslationBlur, resetForm } = useTranslationForm(
 *   defaultFormData,
 *   TRANSLATION_FIELDS
 * );
 *
 * // RU field with auto-fill on blur:
 * <Input
 *   value={formData.title}
 *   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
 *   onBlur={() => handleTranslationBlur("title")}
 * />
 */
export function useTranslationForm<T extends Record<string, unknown>>(
  initialState: T,
  translationFields: TranslationFieldConfig
) {
  const [formData, setFormData] = useState<T>(initialState);

  /**
   * Handler for onBlur event on RU fields
   * Copies RU value to KK and EN if they are empty
   */
  const handleTranslationBlur = useCallback((baseField: string) => {
    const config = translationFields[baseField];
    if (!config) return;

    setFormData(prev => {
      const ruValue = prev[baseField as keyof T] as string;
      if (!ruValue) return prev;

      const updates: Partial<T> = {};
      const kkValue = prev[config.kk as keyof T] as string;
      const enValue = prev[config.en as keyof T] as string;

      if (!kkValue?.trim()) {
        updates[config.kk as keyof T] = ruValue as T[keyof T];
      }
      if (!enValue?.trim()) {
        updates[config.en as keyof T] = ruValue as T[keyof T];
      }

      return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
    });
  }, [translationFields]);

  /**
   * Resets form to initial state or new state
   */
  const resetForm = useCallback((newState?: T) => {
    setFormData(newState ?? initialState);
  }, [initialState]);

  return {
    formData,
    setFormData,
    handleTranslationBlur,
    resetForm,
  };
}
