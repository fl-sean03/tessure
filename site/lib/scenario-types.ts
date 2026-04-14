export type ScenarioType =
  | "private-estate"
  | "data-center"
  | "resort-marina"
  | "event-overlay"
  | "logistics-yard"
  | "critical-infrastructure"

export type ScenarioConfig = {
  id: ScenarioType
  name: string
  description: string
  environment: string
  threats: string[]
  sensors: string[]
  responses: string[]
  kpis: {
    detectToVerify: string
    mtta: string
    falsePositive: string
  }
  explanation: {
    situation: string
    detection: string
    verification: string
    response: string
    outcome: string
  }
}

export const SCENARIOS: Record<ScenarioType, ScenarioConfig> = {
  "private-estate": {
    id: "private-estate",
    name: "High-Value Private Estate",
    description: "Perimeter intrusion detection at a 50-acre family office compound",
    environment: "Wooded estate with main residence, guest houses, and perimeter fence",
    threats: ["Human intrusion", "Surveillance attempt", "Protest spillover"],
    sensors: ["Thermal cameras", "Perimeter radar", "Ground sensors", "PTZ cameras"],
    responses: ["Drone dispatch", "Perimeter lighting", "Security alert", "Evidence capture"],
    kpis: {
      detectToVerify: "18s",
      mtta: "42s",
      falsePositive: "2.1%",
    },
    explanation: {
      situation:
        "An unauthorized individual breaches the perimeter fence at 2:47 AM, attempting to approach the main residence through wooded terrain.",
      detection:
        "Ground-based radar detects motion at sector 3. Thermal cameras confirm human heat signature. Multi-sensor fusion eliminates false positive from wildlife (deer have different thermal + motion profiles).",
      verification:
        "Autonomous drone dispatches from dock, reaches perimeter in 12 seconds. High-resolution visible + thermal imaging confirms single adult male, no visible weapons. Facial recognition attempted but subject wearing mask.",
      response:
        "SOP engine activates: perimeter lights illuminate sector 3, audible warning broadcast, security team alerted via encrypted push. Drone maintains tracking at safe distance. Gate access points automatically locked. Evidence package begins compilation.",
      outcome:
        "Subject retreats within 38 seconds of detection. Full incident timeline, sensor telemetry, and 4K video evidence packaged and cryptographically signed within 6 minutes. False alarm rate remains at 2.1% (well below 5% SLA). Zero guard deployment required.",
    },
  },
  "data-center": {
    id: "data-center",
    name: "Data Center Campus",
    description: "Vehicle ram attack with coordinated cyber reconnaissance",
    environment: "Multi-building campus with vehicle gates, loading docks, and restricted zones",
    threats: ["Vehicle ram attack", "Tailgating", "Cyber reconnaissance", "Insider assistance"],
    sensors: ["ALPR cameras", "Undercarriage scanners", "Bollard sensors", "Network traffic monitors", "Badge readers"],
    responses: ["Bollard deployment", "Gate lockdown", "SOC alert", "Law enforcement notification"],
    kpis: {
      detectToVerify: "8s",
      mtta: "15s",
      falsePositive: "1.3%",
    },
    explanation: {
      situation:
        "At 11:23 AM, an unregistered vehicle approaches Gate 2 at high speed (45 mph in 15 mph zone). Simultaneously, network sensors detect port-scanning activity from an internal IP address.",
      detection:
        "ALPR flags unknown plate. Speed radar triggers alert. Undercarriage scanner detects anomalous mass distribution. Cyber telemetry correlates timing: port scan began 90 seconds before vehicle approach, suggesting coordinated attack.",
      verification:
        "PTZ cameras capture driver + passenger faces. Vehicle make/model cross-referenced against threat database—no match, but rental vehicle from out-of-state. Cyber team confirms port scan targeting building management system (BMS). Multi-vector threat confirmed.",
      response:
        "Automated bollards deploy in 2.1 seconds, creating physical barrier. Gate 2 locks down. All other gates switch to heightened verification mode. SOC receives fused alert (physical + cyber). Law enforcement auto-notified with evidence package. Internal IP isolated by network segmentation.",
      outcome:
        "Vehicle stops 40 feet from bollards, reverses, and flees. License plate, facial captures, and cyber forensics shared with authorities within 4 minutes. Port scan traced to compromised IoT camera (firmware outdated). Camera isolated and patched. Incident contained with zero physical breach and no data exfiltration.",
    },
  },
  "resort-marina": {
    id: "resort-marina",
    name: "Luxury Resort & Marina",
    description: "Waterborne intrusion with aerial surveillance drone",
    environment: "Coastal resort with private beach, marina slips, and guest villas",
    threats: ["Waterborne intrusion", "UAS surveillance", "Guest privacy violation", "Theft from vessels"],
    sensors: ["Marine radar", "Thermal PTZ", "RF drone detectors", "Acoustic sensors", "Water-level sensors"],
    responses: ["Marine patrol alert", "Drone tracking", "Guest notification", "Harbor master coordination"],
    kpis: {
      detectToVerify: "22s",
      mtta: "55s",
      falsePositive: "3.8%",
    },
    explanation: {
      situation:
        "At 9:15 PM, a small watercraft (likely kayak or inflatable) enters the marina's restricted zone from open water. Simultaneously, RF sensors detect a consumer drone operating 200 feet offshore.",
      detection:
        "Marine radar picks up slow-moving surface contact at 0.8 knots. Thermal cameras confirm human heat signature in small vessel. RF detector identifies DJI Mavic 3 drone transmitting video. Acoustic sensors detect low-frequency motor noise consistent with electric trolling motor.",
      verification:
        "Shoreline PTZ cameras zoom to watercraft—two individuals, no visible resort credentials. Drone flight path analyzed: circling guest villa area, likely filming. Micro-Doppler signature confirms drone (not bird). Vessel trajectory projects toward private dock area.",
      response:
        "Marina security patrol dispatched via encrypted radio. Tethered observation drone (legal under resort airspace waiver) launches to track UAS from safe distance. Perimeter lights activate along shoreline. Affected villa guests receive discreet notification. Harbor master alerted for potential Coast Guard coordination.",
      outcome:
        "Watercraft occupants notice lights and patrol boat, reverse course and exit marina zone. Aerial drone returns to operator on public beach (outside jurisdiction). Incident logged with timestamps, thermal/visible footage, RF signature, and GPS tracks. Resort legal reviews for potential trespass filing. Guest privacy maintained—no villa interiors captured on resort systems.",
    },
  },
  "event-overlay": {
    id: "event-overlay",
    name: "High-Profile Event Overlay",
    description: "Crowd surge detection and wrong-way flow at 15,000-person venue",
    environment: "Temporary event site with multiple entry/exit points, stages, and VIP areas",
    threats: ["Crowd surge", "Wrong-way flow", "Unattended bags", "Perimeter breach", "Medical emergency"],
    sensors: [
      "Crowd density cameras",
      "Thermal imaging",
      "LPR at vehicle lanes",
      "RF monitors",
      "Portable radar masts",
    ],
    responses: ["Crowd flow alerts", "Security dispatch", "Medical response", "PA announcements", "Gate modulation"],
    kpis: {
      detectToVerify: "12s",
      mtta: "28s",
      falsePositive: "4.2%",
    },
    explanation: {
      situation:
        "During headline performance at 10:42 PM, crowd density near Stage B exceeds 7 people per square meter (danger threshold: 5.5). Simultaneously, thermal cameras detect individuals moving against designated exit flow in Corridor 3.",
      detection:
        "AI-powered crowd analytics flag density spike in real-time. Thermal imaging confirms body heat concentration. Wrong-way flow detected: 12 individuals pushing upstream in exit corridor (potential stampede risk or security breach).",
      verification:
        "Portable mast cameras provide overhead view—crowd compression visible, no clear egress path. Wrong-way individuals identified: 8 appear intoxicated (erratic movement), 4 moving purposefully toward restricted backstage area. No weapons visible. Medical risk assessed as moderate (heat stress + compression).",
      response:
        "Automated PA announcement: 'Please step back from Stage B, allow space for safety.' Security teams dispatched to both incidents (crowd + wrong-way). Stage lighting adjusted to encourage crowd dispersal. VIP area access temporarily locked. Medical standby team alerted. Incident command receives fused alert with live video feeds.",
      outcome:
        "Crowd density reduces to 4.2 people/sqm within 90 seconds (PA + security presence). Wrong-way individuals intercepted—4 attempting unauthorized backstage access (credentials checked, escorted out), 8 intoxicated guests redirected to medical tent. Zero injuries. Zero stampede. Event continues safely. Full incident timeline and crowd heatmaps archived for post-event review and future planning.",
    },
  },
  "logistics-yard": {
    id: "logistics-yard",
    name: "Industrial Logistics Yard",
    description: "Cargo theft attempt with suspected insider assistance",
    environment: "24/7 freight yard with container storage, truck gates, and rail access",
    threats: ["Cargo theft", "Insider threat", "Fence cutting", "Vehicle spoofing", "After-hours intrusion"],
    sensors: [
      "Fence-mounted fiber optic",
      "Container RFID",
      "Gate ALPR",
      "Thermal perimeter cameras",
      "Employee badge tracking",
    ],
    responses: ["Security patrol", "Container lock verification", "Access revocation", "Law enforcement alert"],
    kpis: {
      detectToVerify: "14s",
      mtta: "35s",
      falsePositive: "2.7%",
    },
    explanation: {
      situation:
        "At 3:18 AM, fiber optic fence sensors detect vibration at Section 7 (rear perimeter, low visibility). Simultaneously, RFID system shows high-value container C-4472 (electronics shipment) moved 40 feet from logged position—but no authorized forklift dispatch recorded.",
      detection:
        "Fence sensor pinpoints 12-foot section under stress (cutting attempt). Container RFID movement triggers geo-fence violation. Badge system cross-reference: Employee ID #2847 (forklift operator) badged in at 2:55 AM—off-shift, no scheduled work. Thermal cameras detect two heat signatures near container, one near fence.",
      verification:
        "PTZ cameras zoom to fence line—one individual using bolt cutters. Second individual operating forklift (no headlights, moving container toward fence breach point). Facial recognition attempted: forklift operator matches Employee #2847. Second individual unknown (no badge, face obscured). Coordinated insider-assisted theft confirmed.",
      response:
        "Security patrol dispatched (ETA 90 seconds). Forklift remotely disabled via telematics (engine kill switch). Perimeter lights activate at Section 7. Employee #2847 access credentials revoked instantly. Law enforcement auto-notified with live video feed and evidence package. Container C-4472 GPS tracker activated (backup measure).",
      outcome:
        "Suspects flee on foot through partial fence breach before patrol arrival. Forklift immobilized, container secured (no theft). Employee #2847 identified and terminated; criminal charges filed. External accomplice remains at large but captured on 4K video (facial biometrics shared with police). Fence repaired within 2 hours. Incident cost: $0 cargo loss, $1,200 fence repair vs. $340,000 container value protected.",
    },
  },
  "critical-infrastructure": {
    id: "critical-infrastructure",
    name: "Critical Infrastructure Site",
    description: "Multi-vector coordinated attack: drone swarm + vehicle + cyber",
    environment: "Power substation with transformers, control buildings, and perimeter fencing",
    threats: [
      "Drone swarm attack",
      "Vehicle-borne IED",
      "Cyber intrusion",
      "Sniper overwatch",
      "Coordinated multi-vector",
    ],
    sensors: [
      "Counter-UAS radar",
      "RF spectrum analyzer",
      "Seismic sensors",
      "Long-range thermal",
      "SCADA anomaly detection",
    ],
    responses: [
      "Authority notification",
      "Facility lockdown",
      "Drone tracking",
      "Cyber isolation",
      "Emergency shutdown protocols",
    ],
    kpis: {
      detectToVerify: "6s",
      mtta: "18s",
      falsePositive: "0.9%",
    },
    explanation: {
      situation:
        "At 1:34 AM, counter-UAS radar detects four small drones approaching from different vectors (north, east, south, west). Simultaneously, SCADA monitoring detects unauthorized login attempt on transformer control system. Seismic sensors pick up heavy vehicle approaching perimeter road.",
      detection:
        "RF spectrum analyzer confirms four DJI-style drones transmitting on 2.4 GHz + 5.8 GHz (coordinated swarm behavior). Cyber telemetry: brute-force attack on SCADA credentials, originating from IP address in Eastern Europe (likely VPN exit node). Seismic signature: large truck, estimated 8+ tons, speed 35 mph on access road (no authorized deliveries scheduled).",
      verification:
        "Long-range thermal cameras (2km range) capture truck—box truck, no company markings, driver + passenger visible. Drone swarm altitude: 150 feet, converging on transformer yard. Micro-Doppler analysis: drones carrying payloads (estimated 2-5 lbs each—potential explosives or EMP devices). SCADA attack escalates: attacker gained read-only access to grid load data. Multi-vector coordinated attack confirmed.",
      response:
        "IMMEDIATE: Facility enters lockdown. All personnel shelter in hardened control room. SCADA system isolated from WAN (air-gap mode). Backup power activated. Authority notification: FBI, DHS, local law enforcement, grid operator—all auto-alerted with live telemetry. Drone tracks shared with FAA. Counter-UAS protocol: detection + tracking only (no jamming without federal authorization). Long-range cameras maintain eyes on truck. Emergency shutdown protocols armed (ready to de-energize transformers if drones breach perimeter).",
      outcome:
        "Truck stops 800 meters from perimeter (likely spotted cameras/lights), reverses, and flees. Drones hover at perimeter for 43 seconds, then return to origin points (operators likely realized detection). SCADA attack blocked—attacker gained no control authority, only read-only load data (non-critical). Zero physical damage. Zero downtime. Full incident package (drone telemetry, RF signatures, thermal video, SCADA logs, truck imagery) delivered to federal authorities within 8 minutes. Investigation ongoing—suspected nation-state reconnaissance or domestic extremist probing. Facility remains operational with heightened alert status.",
    },
  },
}
