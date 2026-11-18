// The same anonymous, read-only event list that powers the DriveLab Zug checkout.
// Amelia returns Zurich wall-clock times on this endpoint. Never request bookings.
const endpoint = 'https://drivelab.ch/wp-admin/admin-ajax.php';
export const provider = 'https://drivelab.ch/vku/zug/#course-dates';
export type Language = 'de' | 'en';
type Session = { day: string; start: string; end: string };
export type Course = { id: number; language: Language; organizer: string | null; price: number; sessions: Session[]; first: string; evening: boolean; weekend: boolean };
type Event = { id: number; status: string; name: string; description?: string; tags: {name: string}[]; show: boolean; bookable: boolean; opened: boolean; closed: boolean; full: boolean; places: number; price: number; customPricing: boolean; customLocation?: string; location?: {address?: string}; periods: {periodStart: string; periodEnd: string}[] };
const clock = new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Zurich',dateStyle:'short',timeStyle:'medium'});
const datetime = /^\d{4}-\d{2}-\d{2} (?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;

export function mapCourse(event: Event, now: string): Course | null {
  const address = (event.customLocation || event.location?.address || '').replace(/\s+/g,' ').trim();
  if (event.status !== 'approved' || event.show !== true || event.bookable !== true || event.opened !== true || event.closed !== false || event.full !== false || !(event.places > 0)) return null;
  if (!Number.isSafeInteger(event.id) || event.id <= 0 || !/^Industriestrasse 50,? 6300 Zug$/i.test(address) || !event.tags?.some(t => t.name === 'VKU Zug')) return null;
  // The provider uses this title for German ASA-synchronised groups. Unknown language stays unpublished.
  const language = /\b(english|englisch)\b/i.test(event.name) && /\bVKU\b/i.test(event.name) ? 'en'
    : /^Verkehrskunde Unterricht VKU\s*[-–]\s*\d{2}\.\d{2}\.\d{4}$/i.test(event.name) ? 'de' : null;
  if (!language || !Array.isArray(event.periods) || !Number.isFinite(event.price) || event.price <= 0 || event.customPricing) return null;
  const periods = [...event.periods].sort((a,b) => a.periodStart.localeCompare(b.periodStart));
  const first = periods[0]?.periodStart;
  if (!first || first <= now) return null;
  const sessions: Session[] = [];
  let hours = 0, previous = '';
  for (const {periodStart: start, periodEnd: end} of periods) {
    if (!datetime.test(start) || !datetime.test(end) || start.slice(0,10) !== end.slice(0,10) || end <= start || start < previous) return null;
    previous = end;
    hours += (Date.parse(end.replace(' ','T')+'Z') - Date.parse(start.replace(' ','T')+'Z')) / 3600000;
    const day = start.slice(0,10), from = start.slice(11,16), to = end.slice(11,16);
    const last = sessions.at(-1);
    if (last?.day === day && last.end === from) last.end = to;
    else sessions.push({day,start:from,end:to});
  }
  if (hours !== 8) return null;
  // Only display a verified public school name, never the raw description or staff record.
  const organizer = /bei Fahrschule Learn-Fast\b/i.test(event.description ?? '') ? 'Fahrschule Learn-Fast' : null;
  return {id:event.id, language, organizer, price:event.price, first, sessions, evening:sessions.every(s => s.start >= '17:00'),weekend:sessions.some(s => [0,6].includes(new Date(s.day+'T12:00:00Z').getUTCDay()))};
}

let cache: {expires:number; courses:Course[]} | undefined;
export async function getCourses(): Promise<Course[] | null> {
  const now = clock.format(new Date());
  if (cache && Date.now() < cache.expires) return cache.courses.filter(c=>c.first > now);
  try {
    const courses = new Map<number,Course>();
    const signal = AbortSignal.timeout(4500);
    let seen = 0;
    for (let page = 1; page <= 12; page++) {
      const url = new URL(endpoint);
      url.search = new URLSearchParams({action:'wpamelia_api',call:'/events',bookings:'false',dates:now.slice(0,10),'tag[]':'VKU Zug',page:String(page)}).toString();
      const result = await fetch(url, {signal, cache:'no-store'});
      if (!result.ok) return null;
      const {data} = await result.json() as {data:{events:Event[],count:number}};
      if (!Array.isArray(data?.events) || !Number.isSafeInteger(data.count)) return null;
      for (const event of data.events) {
        const course = mapCourse(event, now);
        if (course) courses.set(course.id, course);
      }
      seen += data.events.length;
      if (seen >= data.count) {
        const sorted = [...courses.values()].sort((a,b)=>a.first.localeCompare(b.first));
        cache = {expires:Date.now()+120000,courses:sorted};
        return sorted;
      }
      if (!data.events.length) return null;
    }
  } catch { /* A source outage must never look like a sold-out event. */ }
  return null;
}

export function bookingLink(course:Course, lang:Language) {
  const url = new URL('https://drivelab.ch/anmeldung-vku-zug/');
  url.search = new URLSearchParams({ameliaEventId:String(course.id),ameliaEventPopup:String(course.id),utm_source:'vku-kurs-zug.ch',utm_medium:'referral',utm_campaign:'vku_zug',utm_content:lang+'_kursblock'}).toString();
  return url.href;
}
