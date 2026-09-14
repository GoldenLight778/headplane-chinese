/**
 * Formats the time delta since a given date into a human-readable string.
 * - Under 1 hour: "X minutes ago"
 * - Under 1 day: "X hours, Y minutes ago"
 * - Under 1 month: "X days, Y hours ago"
 * - Over 1 month: "X months, Y days ago"
 */
/**
 * Formats the time delta since a given date into a human-readable string.
 * - Under 1 hour: "X minutes ago" / "X 分钟前"
 * - Under 1 day: "X hours, Y minutes ago" / "X 小时 Y 分钟前"
 * - Under 1 month: "X days, Y hours ago" / "X 天 Y 小时前"
 * - Over 1 month: "X months, Y days ago" / "X 个月 Y 天前"
 */
export function formatTimeDelta(date: Date, isZh: boolean = true): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);

  if (isZh) {
    if (minutes < 1) {
      return "刚刚";
    }
    if (minutes < 60) {
      return `${minutes} 分钟前`;
    }

    if (hours < 24) {
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} 小时前`;
      }
      return `${hours} 小时 ${remainingMinutes} 分钟前`;
    }

    if (days < 30) {
      const remainingHours = hours % 24;
      if (remainingHours === 0) {
        return `${days} 天前`;
      }
      return `${days} 天 ${remainingHours} 小时前`;
    }

    const remainingDays = days % 30;
    if (remainingDays === 0) {
      return `${months} 个月前`;
    }
    return `${months} 个月 ${remainingDays} 天前`;
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  }

  if (hours < 24) {
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }
    return `${hours} hour${hours !== 1 ? "s" : ""}, ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""} ago`;
  }

  if (days < 30) {
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    }
    return `${days} day${days !== 1 ? "s" : ""}, ${remainingHours} hour${remainingHours !== 1 ? "s" : ""} ago`;
  }

  const remainingDays = days % 30;
  if (remainingDays === 0) {
    return `${months} month${months !== 1 ? "s" : ""} ago`;
  }
  return `${months} month${months !== 1 ? "s" : ""}, ${remainingDays} day${remainingDays !== 1 ? "s" : ""} ago`;
}
