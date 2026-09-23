import type { SceneDefinition } from '../../contract'
export const definition: SceneDefinition = {
  "id": "event-overlay",
  "number": "04",
  "name": "Event overlay",
  "subtitle": "Understand the flow",
  "description": "A shared concourse. Opposing movement. A decision made with the whole site in view.",
  "lesson": "See a changing flow without naming the people in it.",
  "setting": "Outdoor amphitheatre \u00b7 evening",
  "establishing": {"title": "A site in motion", "body": "Arrivals, staff and service traffic share a temporary event site."},
  "duration": 46,
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
    ],
    "hemisphereSky": "#d4e6ed",
    "hemisphereGround": "#6c6955",
    "hemisphereIntensity": 0.7,
    "exposure": 1.0,
    "toneMapping": "aces",
    "shadowBounds": {
      "left": -65,
      "right": 65,
      "top": 65,
      "bottom": -65,
      "near": 1,
      "far": 210,
      "bias": -0.0004,
      "normalBias": 0.06,
      "mapSize": 1024
    }
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
      ],
      "easing": "smoother",
      "interpolation": "spline"
    },
    {
      "at": 4,
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
      ],
      "easing": "smooth",
      "interpolation": "spline"
    },
    {
      "at": 18,
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
      ],
      "easing": "smooth",
      "interpolation": "spline"
    },
    {
      "at": 33,
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
      ],
      "easing": "smooth",
      "interpolation": "spline"
    },
    {
      "at": 46,
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
      ],
      "easing": "smooth",
      "interpolation": "spline"
    }
  ],
  "beats": [
    {
      "id": "detect",
      "at": 4,
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
      "at": 11,
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
      "at": 18,
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
      "at": 25,
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
      "at": 33,
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
      "at": 40,
      "title": "A change with a recorded reason",
      "body": "The intervention and its supporting observations remain linked. This is not a crowd-safety prediction.",
      "evidence": [
        {
          "source": "Event record",
          "detail": "The intervention and its supporting observations remain linked. This is not a crowd-safety prediction."
        }
      ]
    }
  ],
  "practicalLightLimit": 2
}
