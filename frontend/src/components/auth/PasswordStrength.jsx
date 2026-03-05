/**
 * Password strength indicator
 */

import { motion } from 'framer-motion';

function getStrength(password) {
  if (!password) return 0;
  let s = 0;
  if (password.length >= 6) s++;
  if (password.length >= 8) s++;
  if (/[A-Z]/.test(password)) s++;
  if (/[0-9]/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  return Math.min(s, 5);
}

const labels = ['', 'Faible', 'Moyen', 'Bon', 'Forte', 'Excellente'];
const colors = ['', 'bg-corum-red', 'bg-amber-500', 'bg-corum-turquoise', 'bg-corum-turquoise', 'bg-emerald-500'];

export default function PasswordStrength({ password }) {
  const strength = getStrength(password);
  if (!password) return null;

  return (
    <div className="mt-6">
      <div className="flex gap-1 h-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ width: 0 }}
            animate={{ width: strength >= i ? '100%' : 0 }}
            transition={{ duration: 0.3 }}
            className={`flex-1 rounded-full ${strength >= i ? colors[strength] : 'bg-white/10'}`}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-corum-gray">{labels[strength]}</p>
    </div>
  );
}
