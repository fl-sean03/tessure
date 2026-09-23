import type { SceneDefinition } from '../../contract'
export const definition: SceneDefinition = {
  "id": "critical-infrastructure",
  "number": "06",
  "name": "Critical infrastructure",
  "subtitle": "Context when the link goes quiet",
  "description": "A remote site. An unavailable connection. The local picture still matters.",
  "lesson": "Make connection loss a visible state with clear limitations.",
  "setting": "Remote substation \u00b7 blue hour",
  "duration": 48,
  "poster": "/worlds/critical-infrastructure/poster.svg",
  "posterAlt": "Illustrative architectural site model for the critical infrastructure sequence.",
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
      "at": 16,
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
      "at": 34,
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
      "at": 48,
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
      "title": "Movement during a link interruption",
      "body": "Perimeter movement appears as the illustrated remote connection becomes unavailable.",
      "evidence": [
        {
          "source": "Perimeter sensor",
          "detail": "Perimeter movement appears as the illustrated remote connection becomes unavailable."
        }
      ]
    },
    {
      "id": "verify",
      "at": 8,
      "title": "Local observations continue",
      "body": "A local thermal view and camera observation add context to the movement.",
      "evidence": [
        {
          "source": "Thermal + camera",
          "detail": "A local thermal view and camera observation add context to the movement."
        }
      ]
    },
    {
      "id": "correlate",
      "at": 16,
      "title": "The missing connection is explicit",
      "body": "The proposed local node correlates observations while the remote link remains unavailable. Intent is unknown.",
      "evidence": [
        {
          "source": "Local node",
          "detail": "The proposed local node correlates observations while the remote link remains unavailable. Intent is unknown."
        }
      ]
    },
    {
      "id": "decide",
      "at": 25,
      "title": "Review locally",
      "body": "An on-site operator asks the local guard team to verify the event.",
      "evidence": [
        {
          "source": "On-site operator",
          "detail": "An on-site operator asks the local guard team to verify the event."
        }
      ],
      "action": "Request local guard verification"
    },
    {
      "id": "respond",
      "at": 34,
      "title": "A local handoff; a queued record",
      "body": "The authored illustration shows the local handoff and a queued event record.",
      "evidence": [
        {
          "source": "Local guard team",
          "detail": "The authored illustration shows the local handoff and a queued event record."
        }
      ]
    },
    {
      "id": "resolve",
      "at": 42,
      "title": "Ready to synchronize",
      "body": "Connectivity returns in the sequence and the record is ready to synchronize. No real offline performance is demonstrated.",
      "evidence": [
        {
          "source": "Queued record",
          "detail": "Connectivity returns in the sequence and the record is ready to synchronize. No real offline performance is demonstrated."
        }
      ]
    }
  ]
}
