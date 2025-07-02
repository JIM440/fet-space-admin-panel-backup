function getTimeAgo(input: string | number | Date | null | undefined): string {
    if (!input) return "";

    const date = new Date(input);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) {
        return "Just now";
    } else if (diffMin < 60) {
        return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    } else if (diffHr < 24) {
        return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
    } else if (diffDay < 30) {
        return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
    } else {
        const options: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
        };

        if (date.getFullYear() !== now.getFullYear()) {
            options.year = 'numeric';
        }

        return date.toLocaleDateString(undefined, options);
    }
}

export {getTimeAgo}