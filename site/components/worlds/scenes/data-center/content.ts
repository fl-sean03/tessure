import type { SceneDefinition } from '../../contract'
export const definition: SceneDefinition = {
  "id": "data-center",
  "number": "02",
  "name": "Data center",
  "subtitle": "Presence is not permission",
  "description": "A service entrance. Two approaching vehicles. One matched arrival.",
  "lesson": "A location and an authorization are different facts.",
  "setting": "Campus service gate \u00b7 after rain",
  "duration": 44,
  "poster": "/worlds/data-center/poster.svg",
  "posterAlt": "Illustrative architectural site model for the data center sequence.",
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
      "title": "Another vehicle approaches",
      "body": "A second vehicle approaches behind an expected delivery.",
      "evidence": [
        {
          "source": "Approach camera",
          "detail": "A second vehicle approaches behind an expected delivery."
        }
      ]
    },
    {
      "id": "verify",
      "at": 7,
      "title": "Two separate tracks",
      "body": "Radar and camera observations separate the vehicles into two tracks.",
      "evidence": [
        {
          "source": "Radar",
          "detail": "Radar and camera observations separate the vehicles into two tracks."
        }
      ]
    },
    {
      "id": "correlate",
      "at": 14,
      "title": "Only one matched arrival",
      "body": "The illustrated gate record matches the scheduled arrival. The second vehicle remains unmatched.",
      "evidence": [
        {
          "source": "Gate record",
          "detail": "The illustrated gate record matches the scheduled arrival. The second vehicle remains unmatched."
        }
      ]
    },
    {
      "id": "decide",
      "at": 22,
      "title": "Request a separate check",
      "body": "The operator asks the gate team to verify the second arrival separately.",
      "evidence": [
        {
          "source": "Operator",
          "detail": "The operator asks the gate team to verify the second arrival separately."
        }
      ],
      "action": "Request gate verification"
    },
    {
      "id": "respond",
      "at": 30,
      "title": "The gate remains controlled",
      "body": "A guard approaches the normal stopping point while entry stays controlled.",
      "evidence": [
        {
          "source": "Gate team",
          "detail": "A guard approaches the normal stopping point while entry stays controlled."
        }
      ]
    },
    {
      "id": "resolve",
      "at": 38,
      "title": "A documented handoff",
      "body": "The observations and requested verification are recorded. Intent has not been determined.",
      "evidence": [
        {
          "source": "Event record",
          "detail": "The observations and requested verification are recorded. Intent has not been determined."
        }
      ]
    }
  ]
}
