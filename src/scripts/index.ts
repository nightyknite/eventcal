import * as bootstrap from 'bootstrap'
import $ from 'jquery';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import dayjs from 'dayjs'; 

document.addEventListener('DOMContentLoaded', function() {

const setCalendar = (start, callback) => {
    let events = [];
    let dt = new Date(start);
    
    dt.setDate(dt.getDate() + 7);

    const ym = dt.getFullYear() + ("00" + (dt.getMonth()+1)).slice(-2);
    const item = sessionStorage.getItem('event' + ym);
    
    if (item !== null) {
      events = JSON.parse(item);
      const start = document.getElementById("start");
      if (start.value.length > 0) {
        events = events.filter(event => {return (dayjs(event.start).format("HH:mm") >= start.value);});
      }
      const limit = document.getElementById("limit");
      if (limit.value.length > 0) {
        events = events.filter(event => {return (Number(event.limit) >= limit.value);});
      }
      const keyword = document.getElementById("keyword");
      if (keyword.value.length > 0) {
        events = events.filter(event => {return (event.description.indexOf(keyword.value) > 0);});
      }
      callback(events);
      return;
    }
    
    const connpass = data => {
      let event = [];
      for (var i in data.events) {
        event.push({
          title: data.events[i].title + '(' + data.events[i].limit + ')',
          start: data.events[i].started_at,
          end: data.events[i].ended_at,
          url: data.events[i].event_url,
          limit: data.events[i].limit,
          description: ""
                       + "day:" + dayjs(data.events[i].started_at).format("MM/DD HH:mm") + " - "
                       + "" + dayjs(data.events[i].ended_at).format("MM/DD HH:mm") + "<br>"
                       + "limit:" + data.events[i].limit + "<br>"
                       + "place:" + data.events[i].place + "<br>"
                       + "address:" + data.events[i].address + "<br>"
                       + "description:" + (data.events[i].catch ? data.events[i].catch.substring(0,49) : "") + "<br>"
                       + "",

          backgroundColor: '#a82400',
          borderColor: '#a82400',
          textColor: 'white'
        });
      }
      return event;
    }

    (async () => {
        let data = [];
        let event = [];
        const results = [];
        const conpassTimes = 10;
        const totalTimes = conpassTimes;
        const progressArea = document.querySelector("#eventloading");
        progressArea.max = totalTimes;
        progressArea.style.display = 'block';
        progressArea.value = 0;

        for (let i = 0; i < conpassTimes; i++) {
            results.push((async () => {
            data = await $.ajax({url: 'https://connpass.com/api/v1/event/?count=100&ym=' + ym + '&start=' + (i * 100 + 1), dataType: 'jsonp'});
            event = connpass(data);
            events = events.concat(event);
            progressArea.value += 1;
            })());
        }
        await Promise.all(results);
        progressArea.style.display = "none";
        sessionStorage.setItem('event' + ym, JSON.stringify(events));
        callback(events);

    })();

  }

    const calendarEl = document.getElementById('calendar');
    const calendar = new Calendar(calendarEl, {
      plugins: [ dayGridPlugin, listPlugin ],
      headerToolbar: { center: 'dayGridMonth,timeGridWeek' },
      views: {
        listDay: { buttonText: '日' },
        listWeek: { buttonText: '週' }
      },
      locale: 'ja',
      events: (info, successCallback) => setCalendar(info.startStr, successCallback),
      eventClick: function(info) {
        info.jsEvent.preventDefault();
        if (info.event.url) {
          window.open(info.event.url);
        }
      }
    });

    calendar.render();

    document.getElementById("search").addEventListener('click', ()=> {
        calendar.refetchEvents();
        calendar.render();
    });
  
});