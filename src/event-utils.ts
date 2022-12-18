import { EventInput } from '@fullcalendar/vue3'
import dayjs from 'dayjs';
import $ from 'jquery';

let eventGuid = 0
let todayStr = new Date().toISOString().replace(/T.*$/, '') // YYYY-MM-DD of today

export interface ApiResponse {
  results_available: any,
  results_returned: any,
  events: ApiEvents[];
}

export interface ApiEvents {
  title: string;
  limit: string;
  started_at: string;
  ended_at: string;
  event_url: string;
  accepted: string;
  waiting: string;
  event_type: string;
  hash_tag: string;
  place: string;
  address: string;
  catch: string;
  description: string;
}

export const API_URL = 'https://connpass.com/api/v1/event/';

export const getEventFormat = (data: ApiResponse) => {
  return data.events.map(item => {
    return {
      title: `${item.title} (${item.limit})`,
      start: item.started_at,
      end: item.ended_at,
      url: item.event_url,
      limit: item.limit,
      description: ""
                    + "day:" + dayjs(item.started_at).format("MM/DD HH:mm") + " - "
                    + "" + dayjs(item.ended_at).format("MM/DD HH:mm") + "<br>"
                    + "limit:" + item.limit + "<br>"
                    + "accepted:" + item.accepted + "<br>"
                    + "waiting:" + item.waiting + "<br>"
                    + "event_type:" + item.event_type + "<br>"
                    + "hash_tag:" + item.hash_tag + "<br>"
                    + "place:" + item.place + "<br>"
                    + "address:" + item.address + "<br>"
                    + "catch:" + item.catch + "<br>"
                    + "description:" + item.description.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'').slice(0,50) + "<br>"
                    + "",
      color: '',
      backgroundColor: '#a82400',
      borderColor: '',
      textColor: ''
    }    
  });
}

export const getApiEvents = (startDay: Date): EventInput[] => {
  
  let events: EventInput[] = [];
  const ym: string = dayjs(startDay).add(7, 'd').format("YYYYMM");
  const item = sessionStorage.getItem('event' + ym);
  
  if (item !== null) {
    events = JSON.parse(item);
    const start: HTMLInputElement =<HTMLInputElement>document.getElementById('start');
    if (start!.value.length > 0) {
      events = events.filter(event => {return (dayjs(<string>event.start).format("HH:mm") >= start!.value);});
    }
    const limit: HTMLInputElement =<HTMLInputElement>document.getElementById('limit');
    if (limit!.value.length > 0) {
      events = events.filter(event => {return (Number(event.limit) >= Number(limit!.value));});
    }
    const keyword: HTMLInputElement =<HTMLInputElement>document.getElementById('keyword');
    if (keyword!.value.length > 0) {
      events = events.filter(event => {return ((event.description.indexOf(keyword!.value) >= 0) || (event.title!.indexOf(keyword!.value) >= 0));});
    }
    return events;
  }

  (async () => {
      let data: ApiResponse;
      let event: EventInput[] = [];
      const results: any[] = []; 
      const PAGING: number = 100;
      let maxPage: number = 10;
      let pageNo: number = 0;
      
      const loading: HTMLInputElement =<HTMLInputElement>document.getElementById('loading');

      const apiUrl = API_URL + '?count=' + PAGING + '&ym=' + ym + '&start=' + (pageNo * PAGING + 1);
      data = await $.ajax({url: apiUrl, dataType: 'jsonp'});
      event = getEventFormat(data);
      events = events.concat(event);
      maxPage = Math.ceil(Number(data.results_available) / Number(data.results_returned));
      pageNo += 1;
      loading.dataset.num = '1';
      loading.style.width = `${(Number(loading.dataset.num) / maxPage) * 100}%`;
      while (pageNo < maxPage) {
        results.push((async () => {
          const apiUrl = API_URL + '?count=' + PAGING + '&ym=' + ym + '&start=' + (pageNo * PAGING + 1);
          data = await $.ajax({url: apiUrl, dataType: 'jsonp'});
          event = getEventFormat(data);
          events = events.concat(event);
          loading.dataset.num = `${Number(loading.dataset.num) + 1}`;
          loading.style.width = `${(Number(loading.dataset.num) / maxPage) * 100}%`;
        })());
        pageNo += 1;
      }
      await Promise.all(results);
      sessionStorage.setItem('event' + ym, JSON.stringify(events));
  })();
  return events;
}
