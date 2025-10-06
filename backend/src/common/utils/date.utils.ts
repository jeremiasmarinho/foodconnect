/**
 * Utility functions for date formatting
 */

export class DateUtils {
  /**
   * Convert a date to relative time (e.g., "2 hours ago")
   * @param date - Date to convert
   * @returns Relative time string in Portuguese
   */
  static timeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'agora';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return diffInMinutes === 1
        ? '1 minuto atrás'
        : `${diffInMinutes} minutos atrás`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return diffInHours === 1 ? '1 hora atrás' : `${diffInHours} horas atrás`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return diffInDays === 1 ? '1 dia atrás' : `${diffInDays} dias atrás`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return diffInWeeks === 1
        ? '1 semana atrás'
        : `${diffInWeeks} semanas atrás`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return diffInMonths === 1 ? '1 mês atrás' : `${diffInMonths} meses atrás`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return diffInYears === 1 ? '1 ano atrás' : `${diffInYears} anos atrás`;
  }

  /**
   * Format date to Brazilian format
   * @param date - Date to format
   * @returns Formatted date string (DD/MM/YYYY HH:mm)
   */
  static formatBrazilian(date: Date): string {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Check if date is today
   * @param date - Date to check
   * @returns True if date is today
   */
  static isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Check if date is this week
   * @param date - Date to check
   * @returns True if date is this week
   */
  static isThisWeek(date: Date): boolean {
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffInDays < 7;
  }
}
