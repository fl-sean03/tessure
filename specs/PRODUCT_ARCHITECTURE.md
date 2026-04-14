# Product Architecture

System-level architecture for the Tessure platform. Version 0.1 — pre-prototype. Decisions load-bearing for Year-1 execution; revisit at Fusion Node v2.

---

## Hardware: Fusion Node

**Reference design — Fusion Node Mid (most common SKU):**

| Component | Part | Notes |
|---|---|---|
| Compute | NVIDIA Jetson Orin NX 16GB | 100 TOPS AI perf; 4K video decode ×4. |
| Fallback compute | Hailo-8L + x86 mini-PC (Intel N100) | For supply constraints or cost-optimized SKU. |
| Ingress network | 2× GbE + 1× PoE+ (4 port) | PoE for camera direct-attach. |
| Storage | 512GB NVMe + 64GB eMMC | Event buffer + model cache. |
| Thermal | Passive heatsink + IP54 finned housing | No fans in IP67 variant. |
| Power | 12–48V DC, 40W typical, 80W peak | PoE++ compatible. |
| Wireless | WiFi 6 + optional LTE modem | LTE for backhaul on rural sites. |
| Enclosure | IP54 indoor / IP67 outdoor variant | Both on same PCB. |
| Physical security | Tamper switch + enclosure seal + crypto-attested TPM | |

**Target BOM cost:** $900 at 100-unit scale, $600 at 1000-unit scale.

---

## Sensor ingestion

| Modality | Protocol | Typical counts per node |
|---|---|---|
| Video (RGB) | ONVIF / RTSP / SRT / USB | 4 (Small), 16 (Mid), 64 (Large distributed) |
| Video (thermal) | ONVIF / GigE-Vision | 1–4 |
| Radar (ground + perimeter) | Vendor SDK: Echodyne, SpotterRF, TI mmWave (IWR6843) | 1–4 |
| Acoustic | MQTT / UDP | 1–8 (shot detection, glass break, rotor detection) |
| RF spectrum (for counter-UAS) | Aaronia SDR / Dedrone feed | 0–1 |
| Access control events | Genetec SDK, Lenel OnGuard, CCURE 9000 | event stream |
| SCADA / BMS anomalies | Modbus, BACnet, syslog | optional |
| Cyber events (for fused cyber-physical) | Splunk, Elastic, Sentinel webhook | optional |
| Environmental | Modbus, weather station | optional |

---

## Perception stack (edge)

Runs on Fusion Node. Model selection favors open-set + fine-tunable over closed SaaS.

| Stage | Models / libraries |
|---|---|
| Video pre-processing | NVIDIA DeepStream / GStreamer |
| Object detection (video) | YOLO v11 + Grounding DINO for zero-shot refinement |
| Segmentation / refine | SAM 2 on detection hits |
| Classifier (thermal) | Custom MobileNetV3 trained on thermal-persons dataset + FLIR public set |
| Radar processing | Vendor SDK + custom post-filter (Kalman tracks + Doppler signature DB) |
| Acoustic classifier | YAMNet + custom domain-adapted head |
| Face detection + privacy mask | RetinaFace + blur pipeline |

**Privacy default:** face blur ON, license-plate blur ON. Customers can enable plate/face recognition only with explicit legal sign-off and per-site toggle.

---

## Fusion engine

The differentiated core. Input: detection events from each modality. Output: **Fused Event** objects.

**Fusion decision model:**
1. **Temporal clustering.** Detections within a rolling 3-second window at the same geo-cell are grouped into a Candidate Event.
2. **Spatial corroboration.** Projects 2D detections to a shared 3D site map via per-sensor calibration. Multi-modality hit in the same 1m³ cell scores higher.
3. **Modality corroboration.** Separate confidence scores per modality → combined via learned Bayesian weighting (trained on customer-site data during pilot).
4. **Signature matching.** Optional class-level signature DB (wildlife thermal profile, vehicle ALPR, drone RF).
5. **Policy playbook lookup.** Event classification → customer-configured response (log only / notify / dispatch / auto-action with operator approval).

**Fusion output schema:**
```json
{
  "event_id": "ev_abc123",
  "site_id": "site_xyz",
  "timestamp": "2026-04-14T02:47:13Z",
  "classification": "human_intruder",
  "confidence": 0.94,
  "corroborating_modalities": ["video_ptz_07", "radar_01", "thermal_02"],
  "geo_cell": "grid:12-07",
  "evidence_refs": ["clip_abc123_01.mp4", "radar_track_01.json", "thermal_02.tiff"],
  "evidence_hash": "sha256:...",
  "proposed_response": "notify_operator + drone_dispatch",
  "auto_actions_taken": ["perimeter_lights_sector_3"],
  "requires_approval": ["drone_dispatch", "le_notify"]
}
```

---

## Evidence pipeline

