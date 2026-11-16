import { platform } from "@tauri-apps/plugin-os";

import type { SectionStatus } from "./shared";

import { ACCOUNTS_ENABLED, IMPORTS_ENABLED } from "~/shared/features";

export type OnboardingStep =
  | "permissions"
  | "login"
  | "calendar"
  | "imports"
  | "final";

// "login" needs accounts and "imports" needs the upstream backend; both are off.
const optional = (step: OnboardingStep, enabled: boolean): OnboardingStep[] =>
  enabled ? [step] : [];

const STEPS_MACOS: OnboardingStep[] = [
  "permissions",
  ...optional("login", ACCOUNTS_ENABLED),
  "calendar",
  ...optional("imports", IMPORTS_ENABLED),
  "final",
];
const STEPS_OTHER: OnboardingStep[] = [
  ...optional("login", ACCOUNTS_ENABLED),
  "calendar",
  ...optional("imports", IMPORTS_ENABLED),
  "final",
];

function getOnboardingSteps(): OnboardingStep[] {
  return platform() === "macos" ? STEPS_MACOS : STEPS_OTHER;
}

export function getInitialStep(): OnboardingStep {
  return getOnboardingSteps()[0];
}

export function getNextStep(
  currentStep: OnboardingStep,
): OnboardingStep | null {
  const steps = getOnboardingSteps();
  const idx = steps.indexOf(currentStep);
  return idx < steps.length - 1 ? steps[idx + 1] : null;
}

export function getPrevStep(
  currentStep: OnboardingStep,
): OnboardingStep | null {
  const steps = getOnboardingSteps();
  const idx = steps.indexOf(currentStep);
  return idx > 0 ? steps[idx - 1] : null;
}

export function getStepStatus(
  step: OnboardingStep,
  currentStep: OnboardingStep,
): SectionStatus | null {
  const steps = getOnboardingSteps();
  const stepIdx = steps.indexOf(step);
  if (stepIdx === -1) return null;
  const currentIdx = steps.indexOf(currentStep);
  if (stepIdx < currentIdx) return "completed";
  if (stepIdx === currentIdx) return "active";
  return "upcoming";
}
