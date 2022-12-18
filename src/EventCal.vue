<script lang='ts'>
import { defineComponent, ref } from 'vue'
import '@fullcalendar/core/vdom'
import FullCalendar, { CalendarOptions, EventApi, EventClickArg, CalendarApi, EventMountArg } from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list';
import { getApiEvents } from './event-utils'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

const EventCal = defineComponent({
  components: {
    FullCalendar,
  },
  data() {
    return {
      calendarOptions: {
        plugins: [
          dayGridPlugin,
          listPlugin
        ],
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,listDay'
        },            
        locale: 'ja',
        buttonText: {
          today: '今日',
          month: '月'
        },
        initialView: 'dayGridMonth',
        // initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
        // editable: true,
        //selectable: true,
        //selectMirror: true,
        // dayMaxEvents: true,
        // select: this.handleDateSelect,
        eventClick: this.handleEventClick,
        eventsSet: this.handleEvents,
        eventDidMount: this.handleEventDidMount,
        /* you can update a remote database when these fire:
        eventAdd:
        eventChange:
        eventRemove:
        */
      } as CalendarOptions,
      currentEvents: [] as EventApi[],
      limit: '',
      start: '',
      keyword: ''
    }
  },
  mounted() {
    setTimeout(() => {
      const calendar = this.$refs.fullCalendar as InstanceType<typeof FullCalendar>
      const calendarApi:CalendarApi = calendar.getApi();
      const events = getApiEvents(calendarApi.getDate());
      calendarApi.removeAllEventSources();
      calendarApi.addEventSource(events);
      calendarApi.refetchEvents();
      calendarApi.render();
    }, 10)
  },
  methods: {
    handleEventClick(clickInfo: EventClickArg) {
      clickInfo.jsEvent.preventDefault();
      if (clickInfo.event.url) {
        window.open(clickInfo.event.url);
      }
    },
    handleEvents(events: EventApi[]) {
      this.currentEvents = events
    },
    handleEventDidMount(events: EventMountArg) {
      tippy(events.el, {
        content: `tite:${events.event.title} <br> ${events.event.extendedProps.description}`,
        allowHTML: true,
      });
    },
    handleSearch() {
      const calendar = this.$refs.fullCalendar as InstanceType<typeof FullCalendar>
      const calendarApi:CalendarApi = calendar.getApi();
      const events = getApiEvents(calendarApi.getDate());
      calendarApi.removeAllEventSources();
      calendarApi.addEventSource(events);      
      calendarApi.refetchEvents();
      calendarApi.render();
    },
  }
})
export default EventCal
</script>
<template>
  <v-app>
  <v-container>
    <div class="progress" >
      <div id="loading" data-num="0" class="progress-bar" role="progressbar" style="width:0%"></div>
    </div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">Event Calendar</a>
        <div class="collapse navbar-collapse" >
          <form class="d-flex">
            <input id="start" class="form-control me-sm-2" type="text" placeholder="00:00" style="width:5em" maxlength="5" >
            <input id="limit" class="form-control me-sm-2" type="text" placeholder="limit" style="width:4em" maxlength="4" >
            <input id="keyword" class="form-control me-sm-2" type="search" placeholder="keyword" >
            <button id="search" class="btn btn-outline-success my-2 my-sm-0" type="button" v-on:click="handleSearch()">Search</button>    
          </form>
        </div>
      </div>
    </nav>
  </v-container>
  <FullCalendar
    class='app-calendar'
    :options='calendarOptions'
    ref="fullCalendar"
  >
  </FullCalendar>
</v-app>
</template>
<style lang='css'>
</style>