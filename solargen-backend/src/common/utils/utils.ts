export function getTodayDate(): string {
    return new Date().toLocaleDateString('en-CA', {timeZone: 'Australia/Melbourne'});
}
