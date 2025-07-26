import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Calculate years of experience since business started
export function getYearsOfExperience(): number {
  // Owner was doing this work before officially starting the business in 2013
  const startYear = 2012
  const currentYear = new Date().getFullYear()
  return currentYear - startYear
}

// Get years of experience as a string (e.g., "13+", "14+")
export function getYearsOfExperienceString(): string {
  const years = getYearsOfExperience()
  return `${years}+`
}
