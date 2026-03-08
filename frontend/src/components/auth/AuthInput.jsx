/**
 * Input Auth — Floating label, focus glow, error state
 */

import { useState, useId } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthInput({
  type = 'text',
  label,
  value,
  onChange,
  error,
  helper,
  icon: Icon,
  required,
  variant = 'dark',
  placeholder,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const inputId = useId();

  return (
    <div className="relative">
      <div
        className={`relative rounded-xl border transition-all duration-300 ${
          variant === 'light'
            ? error
              ? 'border-red-300 bg-red-50'
              : focused
              ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white'
              : 'border-slate-200 bg-slate-50 hover:border-slate-300'
            : error
            ? 'border-corum-red bg-corum-red/5'
            : focused
            ? 'border-corum-turquoise ring-2 ring-corum-turquoise/30 bg-corum-night'
            : 'border-white/10 bg-corum-night/50 hover:border-white/20'
        }`}
      >
        <input
          id={inputId}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          placeholder={placeholder || ' '}
          autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'off'}
          className={`peer relative z-10 w-full bg-transparent focus:outline-none text-base pt-4 pb-3 pl-4 cursor-text ${
            Icon || isPassword ? 'pr-12' : 'pr-4'
          } ${
            variant === 'light' ? 'text-slate-800 placeholder-slate-400' : 'text-corum-offwhite placeholder-transparent'
          }`}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={`absolute left-4 transition-all duration-200 pointer-events-none ${
            value || focused
              ? variant === 'light' ? 'top-1.5 text-xs text-blue-600' : 'top-1.5 text-xs text-corum-turquoise'
              : variant === 'light' ? 'top-1/2 -translate-y-1/2 text-base text-slate-500' : 'top-1/2 -translate-y-1/2 text-base text-corum-gray'
          }`}
        >
          {label} {required && '*'}
        </label>
        {Icon && !isPassword && (
          <span className={`absolute right-4 top-1/2 -translate-y-1/2 ${variant === 'light' ? 'text-slate-400' : 'text-corum-gray'}`}>
            <Icon className="w-5 h-5" strokeWidth={1.5} />
          </span>
        )}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPassword(!showPassword); }}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 cursor-pointer p-1 -m-1 rounded hover:bg-white/5 transition-colors ${variant === 'light' ? 'text-slate-400 hover:text-slate-600' : 'text-corum-gray hover:text-corum-offwhite'}`}
          >
            {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
          </button>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          className="mt-1.5 text-sm text-corum-red"
        >
          {error}
        </motion.p>
      )}
      {helper && !error && (
        <p className="mt-1.5 text-xs text-corum-gray">{helper}</p>
      )}
    </div>
  );
}
