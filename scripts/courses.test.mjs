import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mapCourse, bookingLink } from '../src/lib/amelia.ts';

const name = 'Verkehrskunde Unterricht VKU - 14.12.2026';
const group = {
  id:118, name, status:'approved', show:true, opened:true, closed:false, bookable:true, full:false,
  places:1, price:230, customPricing:false, customLocation:'Industriestrasse 50,  6300 Zug',
  tags:[{name:'VKU Zug'}],
  periods:['14','15'].flatMap(day=>[['18','20'],['20','22']].map(([start,end])=>({
    periodStart:`2026-12-${day} ${start}:00:00`,periodEnd:`2026-12-${day} ${end}:00:00`
  })))
};
const now = '2026-11-18 09:00:00';

test('maps all sessions and deep-links to the same public group',()=>{
  const result = mapCourse(group,now);
  assert.deepEqual(result.sessions.map(s=>[s.day,s.start,s.end]),[['2026-12-14','18:00','22:00'],['2026-12-15','18:00','22:00']]);
  assert.equal(result.evening,true);
  assert.equal(result.weekend,false);
  assert.equal(result.language,'de');
  assert.equal(mapCourse({...group,name:'VKU English'},now).language,'en');
  const url=new URL(bookingLink(result,'de'));
  assert.equal(url.searchParams.get('ameliaEventId'),'118');
  assert.equal(url.searchParams.get('ameliaEventPopup'),'118');
  assert.equal(url.searchParams.get('utm_source'),'vku-kurs-zug.ch');
});
test('omits closed, unverified, started and incomplete groups',()=>{
  for (const patch of [{status:'canceled'},{show:false},{closed:true},{opened:false},{bookable:false},{full:true},{places:0},{tags:[]},{name:'VKU français'},{customLocation:'Baar'},{customPricing:true},{periods:group.periods.slice(1)}]) {
    assert.equal(mapCourse({...group,...patch},now),null);
  }
  assert.equal(mapCourse(group,'2026-12-14 18:00:00'),null);
});
