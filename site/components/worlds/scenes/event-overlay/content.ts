import type { SceneDefinition } from '../../contract'
export const definition: SceneDefinition = {
  "id": "event-overlay",
  "number": "04",
  "name": "Event overlay",
  "subtitle": "Understand the flow",
  "description": "A shared concourse. Opposing movement. A decision made with the whole site in view.",
  "lesson": "See a changing flow without naming the people in it.",
  "setting": "Outdoor amphitheatre \u00b7 evening",
  "duration": 42,
  "poster": "/worlds/event-overlay/poster.svg",
  "posterAlt": "Illustrative architectural site model for the event overlay sequence.",
  "palette": {
    "background": "#d8dcd3",
    "fog": "#d8dcd3",
    "fogNear": 90,
    "fogFar": 210,
    "ambient": 1.5,
    "sun": "#fff2d6",
    "sunIntensity": 3,
    "sunPosition": [
      -35,
      55,
      25
    ]
  },
  "cameras": [
    {
      "at": 0,
      "position": [
        62,
        45,
        62
      ],
      "target": [
        0,
        0,
        0
      ],
      "mobilePosition": [
        80,
        75,
        96
      ]
    },
    {
      "at": 14,
      "position": [
        40,
        30,
        45
      ],
      "target": [
        0,
        1,
        0
      ],
      "mobilePosition": [
        72,
        65,
        85
      ]
    },
    {
      "at": 29,
      "position": [
        50,
        38,
        52
      ],
      "target": [
        0,
        1,
        0
      ],
      "mobilePosition": [
        75,
        70,
        90
      ]
    },
    {
      "at": 42,
      "position": [
        62,
        45,
        62
      ],
      "target": [
        0,
        0,
        0
      ],
      "mobilePosition": [
        80,
        75,
        96
      ]
    }
  ],
  "beats": [
    {
      "id": "detect",
      "at": 0,
      "title": "A flow begins to slow",
      "body": "Movement slows where two pedestrian paths meet.",
      "evidence": [
        {
          "source": "Wide camera",
          "detail": "Movement slows where two pedestrian paths meet."
        }
      ]
    },
    {
      "id": "verify",
      "at": 7,
      "title": "Opposing movement is visible",
      "body": "Adjacent camera views illustrate people moving in opposing directions.",
      "evidence": [
        {
          "source": "Adjacent view",
          "detail": "Adjacent camera views illustrate people moving in opposing directions."
        }
      ]
    },
    {
      "id": "correlate",
      "at": 14,
      "title": "A passage is closed",
      "body": "A closed-passage event adds context to the illustrated bottleneck.",
      "evidence": [
        {
          "source": "Passage status",
          "detail": "A closed-passage event adds context to the illustrated bottleneck."
        }
      ]
    },
    {
      "id": "decide",
      "at": 21,
      "title": "Bring in the event lead",
      "body": "The event lead chooses to direct arrivals along an approved alternate route.",
      "evidence": [
        {
          "source": "Event lead",
          "detail": "The event lead chooses to direct arrivals along an approved alternate route."
        }
      ],
      "action": "Direct arrivals to the alternate route"
    },
    {
      "id": "respond",
      "at": 29,
      "title": "Stewards open the other route",
      "body": "Stewards and wayfinding redirect movement in the authored sequence.",
      "evidence": [
        {
          "source": "Stewards",
          "detail": "Stewards and wayfinding redirect movement in the authored sequence."
        }
      ]
    },
    {
      "id": "resolve",
      "at": 36,
      "title": "A change with a recorded reason",
      "body": "The intervention and its supporting observations remain linked. This is not a crowd-safety prediction.",
      "evidence": [
        {
          "source": "Event record",
          "detail": "The intervention and its supporting observations remain linked. This is not a crowd-safety prediction."
        }
      ]
    }
  ]
}
