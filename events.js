#!/usr/bin/env node

const request = require('superagent')

const SLACK_TOKEN = '<redacted>'
const SLACK_CHANNEL = '#ufc'
//const SLACK_CHANNEL = '#bps_test_graveyard'
const SLACK_USERNAME = 'UFC Event Notifier'
const SLACK_ICON_EMOJI = ':boxinggloves:'

let soon = (eventDate) => {
  curdate = new Date()
  d = new Date(eventDate)
  console.log('cur year: ' + curdate.getYear() + '   cur month: ' + curdate.getMonth() + '   cur date: ' + curdate.getDate())
  console.log('Event year: ' + d.getYear())
  console.log('Event month: ' + d.getMonth())
  console.log('Event date: ' + d.getDate())
  return d.getYear() === curdate.getYear() && d.getMonth() === curdate.getMonth() && d.getDate() === curdate.getDate()
}

let eventStr = (event) => {
  return `${event.feature_image}

*${event.base_title}* - _${event.subtitle}_
     ${event.subtitle}:  ${event.event_time_text}
     ${event.arena} - ${event.location}

${event.trailer_url}
  `
}

let slackStr = (events) => {
  console.log(events.map((e) => eventStr(e)))
  return events.map((e) => eventStr(e)).join('\n\n')
}

let postToSlack = (message) => {
  request.post('https://slack.com/api/chat.postMessage')
    .type('form')
    .send({ token: SLACK_TOKEN })
    .send({ channel: SLACK_CHANNEL })
    .send({ text: message })
    .send({ username: SLACK_USERNAME })
    .send({ icon_emoji: SLACK_ICON_EMOJI })
    .end((err, res) => {
      console.log('Slack response:')
      console.dir(err)
      console.dir(res.body)
    })
}

request.get('http://ufc-data-api.ufc.com/api/v1/us/events')
  .end((err, res) => {
    if (err) {
      console.log('Error running requesting from ufc api')
      console.dir(err)
      return
    }
    events = []
    res.body.forEach((e) => {
      console.log('event date: ' + e.event_date)
      if (soon(e.event_date)) events.push(e)
    })
    console.log('Events: ')
    console.dir(events)
    const s = slackStr(events)
    console.log(`Events built.  Posting to slack: ${s}`)
    if (events.length > 0) {
      console.log(`Events to report: ${events.length}`)
      postToSlack(s)
    } else {
      console.log(`No events to report on`)
    }
  })
