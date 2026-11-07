import React, { useState, useMemo } from 'react';
import { ArrowLeft, ArrowUpRight, Search } from 'lucide-react';
import {
  SubpageId,
  computeTelescopeSNR,
  filterSatelliteScenes,
  SatelliteArchiveScene,
} from '../utils/nebulaMath';

interface SSGISubpageViewProps {
  activeSubpage: SubpageId;
  initialFocusItem?: string;
  onSelectSubpage: (subpage: SubpageId, focusItem?: string) => void;
  onBackToStage: (targetSectionIndex?: number) => void;
  onOpenProposalModal: (topic: string) => void;
}

const SUBPAGE_TABS: ReadonlyArray<{
  id: SubpageId;
  label: string;
  shortLabel: string;
  stageSectionIndex: number;
}> = [
  {
    id: 'missions',
    label: 'Orbital Space Service',
    shortLabel: 'Missions',
    stageSectionIndex: 3,
  },
  {
    id: 'observatory',
    label: 'Entoto Observatory',
    shortLabel: 'Observatory',
    stageSectionIndex: 2,
  },
  {
    id: 'capabilities',
    label: 'Directorates & GIS',
    shortLabel: 'Capabilities',
    stageSectionIndex: 4,
  },
  {
    id: 'scientists',
    label: 'Scientific Directorate',
    shortLabel: 'Scientists',
    stageSectionIndex: 5,
  },
  {
    id: 'portal',
    label: 'Digital Ground Archive',
    shortLabel: 'Data Portal',
    stageSectionIndex: 6,
  },
];

const SATELLITE_FLEET = [
  {
    id: 'ETRSS-1',
    name: 'ETRSS-1',
    fullName: 'Ethiopian Remote Sensing Satellite-1',
    status: 'Operational in SSO',
    launchDate: '20 Dec 2019 · Taiyuan Launch Complex',
    orbit: '700 km Sun-Synchronous · 98.2°',
    mass: '65 kg Micro-Satellite Bus',
    gsd: '13.75 m Multispectral · 60 km Swath',
    bands: '4 VNIR Spectral Channels (B, G, R, NIR)',
    revisit: '4 Days Off-Nadir · 14 Daily Entoto Passes',
    downlinkRate: '300 Mbps X-Band Direct',
    missionSummary:
      'Ethiopia’s flagship sovereign Earth observation platform, operated directly from the 3,200-meter Entoto Multi-Satellite Ground Receiving Station. Delivers continuous multispectral telemetry for agricultural yield forecasting, Blue Nile and Awash basin hydrology, and drought resilience.',
    lifecycleSteps: [
      {
        phase: 'Payload Tasking & Uplink',
        detail:
          'Mission coordinates uploaded via S-band command link from Mount Entoto during morning and evening horizon passes.',
      },
      {
        phase: 'Sun-Synchronous Pushbroom Capture',
        detail:
          '60 km wide multispectral swath imaged at 10:30 local solar time across the Horn of Africa.',
      },
      {
        phase: '300 Mbps X-Band Downlink',
        detail:
          'Raw Level-0 payload streams received in real time by the 7.3-meter autotrack parabolic dish at Entoto.',
      },
      {
        phase: 'Level-2A Cloud Delivery',
        detail:
          'Radiometrically calibrated, orthorectified scenes delivered to federal ministries and research universities within 6 hours.',
      },
    ],
  },
  {
    id: 'ET-SMART-RSS',
    name: 'ET-SMART-RSS',
    fullName: 'Ethio-Smart High-Resolution NanoSat',
    status: 'Operational in SSO',
    launchDate: '22 Dec 2020 · Wenchang Orbital Complex',
    orbit: '515 km Sun-Synchronous · 97.4°',
    mass: '12.5 kg High-Agility 6U+ Platform',
    gsd: '5.8 m Panchromatic / VNIR · 28 km Swath',
    bands: '5 Channels including Red-Edge Chlorophyll',
    revisit: '3 Days Targeted Slew',
    downlinkRate: '160 Mbps X-Band',
    missionSummary:
      'High-agility nanosatellite engineered for 5.8-meter urban infrastructure mapping, Rift Valley tectonic fault displacement monitoring, and localized flood and crop-stress assessment.',
    lifecycleSteps: [
      {
        phase: 'Rapid Slew Targeting',
        detail:
          'Zero-momentum reaction wheels slew the spacecraft up to ±30° off-nadir to capture priority Ethiopian corridors.',
      },
      {
        phase: 'High-Resolution CMOS Imaging',
        detail:
          'Compact Cassegrain optical payload resolves municipal road networks, dam reservoirs, and fault scarps at 5.8m GSD.',
      },
      {
        phase: 'Onboard Cloud Screening',
        detail:
          'Solid-state flight processor prioritizes cloud-free frames prior to X-band downlink window.',
      },
      {
        phase: 'GIS Cadastre Integration',
        detail:
          'Orthomosaics ingested directly into the National Geodetic Reference Frame (ETH-CORS) portal.',
      },
    ],
  },
  {
    id: 'ET-SAT-2',
    name: 'ET-SAT-2 Hosted 12U',
    fullName: 'Shared 12U Hyperspectral CubeSat Service',
    status: 'AIT Qualification · Q4 2027 Slot',
    launchDate: 'Addis Ababa ISO-7 AIT Cleanroom',
    orbit: '550 km Dawn–Dusk SSO · 97.6°',
    mass: '22 kg 12U Modular Shared Bus',
    gsd: '4.2 m VNIR + 32-Band Hyperspectral',
    bands: '400 nm – 1,000 nm Continuous Spectral Cube',
    revisit: '2.5 Days Constellation Pair',
    downlinkRate: '400 Mbps X-Band + L-Band Relay',
    missionSummary:
      'Modeled on shared satellite space-service architecture: Ethiopian universities and East African research teams integrate custom sensors onto a single flight-proven 12U bus assembled and qualified in Addis Ababa.',
    lifecycleSteps: [
      {
        phase: 'Shared Payload Allocation',
        detail:
          'Research teams reserve 1U–4U payload volume with standardized power, CAN/SpaceWire data bus, and thermal interfaces.',
      },
      {
        phase: 'Cleanroom AIT & Thermal-Vacuum',
        detail:
          'Full vibration, EMI/EMC, and thermal-vacuum qualification executed at SSGI’s Addis Ababa AIT facility.',
      },
      {
        phase: 'Rideshare Launch & LEOP',
        detail:
          'Turnkey launch manifest coordination, ITU frequency registration, and Launch & Early Orbit Phase commissioning.',
      },
      {
        phase: 'Digital Ground Station API',
        detail:
          'Researchers command their payload and retrieve downlinked telemetry packets via web API from Addis Ababa.',
      },
    ],
  },
  {
    id: 'ENTOTO-GS',
    name: 'Entoto Digital Ground',
    fullName: 'Multi-Satellite Receiving & Command Complex',
    status: '24/7 Mission Operations',
    launchDate: 'Commissioned 2019 · Upgraded 2025',
    orbit: '09°06′04″N, 38°45′58″E · 3,200m',
    mass: '7.3m & 4.5m Dual Full-Motion Dishes',
    gsd: 'S-Band TT&C · X-Band High-Rate',
    bands: 'L / S / X Band Multi-Mission',
    revisit: 'Horizon-to-Horizon (>5° Elevation)',
    downlinkRate: '300+ Mbps Fiber Link to HQ',
    missionSummary:
      'Perched atop Mount Entoto above Addis Ababa, SSGI’s ground station provides automated horizon-to-horizon tracking, command uplink, and high-rate payload reception for national and partner spacecraft.',
    lifecycleSteps: [
      {
        phase: 'Automated Pass Scheduling',
        detail:
          'Flight dynamics software computes orbital TLEs and schedules conflict-free antenna tracking across 14+ daily passes.',
      },
      {
        phase: 'Dual-Dish S/X-Band Reception',
        detail:
          'Simultaneous S-band telemetry health monitoring and high-speed X-band imagery demodulation.',
      },
      {
        phase: 'Petabyte Sovereign Archive',
        detail:
          'Direct optical-fiber ingestion into SSGI’s high-performance geospatial storage cluster in Addis Ababa.',
      },
      {
        phase: 'Open Research Distribution',
        detail:
          'Standardized STAC catalog access for Ethiopian ministries, universities, and African Space Agency partners.',
      },
    ],
  },
] as const;