Every confirmed event produces an **Evidence Package**:
- Raw clips (with redaction baked in) — 30 seconds pre-roll + full event duration.
- Radar tracks JSON.
- Thermal frame captures.
- Environmental telemetry.
- Acoustic recordings.
- Fusion decision log (why this event was classified).
- Operator actions (who approved what, when).

**Chain of custody:**
- SHA-256 hash of each artifact.
- Root hash aggregated into a Merkle tree.
- Signed with site-specific Tessure key, rooted in a per-customer Tessure signing authority.
- Stored locally (edge) + replicated to customer-chosen cloud (Tessure Cloud, customer S3, Azure Blob, GCS).
- Exportable as a signed PDF report for insurance / legal / LE.

This is load-bearing for insurance ROI and is a significant competitive moat vs camera-only products.

---

## Tessure Command (operator UI)

Thin web + mobile. **Not a VMS** — the customer keeps theirs.

Views:
- Live site dashboard (fused events only, no raw camera stream by default).
- Event detail: fused view + corroborating modalities side-by-side + operator action panel.
- Playbook library (who-approves-what thresholds).
- Audit trail (evidence, operator actions, SLA hits).
- Health panel (Fusion Node status, sensor coverage gaps).

**Performance target:** first-meaningful-paint <1.5s, event-to-operator <2s from fusion decision.

---

## Tessure Integrations

Adapters shipped as managed connectors:

| Target | Direction | Notes |
|---|---|---|
| Genetec Security Center | Event out → incident | SDK-based |
| Milestone XProtect | Event out → bookmark + metadata | XProtect MIP SDK |
| Lenel OnGuard | Access events in, event out | OpenAccess |
| CCURE 9000 | Access in, event out | REST |
| TAK / CoT | Event out → tactical picture | CoT XML, UDP multicast |
| Splunk / Elastic / Sentinel | Event out → SIEM | HTTP Event Collector |
| PagerDuty / Opsgenie | Critical event → page | webhook |
| ServiceNow | Evidence → record | REST |
| Slack / Teams | Alerts | webhook |

---

## Resilience / edge autonomy

- **24-hour offline operation.** Fusion Node continues full detect/verify/record during WAN loss.
- **Event queue.** Offline events queue locally; flush + hash-verify when WAN returns.
- **Firmware rollback.** Dual-slot A/B updates; failed update auto-rollback within 30s.
- **Sensor fault detection.** Missing/degraded sensor triggers operator notice within 60s; fusion adapts by down-weighting that modality.
- **Watchdog.** Hardware watchdog resets Node on stall (rare; mitigates kernel-level ML issues).

---

## Cloud backend (Tessure Cloud)

Only what cannot live on edge.

- **Identity / tenant / billing** (Stripe).
- **Fleet management** (firmware + model distribution).
- **Evidence archive** (customer-scoped, optional — many customers keep evidence local only).
- **Multi-site aggregation** for enterprise tier (cross-site dashboards).
- **Model training pipeline** (opt-in, with per-site data governance).

Stack: Rust services + PostgreSQL + S3-compatible object store + Pulsar or NATS for event bus. Deployment: AWS primary + one Equinix colo for on-prem compliance customers. No raw sensor data in Tessure Cloud unless customer opts in.

---

## Security architecture

- **Per-site key pair.** Enrolled via out-of-band hardware attestation (TPM).
- **mTLS everywhere.** Node ↔ Cloud + Node ↔ Command.
- **Zero-trust posture.** Nodes cannot initiate connection to Cloud except through signed channel.
- **Supply-chain integrity.** Firmware images signed; boot-time attestation.
- **Pen-testing.** Quarterly third-party pen-test (Bishop Fox or NCC Group). Public disclosure of resolved findings after 90 days.

---

## What this architecture chooses NOT to do

- **No cloud-primary pipeline.** Edge-first or no feature.
- **No proprietary camera tie-in.** ONVIF/RTSP only; no Tessure cameras.
- **No identity recognition by default.** Opt-in per site, legal-reviewed.
- **No kinetic response.** No pursuit drones, no projectile systems. Notify + evidence + customer-owned response only.
- **No autonomy above human-in-the-loop risk thresholds.** Document and publish thresholds.

---

## Key unanswered design questions (for Phase 2 / engineering prototype)

1. **Bayesian weighting vs. end-to-end learned fusion?** Start Bayesian (interpretable, tunable); add end-to-end head only if fusion head beats it on held-out sites.
2. **Model update cadence?** Weekly nudges vs monthly releases vs continuous. Defer to Month 6 with real customer data.
3. **Customer-side ML opt-out.** Some customers will not allow model training on their data. Design the opt-out from day 1.
4. **Federated learning for multi-customer model improvement** — possible but legally complex. Year 2+ question.
5. **Radar sensor certification.** FCC Part 15 or Part 90; TBD by SKU and frequency.
