import type { SceneDefinition } from '../../contract'
export const definition: SceneDefinition = {
  "id": "critical-infrastructure",
  "number": "06",
  "name": "Critical infrastructure",
  "subtitle": "Context when the link goes quiet",
  "description": "A remote site. An unavailable connection. The local picture still matters.",
  "lesson": "Make connection loss a visible state with clear limitations.",
  "setting": "Remote substation \u00b7 blue hour",
  "establishing": {"title": "A normal maintenance window", "body": "A crew works at a remote utility site while observations are processed locally."},
  "duration": 52,
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
      "at": 38,
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
      "at": 52,
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
      "at": 12,
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
      "at": 20,
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
      "at": 29,
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
      "at": 38,
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
      "at": 46,
      "title": "Ready to synchronize",
      "body": "Connectivity returns in the sequence and the record is ready to synchronize. No real offline performance is demonstrated.",
      "evidence": [
        {
          "source": "Queued record",
          "detail": "Connectivity returns in the sequence and the record is ready to synchronize. No real offline performance is demonstrated."
        }
      ]
    }
  ],
  "practicalLightLimit": 2
}
