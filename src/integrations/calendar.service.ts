import { Injectable } from '@nestjs/common';

interface CalendarEvent {
  summary: string;
  description?: string;
  start: string;
  end: string;
  attendees?: string[];
}

@Injectable()
export class CalendarService {
  // Google Calendar
  async createGoogleEvent(accessToken: string, event: CalendarEvent) {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.start },
        end: { dateTime: event.end },
        attendees: event.attendees?.map(email => ({ email }))
      })
    });

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.statusText}`);
    }

    const res = await response.json();
    return { eventId: res.id };
  }

  async getGoogleEvents(accessToken: string, timeMin: string, timeMax: string) {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.statusText}`);
    }

    const res = await response.json();
    return res.items || [];
  }

  // Outlook Calendar
  async createOutlookEvent(accessToken: string, event: CalendarEvent) {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject: event.summary,
        body: { contentType: 'HTML', content: event.description || '' },
        start: { dateTime: event.start, timeZone: 'UTC' },
        end: { dateTime: event.end, timeZone: 'UTC' },
        attendees: event.attendees?.map(email => ({
          emailAddress: { address: email },
          type: 'required'
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`Microsoft Graph API error: ${response.statusText}`);
    }

    const res = await response.json();
    return { eventId: res.id };
  }

  async getOutlookEvents(accessToken: string, startDateTime: string, endDateTime: string) {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${encodeURIComponent(startDateTime)}&endDateTime=${encodeURIComponent(endDateTime)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Microsoft Graph API error: ${response.statusText}`);
    }

    const res = await response.json();
    return res.value;
  }
}
