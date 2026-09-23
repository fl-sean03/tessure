import type { SceneDefinition } from '../../contract'
export const definition: SceneDefinition = {
  "id": "private-estate",
  "number": "01",
  "name": "Private estate",
  "subtitle": "The value of a quiet decision",
  "description": "A wooded hillside. An ambiguous movement. Enough context to leave the morning undisturbed.",
  "lesson": "Evidence can justify doing less.",
  "setting": "Woodland residence \u00b7 misty dawn",
  "duration": 42,
  "poster": "/worlds/private-estate/poster.svg",
  "posterAlt": "Illustrative architectural site model for the private estate sequence.",
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
      "title": "Movement at the garden edge",
      "body": "A camera marks movement near the garden. Its cause is still unknown.",
      "evidence": [
        {
          "source": "Camera",
          "detail": "A camera marks movement near the garden. Its cause is still unknown."
        }
      ]
    },
    {
      "id": "verify",
      "at": 7,
      "title": "A warm, low silhouette",
      "body": "A thermal view adds a low moving silhouette to the camera observation.",
      "evidence": [
        {
          "source": "Thermal",
          "detail": "A thermal view adds a low moving silhouette to the camera observation."
        }
      ]
    },
    {
      "id": "correlate",
      "at": 14,
      "title": "The path tells a quieter story",
      "body": "The illustrated shape and continuous path are consistent with an animal. No entrance event is shown.",
      "evidence": [
        {
          "source": "Site context",
          "detail": "The illustrated shape and continuous path are consistent with an animal. No entrance event is shown."
        }
      ]
    },
    {
      "id": "decide",
      "at": 21,
      "title": "Review before responding",
      "body": "The operator reviews the paired observations and chooses to record the movement as wildlife.",
      "evidence": [
        {
          "source": "Operator",
          "detail": "The operator reviews the paired observations and chooses to record the movement as wildlife."
        }
      ],
      "action": "Record as wildlife"
    },
    {
      "id": "respond",
      "at": 29,
      "title": "Record as wildlife",
      "body": "The notification is dismissed in this illustration. No guard is dispatched.",
      "evidence": [
        {
          "source": "Site response",
          "detail": "The notification is dismissed in this illustration. No guard is dispatched."
        }
      ]
    },
    {
      "id": "resolve",
      "at": 36,
      "title": "The reason stays with the record",
      "body": "The observation and the reason for dismissal remain linked in the event record.",
      "evidence": [
        {
          "source": "Event record",
          "detail": "The observation and the reason for dismissal remain linked in the event record."
        }
      ]
    }
  ]
}
