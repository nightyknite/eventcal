import * as bootstrap from 'bootstrap'
import $ from 'jquery';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import dayjs from 'dayjs'; 
import tippy from 'tippy.js';

document.addEventListener('DOMContentLoaded', () => {

const connpass = (data: { events: any[]; }) => {
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
                    + "place:" + item.place + "<br>"
                    + "address:" + item.address + "<br>"
                    + "description:" + (item.catch ? item.catch.substring(0,49) : "") + "<br>"
                    + "",
      backgroundColor: '#a82400',
      borderColor: '#a82400',
      textColor: 'white'
    }    
  });
}

const setCalendar = (startStr: any, callback: any) => {
    let events: any[] = [];
    let dt = new Date(startStr);
    
    dt.setDate(dt.getDate() + 7);

    const ym = dt.getFullYear() + ("00" + (dt.getMonth()+1)).slice(-2);
    const item = sessionStorage.getItem('event' + ym);
    
    if (item !== null) {
      events = JSON.parse(item);
      const start = document.getElementById("start");
      if (start!.value.length > 0) {
        events = events.filter(event => {return (dayjs(event.start).format("HH:mm") >= start.value);});
      }
      const limit = document.getElementById("limit");
      if (limit!.value.length > 0) {
        events = events.filter(event => {return (Number(event.limit) >= limit.value);});
      }
      const keyword = document.getElementById("keyword");
      if (keyword!.value.length > 0) {
        events = events.filter(event => {return (event.description.indexOf(keyword.value) > 0);});
      }
      callback(events);
      return;
    }
    
    (async () => {
        let data = [];
        let event = [];
        const results = [];
        const conpassTimes = 10;
        for (let i = 0; i < conpassTimes; i++) {
            results.push((async () => {
            data = await $.ajax({url: 'https://connpass.com/api/v1/event/?count=100&ym=' + ym + '&start=' + (i * 100 + 1), dataType: 'jsonp'});
            event = connpass(data);
            events = events.concat(event);
            })());
        }
        await Promise.all(results);
        sessionStorage.setItem('event' + ym, JSON.stringify(events));
        callback(events);
    })();
  }
  
  const calendarEl: HTMLElement = document.getElementById('calendar')!;
  const calendar = new Calendar(calendarEl, {
    plugins: [ dayGridPlugin, listPlugin ],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,listDay'
    },
    buttonText: {
      today: '今日',
      month: '月',
      list: 'リスト'
    },
    locale: 'ja',
    events: (info: any, success: any) => setCalendar(info.start.valueOf(), success),
    eventClick: (info: any) => {
      info.jsEvent.preventDefault();
      if (info.event.url) {
        window.open(info.event.url);
      }
    },
    eventDidMount: (e: any) => {
      tippy(e.el, {
        content: e.event.extendedProps.description,
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