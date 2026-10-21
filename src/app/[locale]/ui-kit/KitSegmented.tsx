"use client";

import { useState } from "react";

import { Segmented } from "@/components/ui/segmented";

// Пример переключателя для витрины: у Segmented есть состояние, поэтому он живёт в клиентском компоненте
export function KitSegmented() {
  const [gender, setGender] = useState<"M" | "F">("M");

  return (
    <Segmented
      label="Пол"
      value={gender}
      onChange={setGender}
      options={[
        { value: "M", label: "Мужчины" },
        { value: "F", label: "Женщины" },
      ]}
    />
  );
}
