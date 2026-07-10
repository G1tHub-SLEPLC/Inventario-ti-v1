// Default badge configuration. This can be updated by pasting the config generated in GlobalBadgeCustomizerPage.
export const BADGE_CONFIG = {
  "equipos": [
    {
      "id": "eq_disp",
      "label": "DISPONIBLE",
      "bg": "bg-green-200",
      "text": "text-green-800",
      "border": "border-green-600",
      "uppercase": true,
      "iconName": "Check"
    },
    {
      "id": "eq_para",
      "label": "PARA PRESTAMO",
      "bg": "bg-indigo-200",
      "text": "text-indigo-800",
      "border": "border-indigo-600",
      "uppercase": true,
      "iconName": "Package"
    },
    {
      "id": "eq_en",
      "label": "EN PRESTAMO",
      "bg": "bg-amber-200",
      "text": "text-amber-800",
      "border": "border-amber-600",
      "uppercase": true,
      "iconName": "AlertCircle"
    },
    {
      "id": "eq_asig",
      "label": "ASIGNADO",
      "bg": "bg-lime-200",
      "text": "text-lime-800",
      "border": "border-lime-600",
      "uppercase": true,
      "iconName": "Laptop"
    },
    {
      "id": "eq_baja",
      "label": "DE BAJA",
      "bg": "bg-rose-200",
      "text": "text-red-800",
      "border": "border-red-600",
      "uppercase": true,
      "iconName": "X"
    }
  ],
  "insumos": [
    {
      "id": "ins_alto",
      "label": "Stock > 5",
      "bg": "bg-green-200",
      "text": "text-green-800",
      "border": "border-green-600",
      "uppercase": true,
      "iconName": "None"
    },
    {
      "id": "ins_bajo",
      "label": "Stock > 0",
      "bg": "bg-amber-200",
      "text": "text-amber-800",
      "border": "border-amber-600",
      "uppercase": true,
      "iconName": "None"
    },
    {
      "id": "ins_agot",
      "label": "Agotado (0)",
      "bg": "bg-red-200",
      "text": "text-red-800",
      "border": "border-red-600",
      "uppercase": true,
      "iconName": "None"
    }
  ],
  "licencias": [
    {
      "id": "lic_act",
      "label": "ACTIVA",
      "bg": "bg-green-200",
      "text": "text-green-800",
      "border": "border-green-600",
      "uppercase": true,
      "iconName": "Check"
    },
    {
      "id": "lic_susp",
      "label": "SUSPENDIDA",
      "bg": "bg-rose-200",
      "text": "text-rose-800",
      "border": "border-rose-600",
      "uppercase": true,
      "iconName": "AlertCircle"
    },
    {
      "id": "lic_pct_alto",
      "label": "% Restante > 40%",
      "bg": "bg-emerald-600",
      "text": "text-white",
      "border": "border-emerald-800",
      "uppercase": true,
      "font": "font-sans",
      "weight": "font-medium",
      "iconName": "None"
    },
    {
      "id": "lic_pct_med",
      "label": "% Restante 20-40%",
      "bg": "bg-amber-600",
      "text": "text-white",
      "border": "border-amber-800",
      "uppercase": true,
      "font": "font-sans",
      "weight": "font-medium",
      "iconName": "None"
    },
    {
      "id": "lic_pct_bajo",
      "label": "% Restante < 20%",
      "bg": "bg-red-600",
      "text": "text-white",
      "border": "border-red-800",
      "uppercase": true,
      "font": "font-sans",
      "weight": "font-medium",
      "iconName": "None"
    },
    {
      "id": "lic_s_alto",
      "label": "Disp > 5",
      "bg": "bg-green-200",
      "text": "text-green-800",
      "border": "border-green-600",
      "uppercase": true,
      "iconName": "None"
    },
    {
      "id": "lic_s_bajo",
      "label": "Disp < 5",
      "bg": "bg-amber-200",
      "text": "text-amber-800",
      "border": "border-amber-600",
      "uppercase": true,
      "iconName": "None"
    },
    {
      "id": "lic_s_cero",
      "label": "Sin Stock",
      "bg": "bg-red-200",
      "text": "text-red-800",
      "border": "border-red-600",
      "uppercase": true,
      "iconName": "X"
    }
  ],
  "solicitudes": [
    {
      "id": "sol_pend",
      "label": "Pendiente",
      "bg": "bg-amber-200",
      "text": "text-amber-800",
      "border": "border-amber-600",
      "uppercase": true,
      "iconName": "Clock"
    },
    {
      "id": "sol_apr",
      "label": "Aprobado",
      "bg": "bg-green-200",
      "text": "text-green-800",
      "border": "border-green-600",
      "uppercase": true,
      "iconName": "Check"
    },
    {
      "id": "sol_rech",
      "label": "Rechazado",
      "bg": "bg-rose-200",
      "text": "text-red-600",
      "border": "border-red-600",
      "uppercase": true,
      "iconName": "X"
    },
    {
      "id": "sol_dev",
      "label": "Devuelto",
      "bg": "bg-blue-200",
      "text": "text-blue-600",
      "border": "border-blue-600",
      "uppercase": true,
      "iconName": "Check"
    },
    {
      "id": "sol_dev_a",
      "label": "Dev. Atraso",
      "bg": "bg-orange-200",
      "text": "text-orange-800",
      "border": "border-orange-600",
      "uppercase": true,
      "iconName": "AlertTriangle"
    },
    {
      "id": "sol_baja",
      "label": "Baja",
      "bg": "bg-pink-200",
      "text": "text-pink-800",
      "border": "border-pink-600",
      "uppercase": true,
      "iconName": "AlertCircle"
    }
  ],
  "usuarios": [
    {
      "id": "usr_adm",
      "label": "Admin TI",
      "bg": "bg-purple-50",
      "text": "text-purple-800",
      "border": "border-purple-50",
      "uppercase": true,
      "iconName": "Key"
    },
    {
      "id": "usr_std",
      "label": "Usuario",
      "bg": "bg-blue-50",
      "text": "text-blue-800",
      "border": "border-blue-50",
      "uppercase": true,
      "iconName": "Users"
    }
  ],
  "auditoria": [
    {
      "id": "aud_cre",
      "label": "CREATE",
      "bg": "bg-green-200",
      "text": "text-green-800",
      "border": "border-green-600",
      "uppercase": true,
      "iconName": "None"
    },
    {
      "id": "aud_upd",
      "label": "UPDATE",
      "bg": "bg-blue-200",
      "text": "text-blue-800",
      "border": "border-blue-600",
      "uppercase": true,
      "iconName": "None"
    },
    {
      "id": "aud_del",
      "label": "DELETE",
      "bg": "bg-rose-200",
      "text": "text-rose-800",
      "border": "border-rose-600",
      "uppercase": true,
      "iconName": "None"
    }
  ],
  "inicio": [
    {
      "id": "ini_ok",
      "label": "OK (Status)",
      "bg": "bg-emerald-200",
      "text": "text-emerald-800",
      "border": "border-emerald-600",
      "uppercase": true,
      "iconName": "Check"
    },
    {
      "id": "ini_warn",
      "label": "Warning",
      "bg": "bg-amber-200",
      "text": "text-amber-800",
      "border": "border-amber-600",
      "uppercase": true,
      "iconName": "AlertTriangle"
    },
    {
      "id": "ini_err",
      "label": "Error",
      "bg": "bg-rose-200",
      "text": "text-rose-800",
      "border": "border-rose-600",
      "uppercase": true,
      "iconName": "AlertCircle"
    }
  ],
  "nombres": [
    {
      "id": "nom_default",
      "label": "Funcionario",
      "bg": "bg-white",
      "text": "text-blue-700",
      "border": "border-white",
      "uppercase": false,
      "iconName": "Users"
    }
  ],
  "cumplimiento": [
    {
      "id": "cump_opt",
      "label": "Óptimo",
      "bg": "bg-emerald-50",
      "text": "text-emerald-600",
      "border": "border-emerald-50",
      "uppercase": true,
      "iconName": "CheckCircle"
    },
    {
      "id": "cump_atr",
      "label": "Atrasos",
      "bg": "bg-red-50",
      "text": "text-red-600",
      "border": "border-red-50",
      "uppercase": true,
      "iconName": "AlertTriangle"
    }
  ]
};
