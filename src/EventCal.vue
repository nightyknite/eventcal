<script lang='ts'>
import { defineComponent} from 'vue'
import '@fullcalendar/core/vdom'
import FullCalendar, { CalendarOptions, EventApi, EventClickArg, CalendarApi, EventMountArg } from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list';
import { loadApiEvents } from './event-utils'
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
        eventClick: this.handleEventClick,
        eventsSet: this.handleEvents,
        eventDidMount: this.handleEventDidMount,
        events: (info, successCallback, failureCallback) => {
          loadApiEvents(info.start, this).then(events => {
            successCallback(events);
          });          
        }
      } as CalendarOptions,
      currentEvents: [] as EventApi[],
      limit: '',
      start: '',
      keyword: '',
      progressValue: 0,
      progressMaxValue: 0,
    }
  },
  methods: {
    handleEventClick(clickInfo: EventClickArg) {
      clickInfo.jsEvent.preventDefault();
      if (clickInfo.event.url) {
        window.open(clickInfo.event.url);
      }
    },
    handleEvents(events: EventApi[]) {
      // this.currentEvents = events
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
      calendarApi.refetchEvents();
      calendarApi.render();
    },
  }
})
export default EventCal
</script>
<template>
  <div>
    <b-progress :value="progressValue" :max="progressMaxValue" class="mb-3" show-progress ></b-progress>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">Event Calendar</a>
        <div class="collapse navbar-collapse" >
          <form class="d-flex">
            <input id="start" v-model="start" class="form-control me-sm-2" type="text" placeholder="00:00" style="width:5em" maxlength="5" >
            <input id="limit" v-model="limit"  class="form-control me-sm-2" type="text" placeholder="limit" style="width:4em" maxlength="4" >
            <input id="keyword" v-model="keyword" class="form-control me-sm-2" type="search" placeholder="keyword" >
            <button id="search" class="btn btn-outline-success my-2 my-sm-0" type="button" v-on:click="handleSearch()">Search</button>    
          </form>
        </div>
      </div>
    </nav>
  </div>
  <FullCalendar
    class='app-calendar'
    :options='calendarOptions'
    ref="fullCalendar"
  >
  </FullCalendar>
</template>
<style lang='css'>
</style>