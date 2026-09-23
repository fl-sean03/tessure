import type { SceneDefinition } from '../../contract'
export const definition: SceneDefinition = {
  "id": "logistics-yard",
  "number": "05",
  "name": "Logistics yard",
  "subtitle": "Put movement in context",
  "description": "A cargo move. An unmatched release. A clearer question for the person in charge.",
  "lesson": "An object track becomes useful when it meets site context.",
  "setting": "Intermodal yard \u00b7 first light",
  "duration": 44,
  "poster": "/worlds/logistics-yard/poster.svg",
  "posterAlt": "Illustrative architectural site model for the logistics yard sequence.",
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
      "at": 30,
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
      "at": 44,
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
      "title": "Cargo is on the move",
      "body": "A cargo-moving vehicle heads toward the outbound lane.",
      "evidence": [
        {
          "source": "Aisle camera",
          "detail": "A cargo-moving vehicle heads toward the outbound lane."
        }
      ]
    },
    {
      "id": "verify",
      "at": 7,
      "title": "The path comes into view",
      "body": "Camera and radar observations illustrate the vehicle and its load moving through the yard.",
      "evidence": [
        {
          "source": "Camera + radar",
          "detail": "Camera and radar observations illustrate the vehicle and its load moving through the yard."
        }
      ]
    },
    {
      "id": "correlate",
      "at": 14,
      "title": "A release does not match",
      "body": "The illustrated movement record shows no matching release. That is a question, not a finding of theft.",
      "evidence": [
        {
          "source": "Movement record",
          "detail": "The illustrated movement record shows no matching release. That is a question, not a finding of theft."
        }
      ]
    },
    {
      "id": "decide",
      "at": 22,
      "title": "Ask the supervisor",
      "body": "The supervisor chooses to hold the outbound release while the movement record is checked.",
      "evidence": [
        {
          "source": "Supervisor",
          "detail": "The supervisor chooses to hold the outbound release while the movement record is checked."
        }
      ],
      "action": "Hold release for a record check"
    },
    {
      "id": "respond",
      "at": 30,
      "title": "Hold at the verification point",
      "body": "The vehicle pauses at the normal verification point for the site team.",
      "evidence": [
        {
          "source": "Site team",
          "detail": "The vehicle pauses at the normal verification point for the site team."
        }
      ]
    },
    {
      "id": "resolve",
      "at": 38,
      "title": "Keep the evidence together",
      "body": "The track and decision are linked in a record marked awaiting site verification.",
      "evidence": [
        {
          "source": "Event record",
          "detail": "The track and decision are linked in a record marked awaiting site verification."
        }
      ]
    }
  ]
}
