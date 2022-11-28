import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import * as bootstrap from 'bootstrap';
import dayjs from 'dayjs';
import $ from 'jquery';
import tippy from 'tippy.js';

interface ConnpassResponse {
  results_available: any,
  results_returned: any,
  events: ConnpassEvents[];
}

interface ConnpassEvents {
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

interface CalendarEvent {
  title: string;
  start: string;
  end: string;
  url: string;
  limit: string;
  description: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}


const CONNPASS_API_URL = 'https://connpass.com/api/v1/event/';

const getEventFormat = (data: ConnpassResponse) => {
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
      backgroundColor: '#a82400',
      borderColor: '#a82400',
      textColor: 'white'
  }    
});
}

const setCalendarEvents = (startStr: any, callback: any) => {
  let events: CalendarEvent[] = [];
  const ym: string = dayjs(startStr).add(7, 'd').format("YYYYMM");
  const item = sessionStorage.getItem('event' + ym);
  
  if (item !== null) {
    events = JSON.parse(item);
    const start: HTMLInputElement =<HTMLInputElement>document.getElementById('start');
    if (start!.value.length > 0) {
      events = events.filter(event => {return (dayjs(event.start).format("HH:mm") >= start!.value);});
    }
    const limit: HTMLInputElement =<HTMLInputElement>document.getElementById('limit');
    if (limit!.value.length > 0) {
      events = events.filter(event => {return (Number(event.limit) >= Number(limit!.value));});
    }
    const keyword: HTMLInputElement =<HTMLInputElement>document.getElementById('keyword');
    if (keyword!.value.length > 0) {
      events = events.filter(event => {return (event.description.indexOf(keyword!.value) > 0);});
    }
    callback(events);
    return;  
  }

  (async () => {
      let data: ConnpassResponse;
      let event: any[] = [];
      const results: any[] = []; 
      const PAGING: number = 100;
      let maxPage: number = 10;
      let pageNo: number = 0;
      
      const loading: HTMLInputElement =<HTMLInputElement>document.getElementById('loading');

      const apiUrl = CONNPASS_API_URL + '?count=' + PAGING + '&ym=' + ym + '&start=' + (pageNo * PAGING + 1);
      data = await $.ajax({url: apiUrl, dataType: 'jsonp'});
      event = getEventFormat(data);
      events = events.concat(event);
      maxPage = Math.ceil(Number(data.results_available) / Number(data.results_returned));
      pageNo += 1;
      loading.dataset.num = '1';
      loading.style.width = `${(Number(loading.dataset.num) / maxPage) * 100}%`;
      while (pageNo < maxPage) {
        results.push((async () => {
          const apiUrl = CONNPASS_API_URL + '?count=' + PAGING + '&ym=' + ym + '&start=' + (pageNo * PAGING + 1);
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
      callback(events);
  })();
}

document.addEventListener('DOMContentLoaded', () => {  
  const calendarEl: HTMLElement = <HTMLInputElement>document.getElementById('calendar')!;
  const calendar: Calendar = new Calendar(calendarEl, {
    plugins: [ dayGridPlugin, listPlugin ],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth, listDay'
    },
    buttonText: {
      today: '今日',
      month: '月',
      list: 'リスト'
    },
    locale: 'ja',
    events: (info: any, success: any) => setCalendarEvents(info.start.valueOf(), success),
    eventClick: (info: any) => {
      info.jsEvent.preventDefault();
      if (info.event.url) {
        window.open(info.event.url);
      }
    },
    eventDidMount: (e: any) => {
      tippy(e.el, {
        content: `tite:${e.event.title} <br> ${e.event.extendedProps.description}`,
        allowHTML: true,
      });
    }
  });

  calendar.render();

  document.getElementById("search")!.addEventListener('click', ()=> {
      calendar.refetchEvents();
      calendar.render();
  });
  
});