const ETHIOPIAN_TARGET_ZONES = [
  {
    id: 'abbay',
    name: 'Abbay (Blue Nile) & GERD Basin',
    coords: '11.21°N, 35.09°E',
    nextPassEat: '10:42 EAT (UTC+3)',
    offNadirDeg: '4.2°',
    elevationDeg: '83.6°',
    downlinkMb: '1,420 MB',
    turnaround: '4.5 Hours to Level-2A',
    priorityApplication:
      'Reservoir water volume, turbine intake sediment, and upper watershed rainfall runoff.',
  },
  {
    id: 'addis',
    name: 'Addis Ababa & Sheger Corridor',
    coords: '09.03°N, 38.74°E',
    nextPassEat: '10:44 EAT (UTC+3)',
    offNadirDeg: '1.8°',
    elevationDeg: '87.9°',
    downlinkMb: '980 MB',
    turnaround: '3.0 Hours to Level-2A',
    priorityApplication:
      '1:2,000 urban expansion mapping, green-belt forestry, and riverside corridor cadastre.',
  },
  {
    id: 'afar',
    name: 'Afar Rift & Erta Ale Geothermal',
    coords: '13.60°N, 40.66°E',
    nextPassEat: '10:39 EAT (UTC+3)',
    offNadirDeg: '6.5°',
    elevationDeg: '78.4°',
    downlinkMb: '1,180 MB',
    turnaround: '5.0 Hours to Level-2A',
    priorityApplication:
      'Tectonic rifting deformation, volcanic thermal anomalies, and potash basin mapping.',
  },
  {
    id: 'bale',
    name: 'Bale Mountains & Harenna Forest',
    coords: '06.88°N, 39.73°E',
    nextPassEat: '10:46 EAT (UTC+3)',
    offNadirDeg: '3.4°',
    elevationDeg: '84.1°',
    downlinkMb: '1,310 MB',
    turnaround: '4.0 Hours to Level-2A',
    priorityApplication:
      'Afroalpine biodiversity conservation, wildfire early detection, and Wabi Shebelle headwaters.',
  },
  {
    id: 'tana',
    name: 'Lake Tana & Fogera Floodplain',
    coords: '12.00°N, 37.30°E',
    nextPassEat: '10:41 EAT (UTC+3)',
    offNadirDeg: '2.9°',
    elevationDeg: '85.5°',
    downlinkMb: '1,090 MB',
    turnaround: '3.5 Hours to Level-2A',
    priorityApplication:
      'Aquatic hyacinth bloom tracking, wetland hydrology, and irrigated rice crop health.',
  },
] as const;

const FLIGHT_MANIFEST = [
  {
    window: 'Q4 2026 · Daily Window',
    mission: 'ETRSS-1 Multispectral Tasking Campaign',
    orbit: '700 km SSO · 98.2°',
    payloadCapacity: '60 km Swath · 4-Band VNIR',
    status: 'Open for Tasking',
  },
  {
    window: 'Q1 2027 · High-Res Campaign',
    mission: 'ET-SMART-RSS Urban & Rift Fault Survey',
    orbit: '515 km SSO · 97.4°',
    payloadCapacity: '5.8m GSD Targeted Slew',
    status: 'Open for Tasking',
  },
  {
    window: 'Q2 2027 · Dry-Sky Cycle',
    mission: 'Entoto 1.0m Twin Telescope Guest Observer Call',
    orbit: '3,200m · 09°06′N Equatorial',
    payloadCapacity: 'CCD Photometry & Echelle',
    status: 'Booking Nights',
  },
  {
    window: 'Q4 2027 · Rideshare Slot',
    mission: 'ET-SAT-2 Shared 12U Hyperspectral CubeSat',
    orbit: '550 km Dawn–Dusk SSO',
    payloadCapacity: '2U University Payload Slot',
    status: 'AIT Qualification',
  },
] as const;

const OBSERVATORY_INSTRUMENTS = [
  {
    id: 'eorc-east',
    name: 'EORC East 1.0m Ritchey–Chrétien',
    category: 'Optical Photometry & Astrometry',
    aperture: '1,000 mm f/8 Ritchey–Chrétien',
    mount: 'Fork Equatorial Mount (<0.15″ RMS tracking)',
    detector: '2048×2048 Back-Illuminated Cryo CCD (-100°C)',
    wavelength: '320 nm – 1,050 nm (U B V R I Filters)',
    fov: '17.4′ × 17.4′ Arcminutes (0.51″/pixel)',
    summary:
      'Dedicated to high-cadence differential CCD photometry of exoplanet transits, active galactic nuclei (AGN), and low-latitude near-Earth asteroid astrometry from 09°06′N.',
    highlights: [
      'Exoplanet transit light-curve photometry with millimagnitude precision',
      'Active Galactic Nuclei (AGN) and blazar optical variability monitoring',
      'Near-Earth Asteroid (NEA) astrometric follow-up across both hemispheres',
    ],
  },
  {
    id: 'eorc-west',
    name: 'EORC West 1.0m Spectroscopic',
    category: 'Cassegrain Spectroscopy & Near-IR',
    aperture: '1,000 mm f/8 Dual-Nasmyth / Cassegrain',
    mount: 'Direct-Drive Alt-Az / Equatorial Derotator',
    detector: 'Medium-Resolution Echelle Spectrograph (R ≈ 18,000)',
    wavelength: '380 nm – 920 nm Spectral Coverage',
    fov: 'Long-Slit & Fiber-Fed Stellar Spectroscopy',
    summary:
      'Equipped for medium-resolution stellar spectroscopy, radial velocity binary star surveys, and transient supernova classification under Mount Entoto’s dry-season skies.',
    highlights: [
      'Radial velocity measurements of spectroscopic binary star systems',
      'Chemical abundance and metallicity surveys of Galactic halo stars',
      'Supernova classification and transient emission-line follow-up',
    ],
  },
  {
    id: 'gnss-array',
    name: 'Equatorial Ionospheric & Space Weather Lab',
    category: 'Geomagnetism & GNSS Scintillation',
    aperture: 'Multi-Constellation Septentrio & Trim-GNSS Array',
    mount: '3-Axis Fluxgate Magnetometer + Fabry–Pérot Interferometer',
    detector: 'Total Electron Content (TEC) & S4 Scintillation Index',
    wavelength: 'L1 / L2 / L5 GNSS & 630.0 nm Thermospheric Airglow',
    fov: 'All-Sky Ionospheric Pierce-Point Coverage over Horn of Africa',
    summary:
      'Positioned directly beneath the geomagnetic Equatorial Ionization Anomaly (EIA), providing continuous space-weather alerts for African aviation, power grids, and satellite links.',
    highlights: [
      'Real-time monitoring of the Equatorial Ionization Anomaly (EIA) crest over Ethiopia',
      'Solar geomagnetic storm alerts for aviation, power grids, and satellite links',
      'Continuous ETH-CORS geodetic reference frame station tie-in',
    ],
  },
] as const;

const CAPABILITY_PILLARS = [
  {
    id: 'Satellites',
    title: 'Satellite Engineering & Shared AIT Service',
    subtitle: 'Aerospace Systems Directorate · Addis Ababa Cleanroom',
    metrics: [
      { value: '2 SSO', label: 'Active Spacecraft' },
      { value: 'ISO-7', label: 'AIT Cleanroom' },
      { value: '<0.08°', label: 'ADCS Pointing' },
    ],
    summary:
      'Full-lifecycle nanosatellite and microsatellite engineering in Addis Ababa — from mission analysis and structural finite-element design to cleanroom assembly, thermal-vacuum qualification, and daily orbital telemetry.',
    deliverables: [
      'ETRSS-1 & ET-SMART-RSS daily orbital tasking and payload calibration',
      'Shared CubeSat Assembly, Integration & Testing (AIT) for Ethiopian universities',
      'Onboard flight software, attitude determination & control (ADCS) simulation',
      'S-Band & X-Band ground segment antenna operations atop Mount Entoto',
    ],
  },
  {
    id: 'Astronomy',
    title: 'Astrophysics, Cosmology & Space Weather',
    subtitle: 'Entoto Observatory Directorate · 3,200m Elevation',
    metrics: [
      { value: '2 × 1.0m', label: 'Optical Mirrors' },
      { value: '0.9″', label: 'Dry-Season Seeing' },
      { value: '09°06′N', label: 'Equatorial Latitude' },
    ],
    summary:
      'Leveraging Mount Entoto’s equatorial vantage point to observe both Northern and Southern celestial hemispheres, paired with East Africa’s premier ionospheric space weather array.',
    deliverables: [
      'Optical CCD photometry and spectroscopy on twin 1-meter telescopes',
      'Equatorial ionospheric scintillation and Total Electron Content (TEC) forecasting',
      'International Astronomical Union (IAU) East African Regional Office (EA-ROAD)',
      'MSc & PhD postgraduate training in observational astronomy and astrophysics',
    ],
  },
  {
    id: 'Geospatial',
    title: 'National Geospatial & Basin Hydrology',
    subtitle: 'Cartography & Remote Sensing Directorate',
    metrics: [
      { value: '1:2,000', label: 'Urban LiDAR Scale' },
      { value: '12 Basins', label: 'Hydrological Models' },
      { value: 'ETH-CORS', label: 'Geodetic Network' },
    ],
    summary:
      'Serving as Ethiopia’s statutory authority for national base cartography, geodetic reference networks, agricultural crop yield telemetry, and transboundary river basin hydrology.',
    deliverables: [
      'National Geodetic Reference Frame (ETH-CORS) & precision leveling networks',
      'Multispectral crop health (NDVI/EVI) and seasonal drought early-warning bulletins',
      'Abbay (Blue Nile), Awash, Omo-Gibe, and Wabi Shebelle hydrological modeling',
      'High-resolution aerial photogrammetry, LiDAR DEMs, and 3D municipal cadastres',
    ],
  },
  {
    id: 'Operations',
    title: 'Digital Ground Station & Sovereign Archive',
    subtitle: 'Telemetry & Data Infrastructure Directorate',
    metrics: [
      { value: '300 Mbps', label: 'X-Band Downlink' },
      { value: '7.3m + 4.5m', label: 'Autotrack Dishes' },
      { value: 'Level-2A', label: 'Ortho Pipeline' },
    ],
    summary:
      'Operating Ethiopia’s multi-mission satellite receiving complex and high-performance geospatial compute cluster, transforming raw orbital downlinks into analysis-ready orthorectified products.',
    deliverables: [
      'Automated Level-0 to Level-2A radiometric and geometric orthorectification',
      'Multi-satellite reception (ETRSS-1, ET-SMART-RSS, Sentinel, Landsat)',
      'Sovereign cloud geospatial portal for federal ministries and research universities',
      'Emergency disaster response tasking for floods, landslides, and wildfires',
    ],
  },
] as const;

