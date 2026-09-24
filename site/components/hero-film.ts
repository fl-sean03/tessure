// Original logistics-world film; times below are film edit boundaries, not product response times.
export const heroFilm = {
  "src": "/worlds/logistics-yard/intro.mp4",
  "poster": "/worlds/logistics-yard/intro-poster.webp",
  "posterAlt": "A gantry carries marked load A7 past its empty assigned bay toward a waiting carrier in an amber-lit logistics yard.",
  "duration": 12,
  "moments": [
    {
      "at": 0,
      "title": "A marked load takes the wrong route.",
      "detail": "Authored cargo diversion · camera observation",
      "sources": 1
    },
    {
      "at": 4,
      "title": "Different views add context.",
      "detail": "Camera, radar and proposed thermal",
      "sources": 3
    },
    {
      "at": 6,
      "title": "Wrong transfer. No authorized release.",
      "detail": "Proposed local correlation · exit stays held",
      "sources": 3
    },
    {
      "at": 9,
      "title": "A person directs the response.",
      "detail": "The supervisor maintains the local hold",
      "sources": 3
    }
  ]
} as const
