// Utility functions for input masking and formatting

export const masks = {
  // CPF mask: 000.000.000-00
  cpf: (value: string): string => {
    if (!value) return "";

    const cleanValue = value.replace(/\D/g, "");
    const match = cleanValue.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);

    if (!match) return cleanValue;

    const [, group1, group2, group3, group4] = match;

    let result = group1;
    if (group2) result += `.${group2}`;
    if (group3) result += `.${group3}`;
    if (group4) result += `-${group4}`;

    return result;
  },

  // Phone mask: (00) 00000-0000 or (00) 0000-0000
  phone: (value: string): string => {
    if (!value) return "";

    const cleanValue = value.replace(/\D/g, "");

    if (cleanValue.length <= 10) {
      // (00) 0000-0000
      const match = cleanValue.match(/^(\d{0,2})(\d{0,4})(\d{0,4})$/);
      if (!match) return cleanValue;

      const [, area, first, second] = match;

      let result = "";
      if (area) result += `(${area}`;
      if (area.length === 2) result += ") ";
      if (first) result += first;
      if (second) result += `-${second}`;

      return result;
    } else {
      // (00) 00000-0000
      const match = cleanValue.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
      if (!match) return cleanValue;

      const [, area, first, second] = match;

      let result = "";
      if (area) result += `(${area}`;
      if (area.length === 2) result += ") ";
      if (first) result += first;
      if (second) result += `-${second}`;

      return result;
    }
  },

  // CEP mask: 00000-000
  cep: (value: string): string => {
    if (!value) return "";

    const cleanValue = value.replace(/\D/g, "");
    const match = cleanValue.match(/^(\d{0,5})(\d{0,3})$/);

    if (!match) return cleanValue;

    const [, first, second] = match;

    let result = first;
    if (second) result += `-${second}`;

    return result;
  },

  // Currency mask: R$ 0.000,00
  currency: (value: string): string => {
    if (!value) return "";

    // Remove all non-numeric characters except comma and dot
    let cleanValue = value.replace(/[^\d,.-]/g, "");

    // Convert to number (handle both comma and dot as decimal separator)
    const numericValue = parseFloat(cleanValue.replace(",", ".")) || 0;

    // Format as Brazilian currency
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numericValue);
  },

  // Credit card mask: 0000 0000 0000 0000
  creditCard: (value: string): string => {
    if (!value) return "";

    const cleanValue = value.replace(/\D/g, "");
    const match = cleanValue.match(/^(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})$/);

    if (!match) return cleanValue;

    const [, group1, group2, group3, group4] = match;

    let result = group1;
    if (group2) result += ` ${group2}`;
    if (group3) result += ` ${group3}`;
    if (group4) result += ` ${group4}`;

    return result;
  },

  // Date mask: 00/00/0000
  date: (value: string): string => {
    if (!value) return "";

    const cleanValue = value.replace(/\D/g, "");
    const match = cleanValue.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);

    if (!match) return cleanValue;

    const [, day, month, year] = match;

    let result = day;
    if (month) result += `/${month}`;
    if (year) result += `/${year}`;

    return result;
  },

  // Time mask: 00:00
  time: (value: string): string => {
    if (!value) return "";

    const cleanValue = value.replace(/\D/g, "");
    const match = cleanValue.match(/^(\d{0,2})(\d{0,2})$/);

    if (!match) return cleanValue;

    const [, hours, minutes] = match;

    let result = hours;
    if (minutes) result += `:${minutes}`;

    return result;
  },

  // Only numbers
  numeric: (value: string): string => {
    return value.replace(/\D/g, "");
  },

  // Only letters and spaces
  alphabetic: (value: string): string => {
    return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
  },

  // Alphanumeric
  alphanumeric: (value: string): string => {
    return value.replace(/[^a-zA-Z0-9À-ÿ\s]/g, "");
  },
};

// Utility functions to unmask values
export const unmasks = {
  cpf: (value: string): string => value.replace(/\D/g, ""),
  phone: (value: string): string => value.replace(/\D/g, ""),
  cep: (value: string): string => value.replace(/\D/g, ""),
  currency: (value: string): string => {
    return value
      .replace(/[^\d,.-]/g, "")
      .replace(",", ".")
      .replace(/\.(?=.*\.)/g, ""); // Remove extra dots
  },
  creditCard: (value: string): string => value.replace(/\D/g, ""),
  date: (value: string): string => value.replace(/\D/g, ""),
  time: (value: string): string => value.replace(/\D/g, ""),
  numeric: (value: string): string => value.replace(/\D/g, ""),
  alphabetic: (value: string): string => value,
  alphanumeric: (value: string): string => value,
};

// Validation helpers for masked fields
export const maskValidators = {
  isCPFComplete: (value: string): boolean => {
    const clean = unmasks.cpf(value);
    return clean.length === 11;
  },

  isPhoneComplete: (value: string): boolean => {
    const clean = unmasks.phone(value);
    return clean.length >= 10 && clean.length <= 11;
  },

  isCEPComplete: (value: string): boolean => {
    const clean = unmasks.cep(value);
    return clean.length === 8;
  },

  isCreditCardComplete: (value: string): boolean => {
    const clean = unmasks.creditCard(value);
    return clean.length >= 13 && clean.length <= 19;
  },

  isDateComplete: (value: string): boolean => {
    const clean = unmasks.date(value);
    return clean.length === 8;
  },

  isTimeComplete: (value: string): boolean => {
    const clean = unmasks.time(value);
    return clean.length === 4;
  },
};

// Format display values
export const formatters = {
  currency: (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  },

  percentage: (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "percent",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value / 100);
  },

  date: (value: string | Date): string => {
    const date = typeof value === "string" ? new Date(value) : value;
    return new Intl.DateTimeFormat("pt-BR").format(date);
  },

  dateTime: (value: string | Date): string => {
    const date = typeof value === "string" ? new Date(value) : value;
    return new Intl.DateTimeFormat("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  },

  phone: (value: string): string => {
    return masks.phone(value);
  },

  cpf: (value: string): string => {
    return masks.cpf(value);
  },

  cep: (value: string): string => {
    return masks.cep(value);
  },
};