const SCIENTISTS_PROFILES = [
  {
    name: 'Abdisa',
    fullName: 'Dr. Abdisa Yilma',
    role: 'Director General · Aerospace & Geospatial Policy',
    division: 'Executive Directorate · Addis Ababa HQ',
    specialty: 'Sovereign Space Systems, African Space Agency Cooperation & Satellite Policy',
    activeMission: 'ETRSS-1 & ET-SAT-2 National Space Program',
    bio: 'Leads Ethiopia’s integrated space science and geospatial strategy, uniting orbital satellite engineering with national cartography and East African space diplomacy.',
    publications: '28+ Policy & Aerospace Systems Monographs',
  },
  {
    name: 'Solomon',
    fullName: 'Dr. Solomon Belay Tessema',
    role: 'Chief Astronomer · Entoto Observatory',
    division: 'Optical Astronomy & Astrophysics Division',
    specialty: 'Active Galactic Nuclei, Stellar Spectroscopy & Twin 1m Telescope Operations',
    activeMission: 'EORC 1.0m Twin Telescope Sky Survey',
    bio: 'Spearheaded the commissioning of the twin 1-meter Ritchey–Chrétien telescopes at 3,200m on Mount Entoto and leads multi-wavelength blazar and exoplanet transit campaigns.',
    publications: '45+ Peer-Reviewed Astrophysics Papers (MNRAS / ApJ)',
  },
  {
    name: 'Betelhem',
    fullName: 'Dr. Betelhem Tadesse',
    role: 'Lead Payload & Telemetry Systems Engineer',
    division: 'Satellite Operations & AIT Cleanroom',
    specialty: 'Multispectral Optical Payloads, X-Band Downlink & Radiometric Calibration',
    activeMission: 'ETRSS-1 & ET-SMART-RSS Mission Control',
    bio: 'Co-engineered the ETRSS-1 multispectral payload calibration pipeline and directs daily S/X-band command uplinks and Level-2A imagery processing at the Entoto Ground Station.',
    publications: '19+ Remote Sensing & Spacecraft Engineering Papers',
  },
  {
    name: 'Tulu',
    fullName: 'Eng. Tulu Gemechu',
    role: 'Head of CubeSat Assembly, Integration & Testing',
    division: 'Addis Ababa ISO-7 AIT Cleanroom',
    specialty: 'Nanosatellite Bus Architecture, ADCS & Thermal-Vacuum Qualification',
    activeMission: 'ET-SAT-2 12U Hyperspectral CubeSat',
    bio: 'Directs the indigenous CubeSat engineering team building ET-SAT-2, overseeing structural vibration testing, attitude control algorithms, and onboard flight software.',
    publications: '14+ Small-Satellite Systems & ADCS Publications',
  },
  {
    name: 'Yohannes',
    fullName: 'Dr. Yohannes Kasahun',
    role: 'Principal Scientist · Ionospheric & Space Weather',
    division: 'Geomagnetism & Upper Atmosphere Lab',
    specialty: 'Equatorial Ionization Anomaly (EIA), GNSS Scintillation & Solar Storms',
    activeMission: 'Horn of Africa GNSS Space Weather Array',
    bio: 'Models equatorial ionospheric plasma bubbles and Total Electron Content (TEC) perturbations over East Africa to protect aviation navigation and satellite communication links.',
    publications: '34+ Journal of Geophysical Research (JGR) Articles',
  },
  {
    name: 'Melaku',
    fullName: 'Dr. Melaku Mekonnen',
    role: 'Director of Geospatial & Basin Hydrology',
    division: 'National Remote Sensing & Cartography Center',
    specialty: 'Nile & Rift Valley Hydrology, Agricultural NDVI & Geodetic Reference Frames',
    activeMission: 'National Basin & Drought Telemetry System',
    bio: 'Leads nationwide geospatial analytics integrating ETRSS-1 multispectral scenes with ground hydro-meteorological stations across the Abbay, Awash, and Rift Valley basins.',
    publications: '31+ Remote Sensing of Environment & GIS Studies',
  },
] as const;

const ARCHIVE_SCENES: ReadonlyArray<SatelliteArchiveScene> = [
  {
    id: 'ETRSS1-ABBAY-2026-10',
    title: 'Abbay River Gorge & GERD Reservoir Multispectral Ortho',
    region: 'Benishangul-Gumuz & Amhara',
    platform: 'ETRSS-1',
    resolution: '13.75m GSD',
    cloudCover: 3,
    acquiredDate: '2026-10-14',
    coordinates: '11.21°N, 35.09°E',
    bands: 'B1 (Blue), B2 (Green), B3 (Red), B4 (NIR)',
    summary:
      'Post-rainy season reservoir surface area, shoreline vegetation index, and suspended sediment plume mapping.',
  },
  {
    id: 'SMART-ADDIS-2026-10',
    title: 'Addis Ababa & Entoto Ridge High-Resolution Urban Mosaic',
    region: 'Addis Ababa Chartered City',
    platform: 'ET-SMART-RSS',
    resolution: '5.8m GSD',
    cloudCover: 2,
    acquiredDate: '2026-10-11',
    coordinates: '09.03°N, 38.74°E',
    bands: 'PAN + 4-Band VNIR',
    summary:
      'Orthorectified metropolitan transport corridors, riverside green development, and Mount Entoto forest boundary.',
  },
  {
    id: 'SMART-AFAR-2026-09',
    title: 'Afar Depression & Erta Ale Tectonic Rift Thermal Scene',
    region: 'Afar Regional State',
    platform: 'ET-SMART-RSS',
    resolution: '5.8m GSD',
    cloudCover: 0,
    acquiredDate: '2026-09-29',
    coordinates: '13.60°N, 40.66°E',
    bands: 'VNIR + Shortwave Thermal Anomaly',
    summary:
      'Active basaltic fissure mapping, geothermal prospect zones, and Dallol evaporite mineral reflectance.',
  },
  {
    id: 'ETRSS1-BALE-2026-09',
    title: 'Bale Mountains National Park & Harenna Forest Canopy',
    region: 'Oromia Regional State',
    platform: 'ETRSS-1',
    resolution: '13.75m GSD',
    cloudCover: 9,
    acquiredDate: '2026-09-21',
    coordinates: '06.88°N, 39.73°E',
    bands: '4-Band VNIR + NDVI Composite',
    summary:
      'Afroalpine Erica shrubland health, bamboo forest density, and headwater catchment moisture index.',
  },
  {
    id: 'ETRSS1-TANA-2026-10',
    title: 'Lake Tana Biosphere & Fogera Plain Chlorophyll Telemetry',
    region: 'Amhara Regional State',
    platform: 'ETRSS-1',
    resolution: '13.75m GSD',
    cloudCover: 6,
    acquiredDate: '2026-10-08',
    coordinates: '12.00°N, 37.30°E',
    bands: 'Red-Edge & Near-Infrared Water Index (NDWI)',
    summary:
      'Spatial distribution of aquatic macrophyte mats, tributary delta sediment, and irrigated floodplain crops.',
  },
  {
    id: 'EORC-AGN-2026-10',
    title: 'Entoto 1.0m East Telescope — Equatorial Blazar & AGN Light Curves',
    region: 'Mount Entoto (09°06′N)',
    platform: 'Entoto 1m',
    resolution: '0.51″/pixel CCD',
    cloudCover: 1,
    acquiredDate: '2026-10-05',
    coordinates: 'RA 12h 29m / Dec +02°03′',
    bands: 'Johnson–Cousins BVRI Photometry',
    summary:
      'Differential CCD photometric time-series of 3C 273 and equatorial exoplanet transit candidates.',
  },
  {
    id: 'GNSS-EIA-2026-10',
    title: 'East African Equatorial Ionospheric TEC & S4 Scintillation Log',
    region: 'Addis Ababa · Bahir Dar · Arba Minch Array',
    platform: 'GNSS Space Weather',
    resolution: '30-sec Cadence',
    cloudCover: 0,
    acquiredDate: '2026-10-18',
    coordinates: '05.0°N – 14.5°N Geomagnetic Dip Equator',
    bands: 'Dual-Frequency L1/L2/L5 TECU',
    summary:
      'Diurnal Total Electron Content (TEC) maps and post-sunset plasma bubble scintillation indices.',
  },
  {
    id: 'ETRSS1-AWASH-2026-09',
    title: 'Awash River Basin & Tendaho Irrigated Agriculture Corridor',
    region: 'Oromia & Afar Basin',
    platform: 'ETRSS-1',
    resolution: '13.75m GSD',
    cloudCover: 12,
    acquiredDate: '2026-09-16',
    coordinates: '08.85°N, 40.07°E',
    bands: '4-Band Multispectral SAVI/NDVI',
    summary:
      'Seasonal evapotranspiration, sugarcane and wheat irrigation efficiency, and Koka-Kessem reservoir levels.',
  },
];

