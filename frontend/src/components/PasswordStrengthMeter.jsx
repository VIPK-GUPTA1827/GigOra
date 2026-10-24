import React from 'react';
import { Check, X } from 'lucide-react';

export const COMMON_WEAK_PASSWORDS = new Set([
  'password1234',
  'password12345',
  '123456789012',
  '1234567890123',
  'qwertyuiop12',
  'admin1234567',
  'administrator1',
  'gigora123456',
  'skillsphere12',
  'welcome12345',
  'iloveyou1234',
  'letmein12345'
]);

export function evaluatePassword(password = '') {
  const hasMinLength = password.length >= 12;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isCommon = COMMON_WEAK_PASSWORDS.has(password.toLowerCase().trim());

  let score = 0;
  if (hasMinLength) score += 1;
  if (hasLower && hasUpper) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;
  if (password.length >= 16) score = Math.min(score + 1, 4);

  // If length is less than 12 or it's a common password, score can never be > 1
  if (!hasMinLength || isCommon) {
    score = password.length > 0 ? 1 : 0;
  }

  const levels = [
    { label: '', color: 'bg-stone-200', text: 'text-stone-400' },
    { label: isCommon ? 'Too Common' : 'Weak', color: 'bg-rose-500', text: 'text-rose-600' },
    { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' },
    { label: 'Good', color: 'bg-indigo-500', text: 'text-indigo-600' },
    { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' }
  ];

  const currentLevel = levels[score];

  let message = '';
  if (!hasMinLength) {
    message = 'Password must be at least 12 characters long';
  } else if (isCommon) {
    message = 'This password is too common and easily guessed. Please choose a more secure passphrase.';
  } else if (score < 2) {
    message = 'Password is too weak. Please include a mix of uppercase, lowercase, numbers, or symbols.';
  }

  return {
    score,
    hasMinLength,
    hasMixedCase: hasLower && hasUpper,
    hasNumber,
    hasSpecial,
    isCommon,
    level: currentLevel,
    isValid: hasMinLength && !isCommon && score >= 2,
    message
  };
}

export default function PasswordStrengthMeter({ password = '', showCriteria = true }) {
  if (!password) return null;

  const evaluation = evaluatePassword(password);
  const { score, hasMinLength, hasMixedCase, hasNumber, hasSpecial, isCommon, level } = evaluation;

  return (
    <div className="mt-2.5 space-y-2 select-none animate-in fade-in duration-200">
      {/* 4 Segmented Strength Bars */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4].map((barIndex) => (
          <div
            key={barIndex}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              score >= barIndex ? level.color : 'bg-stone-200'
            }`}
          />
        ))}
      </div>

      {/* Label Indicator */}
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-stone-500">Security strength:</span>
        <span className={level.text}>{level.label}</span>
      </div>

      {/* Criteria Checklist */}
      {showCriteria && (
        <div className="pt-1.5 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
          <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-medium' : 'text-stone-400'}`}>
            {hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" /> : <X className="w-3.5 h-3.5 text-stone-300 stroke-[2]" />}
            <span>At least 12 characters</span>
          </div>

          <div className={`flex items-center gap-1.5 ${hasMixedCase ? 'text-emerald-600 font-medium' : 'text-stone-400'}`}>
            {hasMixedCase ? <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" /> : <X className="w-3.5 h-3.5 text-stone-300 stroke-[2]" />}
            <span>Upper & lowercase letters</span>
          </div>

          <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 font-medium' : 'text-stone-400'}`}>
            {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" /> : <X className="w-3.5 h-3.5 text-stone-300 stroke-[2]" />}
            <span>At least one number</span>
          </div>

          <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600 font-medium' : 'text-stone-400'}`}>
            {hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" /> : <X className="w-3.5 h-3.5 text-stone-300 stroke-[2]" />}
            <span>At least one symbol (!@#$)</span>
          </div>
        </div>
      )}

      {isCommon && (
        <p className="text-[11px] text-rose-500 font-medium">
          ⚠️ This password is too easy to guess. Choose a longer, unique passphrase.
        </p>
      )}
    </div>
  );
}
