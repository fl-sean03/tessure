import type { SceneDefinition } from '../../contract'
export const definition: SceneDefinition = {
  "id": "resort-marina",
  "number": "03",
  "name": "Resort & marina",
  "subtitle": "The shoreline is part of the site",
  "description": "A craft on the water. A service berth ahead. A response that fits the place.",
  "lesson": "Understand the boundary and the welcome beyond it.",
  "setting": "Sheltered inlet \u00b7 golden hour",
  "establishing": {"title": "Life along the water", "body": "Boats move through the marina while guests use the waterfront paths."},
  "duration": 50,
  "poster": "/worlds/resort-marina/poster.svg",
  "posterAlt": "Illustrative architectural site model for the resort & marina sequence.",
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
      "at": 20,
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
      "at": 36,
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
      "at": 50,
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
      "title": "A craft enters the picture",
      "body": "Shore radar illustrates a small craft approaching the marina.",
      "evidence": [
        {
          "source": "Shore radar",
          "detail": "Shore radar illustrates a small craft approaching the marina."
        }
      ]
    },
    {
      "id": "verify",
      "at": 12,
      "title": "A persistent vessel track",
      "body": "Thermal and camera observations corroborate the vessel track. Its purpose is unknown.",
      "evidence": [
        {
          "source": "Thermal + camera",
          "detail": "Thermal and camera observations corroborate the vessel track. Its purpose is unknown."
        }
      ]
    },
    {
      "id": "correlate",
      "at": 20,
      "title": "A service area ahead",
      "body": "The track approaches a service berth beside the public arrival route.",
      "evidence": [
        {
          "source": "Site boundary",
          "detail": "The track approaches a service berth beside the public arrival route."
        }
      ]
    },
    {
      "id": "decide",
      "at": 28,
      "title": "Choose a hospitable response",
      "body": "The operator asks harbor staff to guide the arrival to visitor access.",
      "evidence": [
        {
          "source": "Operator",
          "detail": "The operator asks harbor staff to guide the arrival to visitor access."
        }
      ],
      "action": "Ask harbor staff to guide arrival"
    },
    {
      "id": "respond",
      "at": 36,
      "title": "Guide toward visitor access",
      "body": "In the illustration, the vessel follows a new course toward the visitor berth.",
      "evidence": [
        {
          "source": "Harbor staff",
          "detail": "In the illustration, the vessel follows a new course toward the visitor berth."
        }
      ]
    },
    {
      "id": "resolve",
      "at": 44,
      "title": "Record the handoff",
      "body": "The observations and staff handoff are linked without assigning intent.",
      "evidence": [
        {
          "source": "Event record",
          "detail": "The observations and staff handoff are linked without assigning intent."
        }
      ]
    }
  ],
  "practicalLightLimit": 2
}