export const SSGISubpageView: React.FC<SSGISubpageViewProps> = ({
  activeSubpage,
  initialFocusItem,
  onSelectSubpage,
  onBackToStage,
  onOpenProposalModal,
}) => {
  // Missions interactive state
  const [selectedSatId, setSelectedSatId] = useState<string>('ETRSS-1');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('abbay');

  // Observatory interactive state
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string>('eorc-east');
  const [targetMag, setTargetMag] = useState<number>(15.5);
  const [exposureSec, setExposureSec] = useState<number>(180);
  const [seeingArcsec, setSeeingArcsec] = useState<number>(0.9);
  const [filterBand, setFilterBand] = useState<'U' | 'B' | 'V' | 'R' | 'I'>('V');

  // Capabilities interactive state
  const [selectedPillarId, setSelectedPillarId] = useState<string>(
    initialFocusItem && ['Satellites', 'Astronomy', 'Geospatial', 'Operations'].includes(initialFocusItem)
      ? initialFocusItem
      : 'Satellites'
  );

  // Scientists interactive state
  const [selectedScientistName, setSelectedScientistName] = useState<string>(
    initialFocusItem && SCIENTISTS_PROFILES.some((s) => s.name === initialFocusItem)
      ? initialFocusItem
      : 'Abdisa'
  );

  // Data Portal interactive state
  const [platformFilter, setPlatformFilter] = useState<string>('All');
  const [maxCloud, setMaxCloud] = useState<number>(20);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const subpageScrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    subpageScrollRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [activeSubpage]);

  React.useEffect(() => {
    if (initialFocusItem) {
      if (['Satellites', 'Astronomy', 'Geospatial', 'Operations'].includes(initialFocusItem)) {
        setSelectedPillarId(initialFocusItem);
      }
      if (SCIENTISTS_PROFILES.some((s) => s.name === initialFocusItem)) {
        setSelectedScientistName(initialFocusItem);
      }
    }
  }, [initialFocusItem]);

  const currentTabMeta =
    SUBPAGE_TABS.find((t) => t.id === activeSubpage) || SUBPAGE_TABS[0];

  const activeSatellite =
    SATELLITE_FLEET.find((s) => s.id === selectedSatId) || SATELLITE_FLEET[0];
  const activeZone =
    ETHIOPIAN_TARGET_ZONES.find((z) => z.id === selectedZoneId) || ETHIOPIAN_TARGET_ZONES[0];
  const activeInstrument =
    OBSERVATORY_INSTRUMENTS.find((i) => i.id === selectedInstrumentId) ||
    OBSERVATORY_INSTRUMENTS[0];
  const activePillar =
    CAPABILITY_PILLARS.find((p) => p.id === selectedPillarId) || CAPABILITY_PILLARS[0];
  const activeScientist =
    SCIENTISTS_PROFILES.find((s) => s.name === selectedScientistName) || SCIENTISTS_PROFILES[0];

  const snrResult = useMemo(
    () => computeTelescopeSNR(targetMag, exposureSec, seeingArcsec, filterBand),
    [targetMag, exposureSec, seeingArcsec, filterBand]
  );

  const filteredScenes = useMemo(
    () => filterSatelliteScenes(ARCHIVE_SCENES, platformFilter, maxCloud, searchQuery),
    [platformFilter, maxCloud, searchQuery]
  );

  const currentTabIdx = SUBPAGE_TABS.findIndex((t) => t.id === activeSubpage);
  const prevTab = SUBPAGE_TABS[(currentTabIdx - 1 + SUBPAGE_TABS.length) % SUBPAGE_TABS.length];
  const nextTab = SUBPAGE_TABS[(currentTabIdx + 1) % SUBPAGE_TABS.length];

  return (
    <div
      ref={subpageScrollRef}
      className="fixed inset-0 z-30 overflow-y-auto text-[#eef1ff]"
      style={{
        backgroundColor: 'rgba(4, 5, 10, 0.48)',
        fontFamily: '"Space Grotesk", sans-serif',
      }}
      data-testid={`ssgi-subpage-${activeSubpage}`}
    >
      {/* =====================================================================
          ENDUROSAT-STYLE ARCHITECTURAL HEADER BAR (Plain bar, zero pill boxes)
         ===================================================================== */}
      <header
        className="sticky top-0 z-40 px-4 py-3.5 md:px-10 md:py-4"
        style={{ backgroundColor: '#04050a' }}
      >
        <div className="mx-auto flex max-w-[1380px] flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => onBackToStage(0)}
              className="neb-logo cursor-pointer bg-transparent border-0 p-0"
              aria-label="Return to SSGI 3D Orbit Stage"
            >
              SSGI<span>ET</span>
            </button>

            <button
              type="button"
              onClick={() => onBackToStage(currentTabMeta.stageSectionIndex)}
              data-testid="back-to-3d-stage-btn"
              className="inline-flex items-center gap-2 bg-[#10152e] px-3.5 py-2 text-xs font-medium text-[#eef1ff] hover:bg-[#6f8cff] hover:text-[#04050a] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to 3D Orbit</span>
            </button>
          </div>

          <nav
            className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-1"
            aria-label="SSGI Sub-Pages"
          >
            {SUBPAGE_TABS.map((tab) => {
              const isCurrent = tab.id === activeSubpage;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectSubpage(tab.id)}
                  data-testid={`subpage-tab-${tab.id}`}
                  className={`py-1 text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 border-0 bg-transparent ${
                    isCurrent
                      ? 'text-white underline underline-offset-8 decoration-[#6f8cff] decoration-2'
                      : 'text-[#9aa4d6] hover:text-white'
                  }`}
                >
                  {tab.shortLabel}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => onOpenProposalModal(`SSGI · ${currentTabMeta.label}`)}
            className="hidden lg:inline-flex items-center gap-2 bg-[#6f8cff] px-5 py-2.5 text-xs font-semibold text-[#04050a] hover:bg-[#8aa0ff] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Book Mission Slot</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* =====================================================================
          SUB-PAGE 1: ORBITAL MISSIONS & SPACE SERVICE (EnduroSat Space Service)
         ===================================================================== */}
      {activeSubpage === 'missions' && (
        <div>
          {/* 1. Split-Stage Hero — Left Editorial Argument, Right Open 3D WebGL Window */}
          <section className="mx-auto max-w-[1380px] px-5 pt-14 pb-24 md:px-10 md:pt-24 md:pb-32 min-h-[78vh] flex flex-col justify-between">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-7">
                <h1
                  className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight leading-[0.96] text-white"
                  style={{ fontFamily: '"Sora", sans-serif' }}
                >
                  Orbital space service from Addis Ababa
                </h1>
                <p className="mt-8 max-w-xl text-base sm:text-lg text-[#eef1ff] leading-relaxed">
                  Direct access to sun-synchronous Earth observation and shared 12U CubeSat
                  hosting. Operated continuously from the 3,200-meter Entoto Multi-Satellite Ground
                  Station with zero multi-year procurement delays.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenProposalModal(`Book ${activeSatellite.name} Orbital Slot`)
                    }
                    className="bg-[#6f8cff] px-7 py-4 text-sm font-semibold text-[#04050a] hover:bg-[#8aa0ff] transition-colors cursor-pointer"
                  >
                    Book Orbital Tasking Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectSubpage('portal')}
                    className="bg-[#10152e] px-7 py-4 text-sm font-medium text-[#eef1ff] hover:bg-[#192042] transition-colors cursor-pointer"
                  >
                    Browse Downlinked Archive
                  </button>
                </div>
              </div>

              {/* Right half kept open so the live 3D Rocket formation rotates clearly in view */}
              <div className="lg:col-span-5" />
            </div>

            {/* Open Typographic Telemetry Strip along the Hero Baseline (Zero Boxes) */}
            <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8 pt-8">
              <div>
                <div
                  className="text-3xl sm:text-5xl font-extrabold text-white tabular-nums"
                  style={{ fontFamily: '"Sora", sans-serif' }}
                >
                  700 km
                </div>
                <p className="mt-2 text-sm text-[#b9c2ec]">Sun-synchronous orbital altitude</p>
              </div>
              <div>
                <div
                  className="text-3xl sm:text-5xl font-extrabold text-white tabular-nums"
                  style={{ fontFamily: '"Sora", sans-serif' }}
                >
                  300 Mbps
                </div>
                <p className="mt-2 text-sm text-[#b9c2ec]">Entoto X-band real-time downlink</p>
              </div>
              <div>
                <div
                  className="text-3xl sm:text-5xl font-extrabold text-white tabular-nums"
                  style={{ fontFamily: '"Sora", sans-serif' }}
                >
                  14 Passes
                </div>
                <p className="mt-2 text-sm text-[#b9c2ec]">Daily horizon tracking windows</p>
              </div>
              <div>
                <div
                  className="text-3xl sm:text-5xl font-extrabold text-[#6f8cff] tabular-nums"
                  style={{ fontFamily: '"Sora", sans-serif' }}
                >
                  6 Hours
                </div>
                <p className="mt-2 text-sm text-[#b9c2ec]">From overpass to Level-2A ortho</p>
              </div>
            </div>
          </section>

          {/* 2. Full-Bleed Tonal Band: The Problem vs Sovereign Space Service */}
          <section style={{ backgroundColor: '#070a17' }} className="py-24 md:py-32">
            <div className="mx-auto max-w-[1380px] px-5 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5">
                <h2
                  className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.02] text-white"
                  style={{ fontFamily: '"Sora", sans-serif' }}
                >
                  Months to orbit, not decades
                </h2>
              </div>
              <div className="lg:col-span-7 space-y-8">
                <p className="text-lg sm:text-xl text-[#eef1ff] leading-relaxed">
                  Traditional satellite programs demand five-year procurement cycles and foreign
                  ground station leases. SSGI’s Space Service unites sovereign spacecraft in orbit,
                  an ISO-7 AIT cleanroom in Addis Ababa, and direct S/X-band reception atop Mount
                  Entoto.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-4">
                  <div className="bg-[#0d1226] p-7">
                    <h3
                      className="text-xl font-bold text-white"
                      style={{ fontFamily: '"Sora", sans-serif' }}
                    >
                      On-Demand Constellation Tasking
                    </h3>
                    <p className="mt-3 text-base text-[#c2caec] leading-relaxed">
                      Submit target coordinates for any Ethiopian river basin, agricultural zone,
                      or urban corridor and receive orthorectified multispectral imagery directly
                      from ETRSS-1 and ET-SMART-RSS.
                    </p>
                  </div>
                  <div className="bg-[#0d1226] p-7">
                    <h3
                      className="text-xl font-bold text-white"
                      style={{ fontFamily: '"Sora", sans-serif' }}
                    >
                      Shared CubeSat Bus &amp; AIT
                    </h3>
                    <p className="mt-3 text-base text-[#c2caec] leading-relaxed">
                      University laboratories and regional agencies fly sensors aboard SSGI’s 12U
                      modular bus—sharing launch, attitude control, power, and Entoto telemetry
                      operations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Interactive Spacecraft & Mission Lifecycle Selector (Split-Stage) */}
          <section
            style={{ backgroundColor: 'rgba(4, 5, 10, 0.78)' }}
            className="py-24 md:py-32"
            aria-label="Spacecraft Fleet Selector"
          >
            <div className="mx-auto max-w-[1380px] px-5 md:px-10">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div>
                  <h2
                    className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.02] text-white"
                    style={{ fontFamily: '"Sora", sans-serif' }}
                  >
                    Active orbital fleet &amp; ground segment
                  </h2>
                  <p className="mt-4 max-w-xl text-base text-[#c2caec]">
                    Select a spacecraft or ground facility to inspect its orbital regime, sensor
                    payload, and end-to-end telemetry architecture.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {SATELLITE_FLEET.map((sat) => (
                    <button
                      key={sat.id}
                      type="button"
                      onClick={() => setSelectedSatId(sat.id)}
                      data-testid={`select-sat-${sat.id}`}
                      className={`px-5 py-3 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        selectedSatId === sat.id
                          ? 'bg-[#6f8cff] text-[#04050a]'
                          : 'bg-[#10152e] text-[#c5cdf2] hover:bg-[#192042] hover:text-white'
                      }`}
                    >
                      {sat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Spacecraft Split Showcase */}
              <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-6 bg-[#090d1e] p-8 md:p-10">
                  <p className="text-sm font-medium text-[#6f8cff]">
                    {activeSatellite.status} · {activeSatellite.launchDate}
                  </p>
                  <h3
                    className="mt-2 text-2xl sm:text-4xl font-bold text-white leading-tight"
                    style={{ fontFamily: '"Sora", sans-serif' }}
                  >
                    {activeSatellite.fullName}
                  </h3>
                  <p className="mt-5 text-base text-[#d8defa] leading-relaxed">
                    {activeSatellite.missionSummary}
                  </p>

                  <dl className="mt-8 space-y-4 text-sm">
                    <div className="flex justify-between gap-4 py-2 bg-[#0d1329] px-4">
                      <dt className="text-[#9aa4d6]">Orbital Regime</dt>
                      <dd className="font-semibold text-white text-right">
                        {activeSatellite.orbit}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 py-2 bg-[#0d1329] px-4">
                      <dt className="text-[#9aa4d6]">Platform Mass / Class</dt>
                      <dd className="font-semibold text-white text-right">
                        {activeSatellite.mass}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 py-2 bg-[#0d1329] px-4">
                      <dt className="text-[#9aa4d6]">Spatial Resolution</dt>
                      <dd className="font-semibold text-white text-right">
                        {activeSatellite.gsd}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 py-2 bg-[#0d1329] px-4">
                      <dt className="text-[#9aa4d6]">Spectral Channels</dt>
                      <dd className="font-semibold text-white text-right">
                        {activeSatellite.bands}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 py-2 bg-[#0d1329] px-4">
                      <dt className="text-[#9aa4d6]">Downlink &amp; Revisit</dt>
                      <dd className="font-semibold text-[#8aa0ff] text-right">
                        {activeSatellite.revisit}
                      </dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    onClick={() =>
                      onOpenProposalModal(`Request ${activeSatellite.name} Imagery / Tasking`)
                    }
                    className="mt-8 w-full bg-[#6f8cff] px-6 py-4 text-xs font-semibold text-[#04050a] hover:bg-[#8aa0ff] transition-colors cursor-pointer"
                  >
                    Task {activeSatellite.name} or Request Archive Data
                  </button>
                </div>

                {/* Right Column: EnduroSat-Style 4-Stage Service Architecture */}
                <div className="lg:col-span-6 space-y-4">
                  <h3
                    className="text-xl font-bold text-white mb-4"
                    style={{ fontFamily: '"Sora", sans-serif' }}
                  >
                    End-to-end mission execution flow
                  </h3>
                  {activeSatellite.lifecycleSteps.map((step) => (
                    <div key={step.phase} className="bg-[#090d1e] p-6 md:p-7">
                      <h4
                        className="text-lg font-bold text-white"
                        style={{ fontFamily: '"Sora", sans-serif' }}
                      >
                        {step.phase}
                      </h4>
                      <p className="mt-2 text-sm sm:text-base text-[#c2caec] leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 4. Interactive Regional Overpass & Swath Configurator ("One Live Thing") */}
          <section
            style={{ backgroundColor: '#070a17' }}
            className="py-24 md:py-32"
            aria-label="Regional Orbital Pass Planner"
          >
            <div className="mx-auto max-w-[1380px] px-5 md:px-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-5">
                  <h2
                    className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.02] text-white"
                    style={{ fontFamily: '"Sora", sans-serif' }}
                  >
                    Live Ethiopian overpass planner
                  </h2>
                  <p className="mt-5 text-base text-[#c2caec] leading-relaxed">
                    Select a priority Ethiopian watershed, rift zone, or metropolitan corridor to
                    compute the next sun-synchronous zenith pass and X-band downlink volume at
                    Entoto.
                  </p>
                  <div className="mt-8 flex flex-col gap-2">
                    {ETHIOPIAN_TARGET_ZONES.map((zone) => (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => setSelectedZoneId(zone.id)}
                        className={`text-left px-5 py-3.5 text-sm font-medium transition-colors cursor-pointer ${
                          selectedZoneId === zone.id
                            ? 'bg-[#6f8cff] text-[#04050a] font-semibold'
                            : 'bg-[#0d1226] text-[#c5cdf2] hover:bg-[#141c38] hover:text-white'
                        }`}
                      >
                        {zone.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#0d1226] p-8 md:p-12">
                  <h3
                    className="text-2xl sm:text-3xl font-bold text-white"
                    style={{ fontFamily: '"Sora", sans-serif' }}
                  >
                    {activeZone.name}
                  </h3>
                  <p className="mt-3 text-base text-[#d8defa] leading-relaxed">
                    {activeZone.priorityApplication}
                  </p>

                  <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-8">
                    <div>
                      <div className="text-xs text-[#8aa0ff]">Target Coordinates</div>
                      <div
                        className="mt-1 text-2xl font-bold text-white tabular-nums"
                        style={{ fontFamily: '"Sora", sans-serif' }}
                      >
                        {activeZone.coords}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#8aa0ff]">Next Zenith Overpass</div>
                      <div
                        className="mt-1 text-2xl font-bold text-white tabular-nums"
                        style={{ fontFamily: '"Sora", sans-serif' }}
                      >
                        {activeZone.nextPassEat}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#8aa0ff]">Max Pass Elevation</div>
                      <div
                        className="mt-1 text-2xl font-bold text-white tabular-nums"
                        style={{ fontFamily: '"Sora", sans-serif' }}
                      >
                        {activeZone.elevationDeg}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#8aa0ff]">Slew Off-Nadir Angle</div>
                      <div
                        className="mt-1 text-2xl font-bold text-white tabular-nums"
                        style={{ fontFamily: '"Sora", sans-serif' }}
                      >
                        {activeZone.offNadirDeg}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#8aa0ff]">X-Band Downlink Volume</div>
                      <div
                        className="mt-1 text-2xl font-bold text-white tabular-nums"
                        style={{ fontFamily: '"Sora", sans-serif' }}
                      >
                        {activeZone.downlinkMb}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#8aa0ff]">Processing Turnaround</div>
                      <div
                        className="mt-1 text-2xl font-bold text-[#6f8cff] tabular-nums"
                        style={{ fontFamily: '"Sora", sans-serif' }}
                      >
                        {activeZone.turnaround}
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenProposalModal(`Schedule Overpass Tasking: ${activeZone.name}`)
                      }
                      className="bg-[#6f8cff] px-6 py-3.5 text-xs font-semibold text-[#04050a] hover:bg-[#8aa0ff] transition-colors cursor-pointer"
                    >
                      Schedule Tasking for {activeZone.name.split('&')[0].trim()}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectSubpage('portal')}
                      className="bg-[#151c38] px-6 py-3.5 text-xs font-medium text-white hover:bg-[#1e274d] transition-colors cursor-pointer"
                    >
                      Inspect Existing Basin Scenes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. EnduroSat-Style Flight Schedule & Orbital Availability Manifest */}
          <section style={{ backgroundColor: '#04050a' }} className="py-24 md:py-32">
            <div className="mx-auto max-w-[1380px] px-5 md:px-10">
              <h2
                className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.02] text-white"
                style={{ fontFamily: '"Sora", sans-serif' }}
              >
                Flight manifest &amp; tasking availability
              </h2>
              <p className="mt-4 max-w-2xl text-base text-[#c2caec]">
                Upcoming satellite tasking windows, Entoto telescope guest observer cycles, and
                shared CubeSat payload integration slots.
              </p>

              <div className="mt-10 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0d1226] text-xs text-[#8aa0ff]">
                      <th className="py-4 px-4 font-semibold">Campaign Window</th>
                      <th className="py-4 px-4 font-semibold">Mission / Platform</th>
                      <th className="py-4 px-4 font-semibold">Orbital / Site Regime</th>
                      <th className="py-4 px-4 font-semibold">Allocation Capacity</th>
                      <th className="py-4 px-4 font-semibold">Status</th>
                      <th className="py-4 px-4 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {FLIGHT_MANIFEST.map((slot, idx) => (
                      <tr
                        key={slot.mission}
                        className={idx % 2 === 0 ? 'bg-[#070a17]' : 'bg-[#0a0f22]'}
                      >
                        <td className="py-5 px-4 font-semibold text-white whitespace-nowrap">
                          {slot.window}
                        </td>
                        <td className="py-5 px-4 text-[#eef1ff]">{slot.mission}</td>
                        <td className="py-5 px-4 text-[#b9c2ec] whitespace-nowrap">{slot.orbit}</td>
                        <td className="py-5 px-4 text-[#b9c2ec]">{slot.payloadCapacity}</td>
                        <td className="py-5 px-4 text-[#6f8cff] font-medium whitespace-nowrap">
                          {slot.status}
                        </td>
                        <td className="py-5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onOpenProposalModal(`Slot Reservation: ${slot.mission}`)}
                            className="bg-[#10152e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#6f8cff] hover:text-[#04050a] transition-colors cursor-pointer"
                          >
                            Reserve Slot ↗
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          SUB-PAGE 2: ENTOTO OBSERVATORY & RESEARCH CENTER (EORC)
         ===================================================================== */}
      {activeSubpage === 'observatory' && (
        <div>
          {/* Split-Stage Hero over the Live 3D Atom / Equatorial Rings Formation */}
          <section className="mx-auto max-w-[1380px] px-5 pt-14 pb-24 md:px-10 md:pt-24 md:pb-32 min-h-[75vh] flex flex-col justify-between">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="hidden lg:block lg:col-span-5" />
              <div className="lg:col-span-7">
                <h1
                  className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight leading-[0.96] text-white"
                  style={{ fontFamily: '"Sora", sans-serif' }}
                >
                  Entoto optical observatory
                </h1>
                <p className="mt-8 max-w-xl text-base sm:text-lg text-[#eef1ff] leading-relaxed">
                  Situated at 3,200 meters on Mount Entoto (09°06′N, 38°46′E), operating East
                  Africa’s twin 1.0-meter Ritchey–Chrétien telescopes and equatorial ionospheric
                  research array.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenProposalModal(`Entoto 1.0m Telescope Guest Observer Proposal`)
                    }
                    className="bg-[#6f8cff] px-7 py-4 text-sm font-semibold text-[#04050a] hover:bg-[#8aa0ff] transition-colors cursor-pointer"
                  >
                    Apply for Telescope Time
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectSubpage('scientists')}
                    className="bg-[#10152e] px-7 py-4 text-sm font-medium text-[#eef1ff] hover:bg-[#192042] transition-colors cursor-pointer"
                  >
                    Meet Observatory Astronomers
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8 pt-8">
              <div>
                <div
                  className="text-3xl sm:text-5xl font-extrabold text-white tabular-nums"
                  style={{ fontFamily: '"Sora", sans-serif' }}
                >
                  3,200 m
                </div>
                <p className="mt-2 text-sm text-[#b9c2ec]">Mount Entoto ridge elevation</p>
              </div>
              <div>
                <div
                  className="text-3xl sm:text-5xl font-extrabold text-white tabular-nums"
                  style={{ fontFamily: '"Sora", sans-serif' }}
                >
                  2 × 1.0 m
                </div>
                <p className="mt-2 text-sm text-[#b9c2ec]">Ritchey–Chrétien primary mirrors</p>
              </div>
              <div>
                <div
                  className="text-3xl sm:text-5xl font-extrabold text-white tabular-nums"
                  style={{ fontFamily: '"Sora", sans-serif' }}
                >
                  0.9″ FWHM
                </div>
                <p className="mt-2 text-sm text-[#b9c2ec]">Median dry-season optical seeing</p>
              </div>
              <div>
                <div
                  className="text-3xl sm:text-5xl font-extrabold text-[#6f8cff] tabular-nums"
                  style={{ fontFamily: '"Sora", sans-serif' }}
                >
                  09°06′ N
                </div>
                <p className="mt-2 text-sm text-[#b9c2ec]">Dual-hemisphere equatorial sky</p>
              </div>
            </div>
          </section>

          {/* Dome & Instrument Architecture */}
          <section style={{ backgroundColor: '#070a17' }} className="py-24 md:py-32">
            <div className="mx-auto max-w-[1380px] px-5 md:px-10">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div>
                  <h2
                    className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.02] text-white"
                    style={{ fontFamily: '"Sora", sans-serif' }}
                  >
                    Telescope domes &amp; sensor arrays
                  </h2>
                  <p className="mt-4 max-w-xl text-base text-[#c2caec]">
                    Select an Entoto instrument facility to inspect its optical train, focal-plane
                    detector, and active observing campaigns.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {OBSERVATORY_INSTRUMENTS.map((inst) => (
                    <button
                      key={inst.id}
                      type="button"
                      onClick={() => setSelectedInstrumentId(inst.id)}
                      className={`px-5 py-3 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        selectedInstrumentId === inst.id
                          ? 'bg-[#6f8cff] text-[#04050a]'
                          : 'bg-[#10152e] text-[#c5cdf2] hover:bg-[#192042] hover:text-white'
                      }`}
                    >
                      {inst.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-6 bg-[#0d1226] p-8 md:p-10">
                  <p className="text-sm font-medium text-[#6f8cff]">{activeInstrument.category}</p>
                  <h3
                    className="mt-2 text-2xl sm:text-4xl font-bold text-white"
                    style={{ fontFamily: '"Sora", sans-serif' }}
                  >
                    {activeInstrument.name}
                  </h3>
                  <p className="mt-4 text-base text-[#d8defa] leading-relaxed">
                    {activeInstrument.summary}
                  </p>
                  <div className="mt-8 space-y-3">
                    {activeInstrument.highlights.map((item) => (
                      <div key={item} className="bg-[#080b18] p-4 text-sm text-[#dce2ff]">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-6 bg-[#0d1226] p-8 md:p-10 flex flex-col justify-between">
                  <dl className="space-y-4 text-sm">
                    <div className="flex justify-between gap-4 py-2.5 bg-[#080b18] px-4">
                      <dt className="text-[#9aa4d6]">Optical Configuration</dt>
                      <dd className="font-semibold text-white text-right">
                        {activeInstrument.aperture}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 py-2.5 bg-[#080b18] px-4">
                      <dt className="text-[#9aa4d6]">Tracking &amp; Mount</dt>
                      <dd className="font-semibold text-white text-right">
                        {activeInstrument.mount}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 py-2.5 bg-[#080b18] px-4">
                      <dt className="text-[#9aa4d6]">Focal Plane Detector</dt>
                      <dd className="font-semibold text-white text-right">
                        {activeInstrument.detector}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 py-2.5 bg-[#080b18] px-4">
                      <dt className="text-[#9aa4d6]">Spectral Coverage</dt>
                      <dd className="font-semibold text-white text-right">
                        {activeInstrument.wavelength}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 py-2.5 bg-[#080b18] px-4">
                      <dt className="text-[#9aa4d6]">Field of View</dt>
                      <dd className="font-semibold text-[#8aa0ff] text-right">
                        {activeInstrument.fov}
                      </dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    onClick={() =>
                      onOpenProposalModal(
                        `Entoto Observatory · ${activeInstrument.name} Time Request`
                      )
                    }
                    className="mt-8 w-full bg-[#6f8cff] px-6 py-4 text-xs font-semibold text-[#04050a] hover:bg-[#8aa0ff] transition-colors cursor-pointer"
                  >
                    Request {activeInstrument.name} Observing Nights
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive 1.0m Telescope Exposure & SNR Calculator ("One Live Thing") */}
          <section
            style={{ backgroundColor: 'rgba(4, 5, 10, 0.82)' }}
            className="py-24 md:py-32"
            aria-label="Entoto 1m Telescope Exposure Calculator"
          >
            <div className="mx-auto max-w-[1380px] px-5 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-6 space-y-6">
                <h2
                  className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.02] text-white"
                  style={{ fontFamily: '"Sora", sans-serif' }}
                >
                  1.0m CCD exposure &amp; SNR simulator
                </h2>
                <p className="text-base text-[#c2caec] leading-relaxed">
                  Calculate photon signal-to-noise ratio and 5σ limiting magnitude for Entoto’s
                  back-illuminated cryo-CCD camera before submitting your observing proposal.
                </p>

                <div className="space-y-6 pt-2">
                  <div>
                    <div className="flex justify-between text-sm text-[#dce2ff]">
                      <label htmlFor="snr-mag-slider">Target Apparent Magnitude</label>
                      <span className="font-bold text-white tabular-nums">
                        {targetMag.toFixed(1)} mag
                      </span>
                    </div>
                    <input
                      id="snr-mag-slider"
                      type="range"
                      min={10}
                      max={21.5}
                      step={0.5}
                      value={targetMag}
                      onChange={(e) => setTargetMag(Number(e.target.value))}
                      className="mt-2 w-full accent-[#6f8cff] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm text-[#dce2ff]">
                      <label htmlFor="snr-exp-slider">Single-Frame Integration Time</label>
                      <span className="font-bold text-white tabular-nums">{exposureSec} s</span>
                    </div>
                    <input
                      id="snr-exp-slider"
                      type="range"
                      min={30}
                      max={1200}
                      step={30}
                      value={exposureSec}
                      onChange={(e) => setExposureSec(Number(e.target.value))}
                      className="mt-2 w-full accent-[#6f8cff] cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <span className="block text-sm text-[#dce2ff] mb-2">
                        Johnson–Cousins Filter Band
                      </span>
                      <div className="flex gap-1.5">
                        {(['U', 'B', 'V', 'R', 'I'] as const).map((band) => (
                          <button
                            key={band}
                            type="button"
                            onClick={() => setFilterBand(band)}
                            className={`flex-1 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                              filterBand === band
                                ? 'bg-[#6f8cff] text-[#04050a]'
                                : 'bg-[#10152e] text-[#b9c2ec] hover:text-white'
                            }`}
                          >
                            {band}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="block text-sm text-[#dce2ff] mb-2">
                        Entoto Atmospheric Seeing
                      </span>
                      <div className="flex gap-2">
                        {[
                          { label: '0.9″ Dry Season', val: 0.9 },
                          { label: '1.4″ Equinoctial', val: 1.4 },
                        ].map((s) => (
                          <button
                            key={s.label}
                            type="button"
                            onClick={() => setSeeingArcsec(s.val)}
                            className={`flex-1 px-3 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                              seeingArcsec === s.val
                                ? 'bg-[#6f8cff] text-[#04050a]'
                                : 'bg-[#10152e] text-[#b9c2ec]'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="lg:col-span-6 bg-[#090d1e] p-8 md:p-12"
                data-testid="snr-calculator-output"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#8aa0ff]">
                    Computed Cryo-CCD Photometric Output
                  </span>
                  <span className="bg-[#141c38] px-3 py-1 text-xs font-bold text-white">
                    {snrResult.status}
                  </span>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-xs text-[#9aa4d6]">Signal-to-Noise Ratio (SNR)</div>
                    <div
                      className="mt-2 text-4xl sm:text-6xl font-extrabold text-white tabular-nums"
                      style={{ fontFamily: '"Sora", sans-serif' }}
                    >
                      {snrResult.snr}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#9aa4d6]">5σ Limiting Magnitude</div>
                    <div
                      className="mt-2 text-4xl sm:text-6xl font-extrabold text-[#6f8cff] tabular-nums"
                      style={{ fontFamily: '"Sora", sans-serif' }}
                    >
                      {snrResult.limitingMagnitude}m
                    </div>
                  </div>
                </div>

                <p className="mt-8 text-base text-[#d8defa]">
                  Recommended cadence for millimagnitude transit or AGN light curves:{' '}
                  <strong className="text-white">
                    {snrResult.recommendedFrames} × {exposureSec}s frames
                  </strong>{' '}
                  in {filterBand}-band.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    onOpenProposalModal(
                      `Entoto 1m Proposal (${targetMag} mag, ${filterBand}-band, ${exposureSec}s)`
                    )
                  }
                  className="mt-8 w-full bg-[#6f8cff] px-6 py-4 text-xs font-semibold text-[#04050a] hover:bg-[#8aa0ff] transition-colors cursor-pointer"
                >
                  Attach Exposure Plan to Observing Proposal
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          SUB-PAGE 3: CAPABILITIES & NATIONAL GEOSPATIAL MATRIX
         ===================================================================== */}
      {activeSubpage === 'capabilities' && (
        <div>
          <section className="mx-auto max-w-[1380px] px-5 pt-14 pb-24 md:px-10 md:pt-24 md:pb-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-7">
                <h1
                  className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight leading-[0.96] text-white"
                  style={{ fontFamily: '"Sora", sans-serif' }}
                >
                  Four scientific directorates
                </h1>
                <p className="mt-8 max-w-xl text-base sm:text-lg text-[#eef1ff] leading-relaxed">
                  Uniting orbital satellite engineering, optical astrophysics, national base
                  cartography, and transboundary river basin hydrology under one institution.
                </p>
              </div>
              <div className="lg:col-span-5" />
            </div>

            {/* Split-Stage Directorate Selector */}
            <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-4 flex flex-col gap-2">
                {CAPABILITY_PILLARS.map((pillar) => (
                  <button
                    key={pillar.id}
                    type="button"
                    onClick={() => setSelectedPillarId(pillar.id)}
                    className={`text-left p-6 transition-colors cursor-pointer ${
                      selectedPillarId === pillar.id
                        ? 'bg-[#6f8cff] text-[#04050a]'
                        : 'bg-[#090d1e] text-[#eef1ff] hover:bg-[#121836]'
                    }`}
                  >
                    <div className="text-lg font-bold" style={{ fontFamily: '"Sora", sans-serif' }}>
                      {pillar.title}
                    </div>
                    <div
                      className={`mt-1 text-xs ${
                        selectedPillarId === pillar.id ? 'text-[#04050a]/80' : 'text-[#9aa4d6]'
                      }`}
                    >
                      {pillar.subtitle}
                    </div>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-8 bg-[#090d1e] p-8 md:p-12">
                <p className="text-sm font-medium text-[#6f8cff]">{activePillar.subtitle}</p>
                <h2
                  className="mt-2 text-3xl sm:text-4xl font-bold text-white"
                  style={{ fontFamily: '"Sora", sans-serif' }}
                >
                  {activePillar.title}
                </h2>
                <p className="mt-5 text-base sm:text-lg text-[#d8defa] leading-relaxed">
                  {activePillar.summary}
                </p>

                <div className="mt-10 grid grid-cols-3 gap-6 py-6 bg-[#0d1329] px-6">
                  {activePillar.metrics.map((m) => (
                    <div key={m.label}>
                      <div
                        className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums"
                        style={{ fontFamily: '"Sora", sans-serif' }}
                      >
                        {m.value}
                      </div>
                      <div className="mt-1 text-xs text-[#9aa4d6]">{m.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-3">
                  {activePillar.deliverables.map((del) => (
                    <div key={del} className="bg-[#0d1329] p-4 text-sm sm:text-base text-[#eef1ff]">
                      {del}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenProposalModal(`SSGI ${activePillar.title} Partnership`)}
                  className="mt-8 bg-[#6f8cff] px-7 py-4 text-xs font-semibold text-[#04050a] hover:bg-[#8aa0ff] transition-colors cursor-pointer"
                >
                  Initiate Directorate Collaboration
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          SUB-PAGE 4: SCIENTIFIC DIRECTORATE & FELLOWSHIPS
         ===================================================================== */}
      {activeSubpage === 'scientists' && (
        <div>
          <section className="mx-auto max-w-[1380px] px-5 pt-14 pb-24 md:px-10 md:pt-24 md:pb-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-7">
                <h1
                  className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight leading-[0.96] text-white"
                  style={{ fontFamily: '"Sora", sans-serif' }}
                >
                  Ethiopia’s orbital scientists
                </h1>
                <p className="mt-8 max-w-xl text-base sm:text-lg text-[#eef1ff] leading-relaxed">
                  Astrophysicists, satellite payload engineers, space-weather physicists, and
                  hydrologists leading East Africa’s orbital and geospatial research from Addis
                  Ababa.
                </p>
              </div>
              <div className="lg:col-span-5" />
            </div>

            {/* Split-Stage Roster & Monograph Detail */}
            <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5 flex flex-col gap-2">
                {SCIENTISTS_PROFILES.map((sci) => (
                  <button
                    key={sci.name}
                    type="button"
                    onClick={() => setSelectedScientistName(sci.name)}
                    className={`text-left p-5 transition-colors cursor-pointer ${
                      selectedScientistName === sci.name
                        ? 'bg-[#6f8cff] text-[#04050a]'
                        : 'bg-[#090d1e] text-[#eef1ff] hover:bg-[#121836]'
                    }`}
                  >
                    <div className="text-lg font-bold" style={{ fontFamily: '"Sora", sans-serif' }}>
                      {sci.fullName}
                    </div>
                    <div
                      className={`mt-0.5 text-xs ${
                        selectedScientistName === sci.name ? 'text-[#04050a]/80' : 'text-[#9aa4d6]'
                      }`}
                    >
                      {sci.role}
                    </div>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-7 bg-[#090d1e] p-8 md:p-12">
                <p className="text-sm font-medium text-[#6f8cff]">{activeScientist.division}</p>
                <h2
                  className="mt-2 text-3xl sm:text-4xl font-bold text-white"
                  style={{ fontFamily: '"Sora", sans-serif' }}
                >
                  {activeScientist.fullName}
                </h2>
                <p className="mt-1 text-base font-medium text-[#9db0ff]">{activeScientist.role}</p>
                <p className="mt-6 text-base sm:text-lg text-[#d8defa] leading-relaxed">
                  {activeScientist.bio}
                </p>

                <dl className="mt-8 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 py-3 bg-[#0d1329] px-4">
                    <dt className="text-[#9aa4d6]">Research Specialty</dt>
                    <dd className="font-semibold text-white text-right">
                      {activeScientist.specialty}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-3 bg-[#0d1329] px-4">
                    <dt className="text-[#9aa4d6]">Active Mission Program</dt>
                    <dd className="font-semibold text-white text-right">
                      {activeScientist.activeMission}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-3 bg-[#0d1329] px-4">
                    <dt className="text-[#9aa4d6]">Published Output</dt>
                    <dd className="font-semibold text-[#8aa0ff] text-right">
                      {activeScientist.publications}
                    </dd>
                  </div>
                </dl>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenProposalModal(
                        `Research Inquiry · ${activeScientist.fullName} (${activeScientist.division})`
                      )
                    }
                    className="bg-[#6f8cff] px-6 py-3.5 text-xs font-semibold text-[#04050a] hover:bg-[#8aa0ff] transition-colors cursor-pointer"
                  >
                    Connect with {activeScientist.fullName}’s Lab
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenProposalModal('AAU / SSGI MSc & PhD Postgraduate Fellowship Track')
                    }
                    className="bg-[#141c38] px-6 py-3.5 text-xs font-medium text-white hover:bg-[#1e2952] transition-colors cursor-pointer"
                  >
                    Apply for MSc / PhD Fellowship
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          SUB-PAGE 5: DIGITAL GROUND ARCHIVE & SATELLITE DATA PORTAL
         ===================================================================== */}
      {activeSubpage === 'portal' && (
        <div>
          <section className="mx-auto max-w-[1380px] px-5 pt-14 pb-24 md:px-10 md:pt-24 md:pb-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-7">
                <h1
                  className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight leading-[0.96] text-white"
                  style={{ fontFamily: '"Sora", sans-serif' }}
                >
                  Satellite ground archive
                </h1>
                <p className="mt-8 max-w-xl text-base sm:text-lg text-[#eef1ff] leading-relaxed">
                  Query analysis-ready Level-2A orthorectified multispectral scenes from ETRSS-1
                  and ET-SMART-RSS, Entoto 1.0m photometric catalogs, and East African GNSS space
                  weather logs.
                </p>
              </div>
              <div className="lg:col-span-5" />
            </div>

            {/* Filter Bar */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#090d1e] p-6 items-center">
              <div className="md:col-span-5 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8aa0ff]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by basin or target (Abbay, Addis, Afar, Lake Tana, Blazar)..."
                  aria-label="Search satellite archive scenes"
                  className="w-full bg-[#04050a] pl-10 pr-4 py-3 text-sm text-white placeholder-[#6d76a8] focus:outline-none"
                />
              </div>

              <div className="md:col-span-4 flex flex-wrap gap-1.5">
                {['All', 'ETRSS-1', 'ET-SMART-RSS', 'Entoto 1m', 'GNSS Space Weather'].map(
                  (plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setPlatformFilter(plat)}
                      className={`px-3 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        platformFilter === plat
                          ? 'bg-[#6f8cff] text-[#04050a]'
                          : 'bg-[#04050a] text-[#b9c2ec] hover:text-white'
                      }`}
                    >
                      {plat}
                    </button>
                  )
                )}
              </div>

              <div className="md:col-span-3">
                <div className="flex justify-between text-xs text-[#dce2ff]">
                  <label htmlFor="cloud-cover-Filter">Max Cloud Cover</label>
                  <span className="font-bold text-white tabular-nums">≤ {maxCloud}%</span>
                </div>
                <input
                  id="cloud-cover-Filter"
                  type="range"
                  min={0}
                  max={30}
                  step={2}
                  value={maxCloud}
                  onChange={(e) => setMaxCloud(Number(e.target.value))}
                  className="mt-2 w-full accent-[#6f8cff] cursor-pointer"
                />
              </div>
            </div>

            {/* Full-Width Architectural Telemetry Catalog Table */}
            <div className="mt-10 overflow-x-auto bg-[#070a17] p-6 md:p-8">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0d1226] text-xs text-[#8aa0ff]">
                    <th className="py-4 px-4 font-semibold">Scene ID / Platform</th>
                    <th className="py-4 px-4 font-semibold">Dataset &amp; Ethiopian Region</th>
                    <th className="py-4 px-4 font-semibold">Coordinates</th>
                    <th className="py-4 px-4 font-semibold">Resolution &amp; Bands</th>
                    <th className="py-4 px-4 font-semibold">Cloud</th>
                    <th className="py-4 px-4 text-right font-semibold">Access</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredScenes.map((scene, idx) => (
                    <tr
                      key={scene.id}
                      className={idx % 2 === 0 ? 'bg-[#070a17]' : 'bg-[#0a0f22]'}
                    >
                      <td className="py-5 px-4 align-top whitespace-nowrap">
                        <div className="font-bold text-white">{scene.platform}</div>
                        <div className="text-xs text-[#8e98c9] mt-0.5">{scene.id}</div>
                      </td>
                      <td className="py-5 px-4 align-top max-w-md">
                        <div className="font-bold text-white">{scene.title}</div>
                        <div className="text-xs text-[#b9c2ec] mt-1">{scene.summary}</div>
                      </td>
                      <td className="py-5 px-4 align-top text-[#dce2ff] whitespace-nowrap tabular-nums">
                        <div>{scene.coordinates}</div>
                        <div className="text-xs text-[#8e98c9] mt-0.5">{scene.acquiredDate}</div>
                      </td>
                      <td className="py-5 px-4 align-top text-[#dce2ff]">
                        <div className="font-medium">{scene.resolution}</div>
                        <div className="text-xs text-[#8e98c9] mt-0.5">{scene.bands}</div>
                      </td>
                      <td className="py-5 px-4 align-top font-semibold text-emerald-300 tabular-nums whitespace-nowrap">
                        {scene.cloudCover}%
                      </td>
                      <td className="py-5 px-4 align-top text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            onOpenProposalModal(`Dataset Request: ${scene.id} (${scene.title})`)
                          }
                          className="bg-[#6f8cff] px-4 py-2 text-xs font-semibold text-[#04050a] hover:bg-[#8aa0ff] transition-colors cursor-pointer"
                        >
                          Request Scene ↗
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          ENDUROSAT-STYLE FULL-WIDTH CONVERSION CLOSE & ARCHITECTURAL FOOTER
         ===================================================================== */}
      <footer style={{ backgroundColor: '#04050a' }} className="pt-20 pb-14 px-5 md:px-10">
        <div className="mx-auto max-w-[1380px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end pb-16">
            <div className="lg:col-span-8">
              <h2
                className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.02] text-white"
                style={{ fontFamily: '"Sora", sans-serif' }}
              >
                Space is closer to East Africa than you think
              </h2>
              <p className="mt-4 max-w-xl text-base text-[#b9c2ec]">
                Connect directly with SSGI flight dynamics engineers and Entoto Observatory
                principal investigators in Addis Ababa.
              </p>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <button
                type="button"
                onClick={() => onOpenProposalModal('Initiate SSGI Space Service Proposal')}
                className="bg-[#6f8cff] px-8 py-4 text-sm font-semibold text-[#04050a] hover:bg-[#8aa0ff] transition-colors cursor-pointer"
              >
                Speak with Mission Engineering ↗
              </button>
            </div>
          </div>

          {/* Sub-Page Cross Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
            <button
              type="button"
              onClick={() => onSelectSubpage(prevTab.id)}
              className="bg-[#090d1e] p-6 text-left hover:bg-[#121836] transition-colors cursor-pointer"
            >
              <span className="text-xs text-[#8aa0ff]">← Previous</span>
              <div
                className="mt-1 text-lg font-bold text-white"
                style={{ fontFamily: '"Sora", sans-serif' }}
              >
                {prevTab.label}
              </div>
            </button>

            <button
              type="button"
              onClick={() => onBackToStage(currentTabMeta.stageSectionIndex)}
              className="bg-[#101633] p-6 text-center hover:bg-[#6f8cff] hover:text-[#04050a] transition-colors cursor-pointer group"
            >
              <span className="text-xs text-[#8aa0ff] group-hover:text-[#04050a]">
                Interactive WebGL Stage
              </span>
              <div
                className="mt-1 text-lg font-bold text-white group-hover:text-[#04050a]"
                style={{ fontFamily: '"Sora", sans-serif' }}
              >
                Return to 3D Orbit View
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSelectSubpage(nextTab.id)}
              className="bg-[#090d1e] p-6 text-right hover:bg-[#121836] transition-colors cursor-pointer"
            >
              <span className="text-xs text-[#8aa0ff]">Next →</span>
              <div
                className="mt-1 text-lg font-bold text-white"
                style={{ fontFamily: '"Sora", sans-serif' }}
              >
                {nextTab.label}
              </div>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
