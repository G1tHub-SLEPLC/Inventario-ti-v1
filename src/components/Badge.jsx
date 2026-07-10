import React from 'react';
import { BADGE_CONFIG } from '../config/badgeConfig';
import { 
  Check, Layout, AlertCircle, Laptop, Package, Key, FileText, 
  Users, ShieldAlert, X, Clock, AlertTriangle, Info, CheckCircle
} from 'lucide-react';

const LUCIDE_ICONS = {
  Check,
  Package,
  AlertCircle,
  Laptop,
  X,
  Key,
  Users,
  ShieldAlert,
  FileText,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  None: null
};

// Helper normalizer
const normalizeString = (str) => {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
};

function toTitleCase(str) {
  if (!str) return str;
  return str.split(' ').map(word => {
    if (!word) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

function getInitials(name) {
  if (!name || name === '—') return '??';
  const words = String(name).trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function Badge({ categoria, estado, text = null, className = '', variant = 'default' }) {
  // Look up configuration for this category
  const configList = BADGE_CONFIG[categoria] || [];
  
  // Find the matching badge config by comparing labels
  const normalizedEstado = normalizeString(estado);
  
  // For some specific rules like Equipos, "PARA PRÉSTAMO" equals "PARA PRESTAMO"
  let badgeConfig = configList.find(c => normalizeString(c.label) === normalizedEstado);

  // If exact match not found, we do some fallback logic for specific cases
  if (!badgeConfig) {
    if (categoria === 'equipos' && (normalizedEstado === 'BAJA' || normalizedEstado === 'DE BAJA')) {
      badgeConfig = configList.find(c => c.id === 'eq_baja');
    }
    // Si no hay configuración exacta, devolvemos un span básico gris
    if (!badgeConfig) {
      if (variant === 'icon') {
        return <span className={`text-gray-400 ${className}`} title={estado} />;
      }
      return (
        <span className={`font-sans px-2.5 py-1 rounded text-[11px] font-bold tracking-wide border whitespace-nowrap bg-gray-100 text-gray-700 border-gray-200 ${className}`}>
          {estado}
        </span>
      );
    }
  }

  const IconComponent = LUCIDE_ICONS[badgeConfig.iconName || 'None'];
  
  if (variant === 'user') {
    let userName = text || estado;
    userName = toTitleCase(userName);
    const isUnknown = !userName || userName === '—' || userName === '-' || userName.toLowerCase() === 'sin nombre';
    const displayStr = isUnknown ? '¿?' : userName;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold border shadow-sm ${badgeConfig.bg} ${badgeConfig.text} ${badgeConfig.border} ${badgeConfig.uppercase ? 'uppercase' : ''} ${className}`}>
        {!isUnknown && IconComponent && <IconComponent size={15} strokeWidth={3} />}
        <span title={isUnknown ? undefined : userName} className="leading-none tracking-wide">{displayStr}</span>
      </span>
    );
  }

  if (variant === 'icon') {
    // Determine a slightly more vibrant color for the icon if it's an 800/700 shade
    let iconColorClass = badgeConfig.text;
    if (iconColorClass.includes('-800')) {
      iconColorClass = iconColorClass.replace('-800', '-500');
    } else if (iconColorClass.includes('-700')) {
      iconColorClass = iconColorClass.replace('-700', '-500');
    }
    
    return (
      <span className={`inline-flex items-center justify-center ${iconColorClass} ${className}`} title={estado}>
        {IconComponent && <IconComponent size={18} strokeWidth={2.5} />}
      </span>
    );
  }

  const textCaseClass = badgeConfig.uppercase ? 'uppercase' : '';
  const paddingClass = variant === 'icon-bg' ? 'p-1' : 'px-2.5 py-1 gap-1.5';
  const isIconBg = variant === 'icon-bg';
  
  const fontClass = badgeConfig.font || 'font-sans';
  const weightClass = badgeConfig.weight || 'font-bold';
  const italicClass = badgeConfig.italic ? 'italic' : '';

  const classes = `${fontClass} ${weightClass} ${italicClass} ${paddingClass} rounded text-[11px] tracking-wide border whitespace-nowrap inline-flex items-center justify-center ${textCaseClass} ${badgeConfig.bg} ${badgeConfig.text} ${badgeConfig.border} ${className}`;

  return (
    <span className={classes} title={isIconBg ? estado : undefined}>
      {IconComponent && <IconComponent size={isIconBg ? 16 : 14} strokeWidth={2.5} />}
      {!isIconBg && (badgeConfig.uppercase ? estado.toUpperCase() : estado)}
    </span>
  );
}
