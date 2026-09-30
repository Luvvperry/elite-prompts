import { Language } from './types';

export interface TranslationSchema {
  branding: {
    title: string;
    accent: string;
    subtitle: string;
    edition: string;
    status: string;
    footer: string;
  };
  nav: {
    fromImage: string;
    fromIdea: string;
    simpleMode: string;
    advancedMode: string;
    history: string;
    presets: string;
    themeDark: string;
    themeLight: string;
    promptLang: string;
    promptLangAuto: string;
  };
  modalities: {
    typeLabel: string;
    person: string;
    object_pov: string;
    scene: string;
    vehicle: string;
    product: string;
    interior: string;
    architecture: string;
    edit_prompt: string;
  };
  upload: {
    title: string;
    dragDrop: string;
    maxSize: string;
    addMore: string;
    referenceList: string;
    primaryRef: string;
    refNumber: string;
    role: string;
    roles: {
      identity: string;
      face: string;
      outfit: string;
      pose: string;
      location: string;
      vehicle: string;
      lighting: string;
      style: string;
      object: string;
      full_image: string;
    };
    assignment: string;
    assignmentOptions: {
      general: string;
      subjectA: string;
      subjectB: string;
    };
    directivesLabel: string;
    directivesPlaceholder: string;
    remove: string;
    replace: string;
  };
  idea: {
    placeholder: string;
    magicEnhance: string;
    magicEnhancing: string;
    magicHint: string;
    suggestionsTitle: string;
    charCount: string;
    examples: string[];
  };
  simple: {
    opticalSystem: string;
    aspectRatio: string;
    photoStyle: string;
    captureProfile: string;
    realism: string;
    balanced: string;
    forensic100: string;
    generate: string;
    analyzing: string;
    generating: string;
    modeHint: string;
    searchCamera: string;
    searchType: string;
    openLibrary: string;
    recent: string;
    favorites: string;
    outputFormat: string;
  };
  advanced: {
    autoDetectTitle: string;
    autoDetectSub: string;
    autoDetectOn: string;
    autoDetectOff: string;
    detectedTitle: string;
    modeHint: string;
    sections: {
      subject: string;
      pose: string;
      action: string;
      camera: string;
      composition: string;
      light: string;
      sliders: string;
      imperfections: string;
      wardrobe: string;
      vehicle: string;
      environment: string;
      priority: string;
      fineControl: string;
      pov: string;
      realismAndCleanup: string;
      preserveLocks: string;
    };
    subject: {
      count: string;
      height: string;
      bodyPosition: string;
      orientation: string;
      weightDistribution: string;
    };
    posture: {
      label: string;
      custom: string;
      expression: string;
      gaze: string;
    };
    action: {
      label: string;
      placeholder: string;
    };
    camera: {
      device: string;
      lens: string;
      distance: string;
      height: string;
      angle: string;
      framing: string;
    };
    light: {
      time: string;
      source: string;
      flash: string;
      flashBehavior: string;
    };
    sliders: {
      realism: string;
      imperfection: string;
      cinematic: string;
      cinematicNote: string;
      stylization: string;
      backgroundDetail: string;
      blur: string;
    };
    imperfections: {
      motionBlur: string;
      slightFocusMiss: string;
      digitalNoise: string;
      flashBlowout: string;
      whiteBalanceShift: string;
      compression: string;
      lensSmudge: string;
      minorCameraShake: string;
    };
    wardrobe: {
      top: string;
      bottom: string;
      shoes: string;
      outerwear: string;
      accessories: string;
      headwear: string;
      jewelryWatch: string;
      customDetails: string;
      referenceLock: string;
      topPlaceholder: string;
      bottomPlaceholder: string;
    };
    vehicle: {
      vehicleText: string;
      placeholder: string;
      modelLock: string;
      exteriorColor: string;
      interiorColor: string;
      driverPassenger: string;
      doorState: string;
      subjectRelation: string;
    };
    environment: {
      location: string;
      locationPlaceholder: string;
      setting: string;
      background: string;
      timeOfDay: string;
      timePlaceholder: string;
      weather: string;
      crowd: string;
      naturalClutter: string;
      mood: string;
      avoidPostcard: string;
      avoidGenericLuxury: string;
    };
    priority: {
      label: string;
      loose: string;
      balanced: string;
      strong: string;
      absolute: string;
    };
    fineControl: {
      subject: string;
      action: string;
      location: string;
      environment: string;
      background: string;
      atmosphere: string;
      imperfections: string;
      purpose: string;
      referenceUse: string;
      textInsideImage: string;
      avoid: string;
      avoidPlaceholder: string;
      additionalInstructions: string;
      instructionsPlaceholder: string;
    };
    pov: {
      handVisibility: string;
      gripType: string;
      heldObject: string;
      heldObjectPlaceholder: string;
      pointOfViewHeight: string;
      surface: string;
      objectRealism: string;
    };
    realismAndCleanup: {
      realismTier: string;
      aiCleanup: string;
      aiCleanupHint: string;
    };
    preserveLocks: {
      title: string;
      sub: string;
    };
  };
  options: {
    subjectCount: {
      auto: string;
      solo: string;
      dupla: string;
      three: string;
      group: string;
    };
    bodyPosition: {
      auto: string;
      standing: string;
      sitting: string;
      leaning: string;
      walking: string;
      crouching: string;
      lying: string;
      mid_action: string;
    };
    orientation: {
      auto: string;
      front: string;
      threeQuarter: string;
      side: string;
      rearThreeQuarter: string;
      back: string;
    };
    weightDistribution: {
      auto: string;
      balanced: string;
      left: string;
      right: string;
      dynamic: string;
    };
    posture: {
      auto: string;
      relaxed: string;
      distracted: string;
      casual: string;
      leaning: string;
      slouched: string;
      upright: string;
      walking: string;
      running: string;
    };
    gaze: {
      auto: string;
      away_from_camera: string;
      at_camera: string;
      down: string;
      up: string;
      left: string;
      right: string;
      at_object: string;
      at_another_person: string;
    };
    cameraDevice: {
      auto: string;
      iphone_rear: string;
      iphone_front: string;
      smartphone_rear: string;
      professional_camera: string;
    };
    cameraLens: {
      auto: string;
      ultraWide: string;
      wide: string;
      standard: string;
      telephoto: string;
      prime35: string;
      prime50: string;
    };
    cameraDistance: {
      auto: string;
      very_close: string;
      close: string;
      medium: string;
      far: string;
      very_far: string;
    };
    cameraHeight: {
      auto: string;
      ground: string;
      waist: string;
      chest: string;
      eye: string;
      above_eye: string;
      high: string;
    };
    cameraFraming: {
      auto: string;
      close_up: string;
      chest: string;
      waist: string;
      threeQuarter: string;
      full_body: string;
      wide_environmental: string;
    };
    lightTime: {
      auto: string;
      morning: string;
      midday: string;
      afternoon: string;
      sunset: string;
      blue_hour: string;
      night: string;
      late_night: string;
    };
    lightSource: {
      auto: string;
      natural: string;
      phone_flash: string;
      streetlight: string;
      window: string;
      lamp: string;
      mixed_light: string;
      no_artificial: string;
    };
    flashBehavior: {
      normal: string;
      hard_direct: string;
      slight_blowout: string;
      natural_falloff: string;
      strong: string;
    };
    subjectRelation: {
      leaning_against: string;
      standing_near: string;
      inside: string;
      driving: string;
      entering: string;
      exiting: string;
      sitting_on: string;
    };
    photoStyles: {
      auto: string;
      casual_smartphone: string;
      pov: string;
      candid: string;
      street_photography: string;
      social_media_ugc: string;
      night_photography: string;
      portrait: string;
      editorial: string;
      fashion: string;
      luxury_lifestyle: string;
      automotive: string;
      product_photography: string;
      architecture: string;
      disposable_camera: string;
      film35mm: string;
      polaroid: string;
    };
    povHandVisibility: {
      auto: string;
      one_hand: string;
      both_hands: string;
      no_hands: string;
    };
    povGripType: {
      auto: string;
      holding_object: string;
      resting_on_surface: string;
      touching_screen: string;
      steering: string;
      drinking_eating: string;
    };
    povHeight: {
      auto: string;
      eye_level: string;
      chest_level: string;
      tabletop_lookdown: string;
    };
    captureProfiles: Record<string, string>;
    captureProfileDescriptions: Record<string, string>;
    cameraModes: Record<string, string>;
    cameraFeels: Record<string, string>;
    surfaces: Record<string, string>;
    environmentConditions: Record<string, string>;
    objectRealism: Record<string, string>;
    actionMoments: Record<string, string>;
    flashes: Record<string, string>;
    imperfectionsList: Record<string, string>;
    locks: Record<string, string>;
    outputFormats: Record<string, string>;
    typeCategories: Record<string, string>;
    cameraCategories: Record<string, string>;
    typesList: Record<string, string>;
  };
  output: {
    v1Tab: string;
    v2Tab: string;
    v3Tab: string;
    compareTab: string;
    v1Title: string;
    v1Sub: string;
    v2Title: string;
    v2Sub: string;
    v3Title: string;
    v3Sub: string;
    compare: string;
    copy: string;
    copied: string;
    save: string;
    refine: string;
    refineTooltip: string;
    copyAll: string;
    copiedAll: string;
    copyNegative: string;
    negativePromptTitle: string;
    statsCharacters: string;
    statsWords: string;
    statsTokens: string;
    refinePromptTitle: string;
    refinePromptSub: string;
    refineInputPlaceholder: string;
    refineApply: string;
    refineCancel: string;
    refining: string;
    emptyTitle: string;
    emptySub: string;
    loadingTitle: string;
    loadingSub: string;
    loadingSteps: string[];
    snapshotSaved: string;
  };
  history: {
    title: string;
    empty: string;
    clearAll: string;
    restore: string;
    delete: string;
    close: string;
    imageRef: string;
    idea: string;
  };
  presets: {
    title: string;
    apply: string;
    saveCurrent: string;
    saveBtn: string;
    presetNamePlaceholder: string;
    delete: string;
    savedAlert: string;
    defaultBadge: string;
    defaults: {
      rawIphone: string;
      rawIphoneDesc: string;
      nightFlash: string;
      nightFlashDesc: string;
      casualCandid: string;
      casualCandidDesc: string;
      deepDof: string;
      deepDofDesc: string;
      pov: string;
      povDesc: string;
      automotive: string;
      automotiveDesc: string;
    };
  };
  errors: {
    noInput: string;
    failed: string;
    missingKey: string;
  };
}

export const translations: Record<Language, TranslationSchema> = {
  en: {
    branding: {
      title: "Perfectly,",
      accent: "imperfect.",
      subtitle: "Optical Forensics Engine",
      edition: "PRO EDITION",
      status: "System Online",
      footer: "PERFECTLY, IMPERFECT. — OPTICAL FORENSICS ENGINE V1 / V2 / V3 / V4 / V5 / V6"
    },
    nav: {
      fromImage: "From Image",
      fromIdea: "From Idea",
      simpleMode: "Simple",
      advancedMode: "Advanced",
      history: "History",
      presets: "Presets",
      themeDark: "Dark Mode",
      themeLight: "Light Mode",
      promptLang: "Prompt Language",
      promptLangAuto: "Auto"
    },
    modalities: {
      typeLabel: "Type:",
      person: "Person",
      object_pov: "Object / POV",
      scene: "Scene",
      vehicle: "Vehicle",
      product: "Product",
      interior: "Interior",
      architecture: "Architecture",
      edit_prompt: "Edit Existing Prompt"
    },
    upload: {
      title: "Upload Reference",
      dragDrop: "Drag & drop or click to upload multiple images",
      maxSize: "JPG, PNG, WebP up to 15MB",
      addMore: "Add Reference",
      referenceList: "References",
      primaryRef: "Primary Reference",
      refNumber: "Ref",
      role: "Role",
      roles: {
        identity: "Identity",
        face: "Face",
        outfit: "Outfit",
        pose: "Pose",
        location: "Location",
        vehicle: "Vehicle",
        lighting: "Lighting",
        style: "Style",
        object: "Object",
        full_image: "Full Image"
      },
      assignment: "Subject Assignment",
      assignmentOptions: {
        general: "General Scene",
        subjectA: "Subject A",
        subjectB: "Subject B"
      },
      directivesLabel: "Optional Directives for Reference",
      directivesPlaceholder: "e.g. prioritize pose and lighting, keep exact clothing drape, change car model if needed...",
      remove: "Remove",
      replace: "Replace"
    },
    idea: {
      placeholder: "Describe the image you want to create (e.g. leaning against a 4x4 in Los Angeles at 18:30, distracted, wearing a white puffer, lamborghini revuelto behind, distant shot with phone flash)...",
      magicEnhance: "Magic Enhance",
      magicEnhancing: "Refining...",
      magicHint: "Enriches optical & physical context without altering your explicit facts.",
      suggestionsTitle: "Quick Contextual Starters:",
      charCount: "chars",
      examples: [
        "leaning against a 4x4 in los angeles at 18:30, distracted, wearing a white puffer, lamborghini revuelto behind, distant shot with phone flash",
        "man sitting relaxed on a leather couch at night looking away, warm lamp illumination, casual smartphone snapshot",
        "golfer at top of backswing on sun-drenched fairway, crisp deep DOF, authentic athletic tension, neutral camera grading",
        "driver pov inside a vintage sports car during blue hour, hands resting loosely on steering wheel, rain droplets on windshield"
      ]
    },
    simple: {
      opticalSystem: "Optical System",
      aspectRatio: "Aspect Ratio",
      photoStyle: "Photographic Style",
      realism: "Realism Priority",
      balanced: "Balanced",
      forensic100: "Forensic Optical (100%)",
      generate: "Generate Prompts",
      analyzing: "Analyzing Optics...",
      generating: "Generating Blueprint...",
      modeHint: "Essential optical parameters",
      captureProfile: "Capture Profile",
      outputFormat: "Output Format",
      searchCamera: "Search camera...",
      searchType: "Search type...",
      openLibrary: "Open Library",
      recent: "Recent",
      favorites: "Favorites"
    },
    advanced: {
      autoDetectTitle: "Auto Detect",
      autoDetectSub: "Analyzes context to calibrate optical & physical parameters",
      autoDetectOn: "Active",
      autoDetectOff: "Manual",
      detectedTitle: "Detected Context (Click to edit):",
      modeHint: "Forensic scene controls",
      sections: {
        subject: "Subject & Anatomy",
        pose: "Pose & Posture",
        action: "Action & Context",
        camera: "Camera & Optics",
        composition: "Composition & Aspect",
        light: "Light & Atmosphere",
        sliders: "Realism & Fine Tuning",
        imperfections: "Forensic Imperfections",
        wardrobe: "Wardrobe & Materials",
        vehicle: "Vehicle Forensics",
        environment: "Environment & Space",
        priority: "Reference Priority",
        fineControl: "Precision Instructions",
        pov: "First-Person POV & Hands",
        realismAndCleanup: "Realism Tier & AI Cleanup",
        preserveLocks: "Subject & Scene Locks"
      },
      subject: {
        count: "Number of Subjects",
        height: "Height / Stature",
        bodyPosition: "Body Position",
        orientation: "Orientation",
        weightDistribution: "Weight Distribution"
      },
      posture: {
        label: "Posture State",
        custom: "Specific Posture Details",
        expression: "Facial Expression",
        gaze: "Gaze Direction"
      },
      action: {
        label: "Describe Action...",
        placeholder: "e.g. leaning against car fender, one hand in pocket, looking off into the street..."
      },
      camera: {
        device: "Device Type",
        lens: "Lens Focal Length",
        distance: "Camera Distance",
        height: "Camera Height",
        angle: "Camera Angle",
        framing: "Framing"
      },
      light: {
        time: "Time of Day",
        source: "Primary Light Source",
        flash: "Flash Mode",
        flashBehavior: "Flash Propagation Behavior"
      },
      sliders: {
        realism: "Raw Realism",
        imperfection: "Optical Imperfection",
        cinematic: "Cinematic Grade",
        cinematicNote: "(Default: Low for Snapshot Realism)",
        stylization: "Stylization",
        backgroundDetail: "Background Detail",
        blur: "Optical Bokeh / Blur"
      },
      imperfections: {
        motionBlur: "Motion Blur",
        slightFocusMiss: "Slight Focus Miss",
        digitalNoise: "Digital Sensor Noise",
        flashBlowout: "Flash Direct Blowout",
        whiteBalanceShift: "White Balance Shift",
        compression: "Compression Artifacts",
        lensSmudge: "Lens Flare / Smudge",
        minorCameraShake: "Handheld Micro-shake"
      },
      wardrobe: {
        top: "Top / Upper Body",
        bottom: "Bottom / Pants",
        shoes: "Footwear",
        outerwear: "Outerwear / Jacket",
        accessories: "Accessories",
        headwear: "Headwear",
        jewelryWatch: "Watch / Jewelry",
        customDetails: "Custom Fabric Details",
        referenceLock: "Strict Wardrobe Lock",
        topPlaceholder: "e.g. thick white puffer jacket with wide baffle seams",
        bottomPlaceholder: "e.g. loose dark denim trousers"
      },
      vehicle: {
        vehicleText: "Vehicle Make, Model & Approximate Year",
        placeholder: "e.g. 4x4 SUV + Lamborghini Revuelto in background",
        modelLock: "Strict Model Lock",
        exteriorColor: "Exterior Color / Finish",
        interiorColor: "Interior Upholstery",
        driverPassenger: "Seat Position",
        doorState: "Door State",
        subjectRelation: "Subject Relation to Vehicle"
      },
      environment: {
        location: "Location / City",
        locationPlaceholder: "e.g. Los Angeles residential driveway",
        setting: "Setting / Context",
        background: "Background Elements",
        timeOfDay: "Exact Time",
        timePlaceholder: "e.g. 18:30 dusk",
        weather: "Weather Conditions",
        crowd: "Crowd / People",
        naturalClutter: "Natural Everyday Clutter",
        mood: "Atmospheric Tier",
        avoidPostcard: "Avoid Postcard Look",
        avoidGenericLuxury: "Avoid Generic Luxury"
      },
      priority: {
        label: "Reference Priority",
        loose: "Loose (Creative freedom)",
        balanced: "Balanced (Natural alignment)",
        strong: "Strong (Faithful details)",
        absolute: "Absolute (Forensic lock)"
      },
      fineControl: {
        subject: "Subject Override",
        action: "Specific Action",
        location: "Location Override",
        environment: "Environment Details",
        background: "Background Structure",
        atmosphere: "Atmosphere & Mood",
        imperfections: "Imperfection Notes",
        purpose: "Purpose / Use Case",
        referenceUse: "Reference Usage Notes",
        textInsideImage: "Text Inside Image (if any)",
        avoid: "Negative / Avoid",
        avoidPlaceholder: "e.g. no plastic skin, no CGI studio look, no artificial HDR haloing",
        additionalInstructions: "Additional Precise Directives",
        instructionsPlaceholder: "Any final exact directives for the optical blueprint..."
      },
      pov: {
        handVisibility: "Hands in Frame",
        gripType: "Grip & Contact",
        heldObject: "Held / Interacted Object",
        heldObjectPlaceholder: "e.g. coffee mug, steering wheel, cocktail glass, phone, watch",
        pointOfViewHeight: "POV Viewpoint Height",
        surface: "Surface / Contact Plane",
        objectRealism: "Object Realism State"
      },
      realismAndCleanup: {
        realismTier: "Realism Tier",
        aiCleanup: "Anti-AI Artifact Suppression",
        aiCleanupHint: "Higher AI cleanup imposes stronger physical and optical constraints against artificial AI-rendered artifacts."
      },
      preserveLocks: {
        title: "Preserve Reference Attributes (Locks)",
        sub: "Select which elements from references must be strictly preserved in the optical blueprint."
      }
    },
    options: {
      subjectCount: {
        auto: "Auto Detect",
        solo: "1 Person (Solo)",
        dupla: "2 Persons (Dupla)",
        three: "3 Persons",
        group: "Group"
      },
      bodyPosition: {
        auto: "Auto",
        standing: "Standing",
        sitting: "Sitting / Seated",
        leaning: "Leaning",
        walking: "Walking",
        crouching: "Crouching",
        lying: "Lying Down",
        mid_action: "Mid-action"
      },
      orientation: {
        auto: "Auto",
        front: "Front Facing",
        threeQuarter: "3/4 Profile",
        side: "Side Profile",
        rearThreeQuarter: "Rear 3/4",
        back: "Back Turned"
      },
      weightDistribution: {
        auto: "Auto",
        balanced: "Balanced Centered",
        left: "Left Leg / Pelvis",
        right: "Right Leg / Pelvis",
        dynamic: "Dynamic Athletic"
      },
      posture: {
        auto: "Auto Contextual",
        relaxed: "Relaxed",
        distracted: "Distracted / Candid",
        casual: "Casual",
        leaning: "Leaning Against Surface",
        slouched: "Slouched",
        upright: "Upright / Formal",
        walking: "Mid-stride / Walking",
        running: "Dynamic Athletic"
      },
      gaze: {
        auto: "Auto",
        away_from_camera: "Away From Camera",
        at_camera: "Directly At Camera",
        down: "Looking Down",
        up: "Looking Up",
        left: "Looking Off-Frame Left",
        right: "Looking Off-Frame Right",
        at_object: "Looking At Held Object",
        at_another_person: "Looking At Other Person"
      },
      cameraDevice: {
        auto: "Auto Device Match",
        iphone_rear: "iPhone Rear 1x (Default Snapshot)",
        iphone_front: "iPhone Front Camera (Selfie)",
        smartphone_rear: "Generic Smartphone Rear",
        professional_camera: "Professional Full-Frame DSLR"
      },
      cameraLens: {
        auto: "Auto (24-26mm standard)",
        ultraWide: "0.5x (Ultra Wide ~13mm)",
        wide: "1x (Wide ~24-26mm)",
        standard: "2x (Standard ~48-52mm)",
        telephoto: "3x (Telephoto ~77-85mm)",
        prime35: "35mm Prime Lens",
        prime50: "50mm Prime Lens"
      },
      cameraDistance: {
        auto: "Auto",
        very_close: "Very Close",
        close: "Close",
        medium: "Medium",
        far: "Far (Environmental)",
        very_far: "Very Far"
      },
      cameraHeight: {
        auto: "Auto",
        ground: "Ground Level",
        waist: "Waist Height",
        chest: "Chest Height",
        eye: "Eye Level",
        above_eye: "Above Eye Level",
        high: "High Angle"
      },
      cameraFraming: {
        auto: "Auto",
        close_up: "Close-up",
        chest: "Chest-up",
        waist: "Waist-up",
        threeQuarter: "3/4 Body",
        full_body: "Full Body",
        wide_environmental: "Wide Environmental"
      },
      lightTime: {
        auto: "Auto",
        morning: "Morning Soft Light",
        midday: "Midday Direct Sun",
        afternoon: "Late Afternoon",
        sunset: "Sunset / Golden Hour",
        blue_hour: "Blue Hour (Dusk 18:30-19:30)",
        night: "Night Time",
        late_night: "Late Night Pitch Darkness"
      },
      lightSource: {
        auto: "Auto",
        natural: "Natural Ambient Only",
        phone_flash: "Direct Phone Flash",
        streetlight: "Streetlight Overhead",
        window: "Window Daylight",
        lamp: "Warm Practical Lamp",
        mixed_light: "Mixed Ambient & Flash",
        no_artificial: "No Artificial Fill"
      },
      flashBehavior: {
        normal: "Normal Natural Phone Flash",
        hard_direct: "Hard Direct Frontal (Raw Snapshot)",
        slight_blowout: "Slight Foreground Blowout",
        natural_falloff: "Natural Falloff (Dark Distant Background)",
        strong: "Strong Burst"
      },
      subjectRelation: {
        leaning_against: "Leaning Against Car",
        standing_near: "Standing Near",
        inside: "Seated Inside",
        driving: "Driving",
        entering: "Entering",
        exiting: "Exiting",
        sitting_on: "Sitting On Hood/Trunk"
      },
      photoStyles: {
        auto: "Auto Photographic Match",
        casual_smartphone: "Casual Smartphone RAW",
        pov: "POV First-Person",
        candid: "Candid Unposed",
        street_photography: "Street Photography",
        social_media_ugc: "Social Media UGC",
        night_photography: "Night Flash Photography",
        portrait: "Portrait Prime Lens",
        editorial: "Editorial Magazine",
        fashion: "High Fashion Studio/Street",
        luxury_lifestyle: "Luxury Lifestyle (Realistic)",
        automotive: "Automotive Forensics",
        product_photography: "Tactile Product",
        architecture: "Architectural Optics",
        disposable_camera: "Disposable Flash Camera",
        film35mm: "35mm Analog Film",
        polaroid: "Instant Polaroid"
      },
      povHandVisibility: {
        auto: "Auto (Contextual)",
        one_hand: "One Hand Visible",
        both_hands: "Both Hands Visible",
        no_hands: "No Hands (Pure Ocular POV)"
      },
      povGripType: {
        auto: "Auto (Natural)",
        holding_object: "Holding Object Firmly",
        resting_on_surface: "Resting on Surface",
        touching_screen: "Touching Screen / Controls",
        steering: "Grip on Steering Wheel",
        drinking_eating: "Bringing to Mouth / Drink"
      },
      povHeight: {
        auto: "Auto (Contextual)",
        eye_level: "Eye Level",
        chest_level: "Chest Level",
        tabletop_lookdown: "Tabletop Look-Down (High Angle)"
      },
      captureProfiles: {
        auto: "Auto (Contextual)",
        raw_smartphone: "Raw Smartphone",
        clean_smartphone: "Clean Smartphone",
        night_flash: "Night Flash",
        low_light: "Low Light",
        candid: "Candid Unposed",
        social_media: "Social Media UGC",
        pov: "POV First-Person",
        mirror: "Mirror Reflection",
        selfie: "Front Camera Selfie",
        documentary: "Documentary Snapshot",
        automotive_casual: "Automotive Casual",
        object_pov_raw: "Object / POV Raw"
      },
      captureProfileDescriptions: {
        auto: "Contextual forensic match based on subject and scene",
        raw_smartphone: "Casual smartphone photo, natural mobile processing, subtle imperfections",
        clean_smartphone: "Crisp and clean smartphone optics without fake commercial artificiality",
        night_flash: "Direct mobile phone flash, darker background, strong contact shadows and fast falloff",
        low_light: "Realistic digital noise texture, auto-exposure latitude and natural focus",
        candid: "Spontaneous real-life moment, imperfect framing, unposed posture",
        social_media: "Authentic UGC snapshot appropriate for feeds, zero advertising gloss",
        pov: "Realistic first-person eye or chest level perspective",
        mirror: "Authentic mirror selfie behavior and natural glass reflections",
        selfie: "Genuine front-facing smartphone camera glance and focal length",
        documentary: "Realistic observational record without cinematic color grading",
        automotive_casual: "Casual phone snapshot of a car, no artificial showroom polish",
        object_pov_raw: "Objects photographed casually with real tactile context around them"
      },
      cameraModes: {
        auto: "Auto",
        rear_main: "Rear Main Camera",
        rear_ultrawide: "Rear 0.5x Ultra Wide",
        rear_1x: "Rear 1x Main",
        rear_2x: "Rear 2x",
        rear_3x: "Rear 3x",
        rear_telephoto: "Rear Telephoto",
        front_camera: "Front Camera",
        mirror_selfie: "Mirror Selfie",
        handheld_pov: "Handheld POV",
        chest_pov: "Chest-level POV",
        overhead: "Overhead Smartphone",
        low_angle: "Low-angle Smartphone"
      },
      cameraFeels: {
        auto: "Auto",
        very_raw: "Very Raw",
        casual: "Casual",
        clean: "Clean",
        slightly_shaky: "Slightly Shaky",
        quick_snapshot: "Quick Snapshot",
        distracted_capture: "Distracted Capture",
        social_media: "Social Media",
        low_light: "Low Light",
        direct_flash: "Direct Flash",
        older_phone_look: "Older Phone Look"
      },
      surfaces: {
        auto: "Auto (Natural)",
        wood_table: "Wood Table",
        glass_table: "Glass Table",
        stone: "Stone",
        concrete: "Concrete",
        car_hood: "Car Hood",
        car_interior: "Car Interior",
        leather: "Leather",
        fabric: "Fabric",
        bed: "Bed",
        floor: "Floor",
        counter: "Counter",
        desk: "Desk",
        metal: "Metal",
        asphalt: "Asphalt",
        grass: "Grass",
        sand: "Sand",
        custom: "Custom Surface"
      },
      environmentConditions: {
        auto: "Auto (Contextual)",
        very_clean: "Very Clean",
        normal: "Normal",
        lived_in: "Lived-in",
        slightly_messy: "Slightly Messy",
        messy: "Messy",
        raw: "Raw",
        dusty: "Dusty",
        used: "Used",
        wet: "Wet",
        dry: "Dry"
      },
      objectRealism: {
        clean_product: "Clean Product",
        natural: "Natural",
        used: "Used",
        very_used: "Very Used",
        imperfect: "Imperfect (Dust & Smudges)",
        raw: "Raw & Weathered"
      },
      actionMoments: {
        auto: "Auto",
        static: "Static / Resting",
        before_action: "Before Action",
        mid_action: "Mid Action",
        impact_moment: "Impact Moment",
        immediately_after: "Immediately After",
        walking: "Walking",
        turning: "Turning",
        sitting_down: "Sitting Down",
        standing_up: "Standing Up",
        reaching: "Reaching",
        holding: "Holding",
        using_object: "Using Object",
        distracted: "Distracted",
        waiting: "Waiting",
        talking: "Talking",
        laughing: "Laughing",
        eating: "Eating",
        drinking: "Drinking",
        smoking: "Smoking",
        driving: "Driving",
        custom: "Custom Action"
      },
      flashes: {
        auto: "Auto",
        off: "Off",
        on: "On",
        direct: "Direct Flash",
        hard_direct: "Hard Direct Flash",
        strong: "Strong Flash",
        slight_blowout: "Slight Blowout",
        heavy_blowout: "Heavy Blowout",
        close_range_flash: "Close-range Flash",
        night_flash: "Night Flash"
      },
      imperfectionsList: {
        motion_blur_slight: "Slight Motion Blur",
        motion_blur_medium: "Medium Motion Blur",
        motion_blur_strong: "Strong Motion Blur",
        focus_miss_small: "Small Focus Miss",
        soft_focus: "Soft Focus",
        digital_noise: "Digital Sensor Noise",
        high_iso_noise: "High ISO Grain",
        flash_blowout: "Flash Highlight Blowout",
        white_balance_error: "White Balance Shift",
        compression: "Mobile Compression",
        lens_smudge: "Lens Fingerprint Smudge",
        finger_near_lens: "Finger Near Lens Edge",
        minor_camera_shake: "Minor Camera Shake",
        crooked_horizon: "Crooked Horizon",
        slight_underexposure: "Slight Underexposure",
        slight_overexposure: "Slight Overexposure"
      },
      locks: {
        face: "Face",
        hair: "Hair",
        skinTone: "Skin Tone",
        body: "Body",
        height: "Height",
        outfit: "Outfit",
        accessories: "Accessories",
        pose: "Pose",
        vehicle: "Vehicle",
        object: "Object",
        environment: "Environment",
        camera: "Camera",
        lighting: "Lighting"
      },
      outputFormats: {
        auto: "Auto (Original)",
        ig_portrait: "Instagram Feed Portrait (4:5)",
        ig_square: "Instagram Feed Square (1:1)",
        ig_story: "Instagram Story (9:16)",
        ig_reel: "Instagram Reel (9:16)",
        tiktok: "TikTok (9:16)",
        youtube_thumb: "YouTube Thumbnail (16:9)",
        youtube_shorts: "YouTube Shorts (9:16)",
        facebook_feed: "Facebook Feed (4:5)",
        facebook_story: "Facebook Story (9:16)",
        x_post: "X Post (16:9)",
        linkedin_post: "LinkedIn Post (1:1)",
        pinterest_pin: "Pinterest Pin (2:3)",
        whatsapp_status: "WhatsApp Status (9:16)",
        telegram_story: "Telegram Story/Post (9:16)",
        mobile_wallpaper: "Mobile Wallpaper (9:16)",
        desktop_wallpaper: "Desktop Wallpaper (16:9)",
        website_hero: "Website Hero (21:9)",
        ecommerce_product: "E-commerce Product (1:1)",
        custom: "Custom Format"
      },
      typeCategories: {
        all: "All",
        people: "People",
        object_pov: "Object / POV",
        vehicles: "Vehicles",
        environments: "Environments",
        architecture: "Architecture",
        product: "Product",
        tools: "Prompt Tools"
      },
      cameraCategories: {
        all: "All Cameras",
        iphone: "Apple iPhone",
        samsung: "Samsung Galaxy",
        pixel: "Google Pixel",
        other: "Other Smartphones"
      },
      typesList: {
        person: "Person (General)",
        solo_person: "Solo Person",
        duo_people: "Duo / Two People",
        group_people: "Group",
        couple: "Couple",
        selfie: "Selfie",
        mirror_selfie: "Mirror Selfie",
        full_body: "Full Body",
        half_body: "Half Body",
        portrait: "Portrait",
        candid_person: "Candid Person",
        person_walking: "Person Walking",
        person_sitting: "Person Sitting",
        person_leaning: "Person Leaning",
        person_in_car: "Person in Car",
        person_with_vehicle: "Person with Vehicle",
        person_with_object: "Person with Object",
        outfit_fashion: "Outfit / Fashion",
        lifestyle_person: "Lifestyle Person",
        sport_action: "Sport / Action",
        object_pov: "Object / POV",
        object_close_up: "Object Close-up",
        handheld_object: "Handheld Object",
        object_on_table: "Object on Table",
        object_in_hand: "Object in Hand",
        desk_pov: "Desk POV",
        food_pov: "Food POV",
        table_food: "Table / Food",
        luxury_objects: "Luxury Objects",
        watch_jewelry_pov: "Watch / Jewelry POV",
        phone_tech_pov: "Phone / Tech POV",
        bag_accessory_pov: "Bag / Accessory POV",
        sneaker_pov: "Sneaker POV",
        car_hood_pov: "Car Hood POV",
        car_interior_pov: "Car Interior POV",
        driver_pov: "Driver POV",
        passenger_pov: "Passenger POV",
        garage_pov: "Garage POV",
        room_pov: "Room POV",
        bed_pov: "Bed POV",
        balcony_pov: "Balcony POV",
        street_pov: "Street POV",
        vehicle: "Vehicle",
        car_exterior: "Car Exterior",
        car_interior: "Car Interior",
        driver_seat: "Driver Seat",
        passenger_seat: "Passenger Seat",
        open_door: "Open Door",
        entering_car: "Entering Car",
        exiting_car: "Exiting Car",
        leaning_against_car: "Leaning Against Car",
        car_plus_person: "Car + Person",
        supercar: "Supercar",
        suv_4x4: "SUV / 4x4",
        sedan: "Sedan",
        sports_car: "Sports Car",
        classic_car: "Classic Car",
        motorcycle: "Motorcycle",
        off_road: "Off-Road",
        garage_vehicle: "Garage",
        driveway: "Driveway",
        parking_lot: "Parking Lot",
        scene: "Scene",
        interior: "Interior",
        exterior: "Exterior",
        home_interior: "Home Interior",
        living_room: "Living Room",
        bedroom: "Bedroom",
        kitchen: "Kitchen",
        office: "Office",
        garage_env: "Garage",
        balcony_env: "Balcony",
        rooftop: "Rooftop",
        restaurant: "Restaurant",
        cafe: "Cafe",
        hotel: "Hotel",
        airport: "Airport",
        hangar: "Hangar",
        street: "Street",
        residential_street: "Residential Street",
        city_night: "City Night",
        rural: "Rural",
        ranch: "Ranch",
        beach: "Beach",
        marina: "Marina",
        golf_course: "Golf Course",
        sports_location: "Sports Location",
        architecture: "Architecture",
        real_estate: "Real Estate",
        house_exterior: "House Exterior",
        house_interior: "House Interior",
        apartment: "Apartment",
        luxury_home: "Luxury Home",
        ordinary_home: "Ordinary Home",
        room_arch: "Room",
        lobby: "Lobby",
        pool_area: "Pool Area",
        garden: "Garden",
        commercial_interior: "Commercial Interior",
        building_exterior: "Building Exterior",
        product: "Product",
        product_close_up: "Product Close-up",
        product_in_use: "Product in Use",
        product_on_table: "Product on Table",
        packaging: "Packaging",
        watch: "Watch",
        jewelry: "Jewelry",
        perfume: "Perfume",
        shoes: "Shoes",
        clothing_item: "Clothing Item",
        tech_product: "Tech Product",
        food_product: "Food Product",
        automotive_detail: "Automotive Detail",
        edit_existing_prompt: "Edit Existing Prompt",
        fix_realism: "Fix Realism",
        expand_prompt: "Expand Prompt",
        rewrite_prompt: "Rewrite Prompt",
        idea_to_prompt: "Idea to Prompt",
        reference_to_prompt: "Reference to Prompt",
        change_only: "Change Only",
        diagnose_fake_result: "Diagnose Fake Result",
        rebuild_scene: "Rebuild Scene"
      }
    },
    output: {
      v1Tab: "V1 Smart",
      v2Tab: "V2 Structured",
      v3Tab: "V3 Forensic",
      compareTab: "Compare",
      v1Title: "V1 — Smart Natural Snapshot",
      v1Sub: "Compact, physically resolved smartphone prompt",
      v2Title: "V2 — Structured Photographic Reconstruction",
      v2Sub: "Structured photographic reconstruction with physical scene logic",
      v3Title: "V3 — Forensic Deep Prompt",
      v3Sub: "Deep physical reconstruction in direct curly-brace format",
      compare: "Compare All",
      copy: "Copy",
      copied: "Copied!",
      save: "Save to Presets",
      refine: "Refine",
      refineTooltip: "Refine specific element without regenerating scene",
      copyAll: "Copy All 3 Prompts",
      copiedAll: "All 3 Prompts Copied!",
      copyNegative: "Copy Negative",
      negativePromptTitle: "Negative Prompt (AI Artifact Filter)",
      statsCharacters: "Chars",
      statsWords: "Words",
      statsTokens: "Tokens",
      refinePromptTitle: "Refine Prompt",
      refinePromptSub: "Specify only the exact delta (e.g. 'change jacket to black bomber', 'remove the car'). The scene composition will remain intact.",
      refineInputPlaceholder: "What would you like to alter?",
      refineApply: "Apply Refinement",
      refineCancel: "Cancel",
      refining: "Refining...",
      emptyTitle: "No prompts generated yet",
      emptySub: "Upload an image or describe your scene idea to generate V1, V2, V3, V4, V5, and V6 prompts.",
      loadingTitle: "Synthesizing Optical Engines",
      loadingSub: "Synthesizing V1, V2, V3, V4, V5, and V6 photographic engines...",
      loadingSteps: [
        "Analyzing Scene Geometry & Spatial Graph",
        "Extracting Optical Physics & Light Propagation",
        "Resolving Biomechanical Pose & Joints",
        "Constructing V1 Smart Natural Snapshot",
        "Generating V2 Structured Modular Realism",
        "Finalizing V3 Forensic Deep Prompt"
      ],
      snapshotSaved: "Snapshot"
    },
    history: {
      title: "Prompt History",
      empty: "No saved history yet.",
      clearAll: "Clear All",
      restore: "Restore",
      delete: "Delete",
      close: "Close",
      imageRef: "Image Ref",
      idea: "Idea"
    },
    presets: {
      title: "Photography Presets",
      apply: "Apply",
      saveCurrent: "Save Current Configuration",
      saveBtn: "Save",
      presetNamePlaceholder: "Preset name...",
      delete: "Delete",
      savedAlert: "Preset saved successfully!",
      defaultBadge: "Default",
      defaults: {
        rawIphone: "RAW iPhone Snapshot",
        rawIphoneDesc: "Ultra-authentic handheld smartphone capture with natural flaws.",
        nightFlash: "Night Direct Flash",
        nightFlashDesc: "Direct on-camera phone flash at night, fast falloff and dark background.",
        casualCandid: "Casual Candid",
        casualCandidDesc: "Unposed everyday moment, neutral grading, unstaged geometry.",
        deepDof: "Deep Depth of Field",
        deepDofDesc: "Sharp foreground to background, no artificial blur or portrait cutout.",
        pov: "First-Person POV",
        povDesc: "Over-the-shoulder or hands visible, direct realistic interaction.",
        automotive: "Automotive Forensic",
        automotiveDesc: "High fidelity car geometry, accurate reflections and textures."
      }
    },
    errors: {
      noInput: "Please provide either an image reference or describe your scene idea.",
      failed: "Analysis failed. Please check your network or try again.",
      missingKey: "API Key is required to process requests."
    }
  },
  es: {
    branding: {
      title: "Perfectly,",
      accent: "imperfect.",
      subtitle: "Motor Forense Óptico",
      edition: "EDICIÓN PRO",
      status: "Sistema Online",
      footer: "PERFECTLY, IMPERFECT. — MOTOR FORENSE ÓPTICO V1 / V2 / V3 / V4 / V5 / V6"
    },
    nav: {
      fromImage: "Desde Imagen",
      fromIdea: "Desde Idea",
      simpleMode: "Simple",
      advancedMode: "Avanzado",
      history: "Historial",
      presets: "Ajustes",
      themeDark: "Modo Oscuro",
      themeLight: "Modo Claro",
      promptLang: "Idioma del Prompt",
      promptLangAuto: "Auto"
    },
    modalities: {
      typeLabel: "Tipo:",
      person: "Persona",
      object_pov: "Objeto / POV",
      scene: "Escena",
      vehicle: "Vehículo",
      product: "Producto",
      interior: "Interior",
      architecture: "Arquitectura",
      edit_prompt: "Editar Prompt Existente"
    },
    upload: {
      title: "Subir Referencia",
      dragDrop: "Arrastra y suelta o haz clic para subir múltiples fotos",
      maxSize: "JPG, PNG, WebP hasta 15MB",
      addMore: "Añadir Referencia",
      referenceList: "Referencias",
      primaryRef: "Referencia Principal",
      refNumber: "Ref",
      role: "Función",
      roles: {
        identity: "Identidad",
        face: "Rostro",
        outfit: "Vestimenta",
        pose: "Pose",
        location: "Ubicación",
        vehicle: "Vehículo",
        lighting: "Iluminación",
        style: "Estilo",
        object: "Objeto",
        full_image: "Imagen Completa"
      },
      assignment: "Asignación de Sujeto",
      assignmentOptions: {
        general: "Escena General",
        subjectA: "Sujeto A",
        subjectB: "Sujeto B"
      },
      directivesLabel: "Directivas Opcionales para la Referencia",
      directivesPlaceholder: "ej: priorizar pose e iluminación, conservar caída exacta de ropa, cambiar modelo de auto...",
      remove: "Eliminar",
      replace: "Cambiar"
    },
    idea: {
      placeholder: "Describe la imagen que deseas crear (ej: apoyado en una 4x4 en Los Ángeles a las 18:30, distraído, usando puffer blanca, lamborghini revuelto detrás, foto lejana con flash de teléfono)...",
      magicEnhance: "Magic Enhance",
      magicEnhancing: "Mejorando...",
      magicHint: "Enriquece el contexto óptico y físico sin alterar los hechos explícitos.",
      suggestionsTitle: "Inicios Contextuales Rápidos:",
      charCount: "caracteres",
      examples: [
        "apoyado en una 4x4 en los ángeles a las 18:30, distraído, usando puffer blanca, lamborghini revuelto detrás, foto lejana con flash de teléfono",
        "hombre sentado relajado en un sofá de cuero de noche mirando hacia otro lado, iluminación cálida de lámpara, captura espontánea con móvil",
        "golfista en el tope del backswing en una calle soleada, profundidad de campo nítida, tensión atlética auténtica, color neutro de cámara",
        "pov de conductor dentro de un auto deportivo clásico durante la hora azul, manos reposadas suavemente en el volante, gotas de lluvia en el parabrisas"
      ]
    },
    simple: {
      opticalSystem: "Sistema Óptico",
      aspectRatio: "Relación de Aspecto",
      photoStyle: "Estilo Fotográfico",
      realism: "Prioridad de Realismo",
      balanced: "Equilibrado",
      forensic100: "Forense Óptico (100%)",
      generate: "Generar Prompts",
      analyzing: "Analizando Óptica...",
      generating: "Construyendo Blueprint...",
      modeHint: "Parámetros ópticos esenciales",
      captureProfile: "Perfil de Captura",
      outputFormat: "Formato de Salida",
      searchCamera: "Buscar cámara...",
      searchType: "Buscar tipo...",
      openLibrary: "Abrir Biblioteca",
      recent: "Recientes",
      favorites: "Favoritos"
    },
    advanced: {
      autoDetectTitle: "Auto Detect",
      autoDetectSub: "Analiza el contexto para sugerir parámetros ópticos y físicos precisos",
      autoDetectOn: "Activo",
      autoDetectOff: "Manual",
      detectedTitle: "Contexto Detectado (Haz clic para editar):",
      modeHint: "Controles forenses de escena",
      sections: {
        subject: "Sujeto y Anatomía",
        pose: "Pose y Postura",
        action: "Acción y Contexto",
        camera: "Cámara y Óptica",
        composition: "Composición y Encuadre",
        light: "Luz y Atmósfera",
        sliders: "Realismo y Calibración",
        imperfections: "Imperfecciones Forenses",
        wardrobe: "Vestimenta y Materiales",
        vehicle: "Forense de Vehículos",
        environment: "Ambiente y Espacio",
        priority: "Prioridad de Referencia",
        fineControl: "Instrucciones de Precisión",
        pov: "POV Primera Persona y Manos",
        realismAndCleanup: "Nivel de Realismo y Filtro Anti-IA",
        preserveLocks: "Bloqueos de Sujeto y Entorno"
      },
      subject: {
        count: "Número de Sujetos",
        height: "Estatura / Altura",
        bodyPosition: "Posición Corporal",
        orientation: "Orientación",
        weightDistribution: "Distribución de Peso"
      },
      posture: {
        label: "Estado de Postura",
        custom: "Detalles Específicos de Postura",
        expression: "Expresión Facial",
        gaze: "Dirección de la Mirada"
      },
      action: {
        label: "Describir Acción...",
        placeholder: "ej: apoyado en la aleta del auto, una mano en el bolsillo, mirando hacia la calle..."
      },
      camera: {
        device: "Tipo de Dispositivo",
        lens: "Distancia Focal del Lente",
        distance: "Distancia de la Cámara",
        height: "Altura de la Cámara",
        angle: "Ángulo de la Cámara",
        framing: "Encuadre"
      },
      light: {
        time: "Momento del Día",
        source: "Fuente Principal de Luz",
        flash: "Modo de Flash",
        flashBehavior: "Comportamiento del Flash"
      },
      sliders: {
        realism: "Realismo Crudo",
        imperfection: "Imperfección Óptica",
        cinematic: "Grado Cinematográfico",
        cinematicNote: "(Predeterminado: Bajo para Realismo Snapshot)",
        stylization: "Estilización",
        backgroundDetail: "Detalle de Fondo",
        blur: "Desenfoque Óptico / Bokeh"
      },
      imperfections: {
        motionBlur: "Desenfoque de Movimiento",
        slightFocusMiss: "Ligero Error de Enfoque",
        digitalNoise: "Ruido Digital de Sensor",
        flashBlowout: "Quemado Directo de Flash",
        whiteBalanceShift: "Desvío de Balance de Blancos",
        compression: "Artefactos de Compresión",
        lensSmudge: "Destello / Mancha en el Lente",
        minorCameraShake: "Micro-temblor de Mano"
      },
      wardrobe: {
        top: "Parte Superior",
        bottom: "Parte Inferior / Pantalones",
        shoes: "Calzado",
        outerwear: "Abrigo / Chaqueta",
        accessories: "Accesorios",
        headwear: "Gorra / Sombrero",
        jewelryWatch: "Reloj / Joyería",
        customDetails: "Detalles Específicos de Tela",
        referenceLock: "Bloqueo Estricto de Vestimenta",
        topPlaceholder: "ej: chaqueta puffer blanca gruesa con costuras anchas",
        bottomPlaceholder: "ej: pantalones vaqueros oscuros y holgados"
      },
      vehicle: {
        vehicleText: "Marca, Modelo y Año Aproximado del Vehículo",
        placeholder: "ej: SUV 4x4 + Lamborghini Revuelto al fondo",
        modelLock: "Bloqueo Estricto de Modelo",
        exteriorColor: "Color / Acabado Exterior",
        interiorColor: "Tapicería Interior",
        driverPassenger: "Posición en el Asiento",
        doorState: "Estado de la Puerta",
        subjectRelation: "Relación del Sujeto con el Vehículo"
      },
      environment: {
        location: "Ubicación / Ciudad",
        locationPlaceholder: "ej: entrada de residencia en Los Ángeles",
        setting: "Entorno / Contexto",
        background: "Elementos de Fondo",
        timeOfDay: "Hora Exacta",
        timePlaceholder: "ej: atardecer 18:30",
        weather: "Condiciones Climáticas",
        crowd: "Gente / Multitud",
        naturalClutter: "Desorden Cotidiano Natural",
        mood: "Nivel Atmosférico",
        avoidPostcard: "Evitar Apariencia Postal",
        avoidGenericLuxury: "Evitar Lujo Genérico"
      },
      priority: {
        label: "Prioridad de Referencia",
        loose: "Flexible (Libertad creativa)",
        balanced: "Equilibrada (Alineación natural)",
        strong: "Fuerte (Detalles fieles)",
        absolute: "Absoluta (Bloqueo forense)"
      },
      fineControl: {
        subject: "Reemplazo de Sujeto",
        action: "Acción Específica",
        location: "Reemplazo de Ubicación",
        environment: "Detalles del Entorno",
        background: "Estructura de Fondo",
        atmosphere: "Atmósfera y Clima",
        imperfections: "Notas de Imperfección",
        purpose: "Propósito de la Imagen",
        referenceUse: "Uso de la Referencia",
        textInsideImage: "Texto Visible en Imagen",
        avoid: "Negativo / Evitar",
        avoidPlaceholder: "ej: sin piel plástica, sin apariencia CGI de estudio, sin halo artificial de HDR",
        additionalInstructions: "Directivas Precisas Adicionales",
        instructionsPlaceholder: "Directivas finales exactas para el blueprint óptico..."
      },
      pov: {
        handVisibility: "Manos en el Encuadre",
        gripType: "Agarre y Contacto",
        heldObject: "Objeto Sostenido / Interactuado",
        heldObjectPlaceholder: "ej. taza de café, volante, copa de cóctel, teléfono, reloj",
        pointOfViewHeight: "Altura del Punto de Vista (POV)",
        surface: "Superficie / Plano de Contacto",
        objectRealism: "Estado de Realismo del Objeto"
      },
      realismAndCleanup: {
        realismTier: "Nivel de Realismo",
        aiCleanup: "Supresión de Artefactos de IA",
        aiCleanupHint: "Un mayor nivel impone restricciones físicas y ópticas más estrictas contra el aspecto artificial de IA."
      },
      preserveLocks: {
        title: "Preservar Atributos de Referencia (Locks)",
        sub: "Selecciona qué elementos de las imágenes de referencia deben conservarse estrictamente."
      }
    },
    options: {
      subjectCount: {
        auto: "Auto Detect",
        solo: "1 Persona (Solo)",
        dupla: "2 Personas (Dupla)",
        three: "3 Personas",
        group: "Grupo"
      },
      bodyPosition: {
        auto: "Auto",
        standing: "De pie",
        sitting: "Sentado / En reposo",
        leaning: "Apoyado",
        walking: "Caminando",
        crouching: "Agachado",
        lying: "Acostado",
        mid_action: "En plena acción"
      },
      orientation: {
        auto: "Auto",
        front: "De frente",
        threeQuarter: "Perfil 3/4",
        side: "Perfil lateral",
        rearThreeQuarter: "3/4 posterior",
        back: "De espaldas"
      },
      weightDistribution: {
        auto: "Auto",
        balanced: "Equilibrado al centro",
        left: "Pierna / Cadera izquierda",
        right: "Pierna / Cadera derecha",
        dynamic: "Dinámico atlético"
      },
      posture: {
        auto: "Auto Contextual",
        relaxed: "Relajado",
        distracted: "Distraído / Espontáneo",
        casual: "Casual",
        leaning: "Apoyado en superficie",
        slouched: "Encorvado",
        upright: "Erguido / Formal",
        walking: "A mitad de paso / Caminando",
        running: "Dinámico atlético"
      },
      gaze: {
        auto: "Auto",
        away_from_camera: "Mirando fuera de cámara",
        at_camera: "Directo a la cámara",
        down: "Mirando hacia abajo",
        up: "Mirando hacia arriba",
        left: "Mirando hacia la izquierda",
        right: "Mirando hacia la derecha",
        at_object: "Mirando un objeto en mano",
        at_another_person: "Mirando a otra persona"
      },
      cameraDevice: {
        auto: "Coincidencia automática de dispositivo",
        iphone_rear: "iPhone Cámara Trasera 1x (Snapshot estándar)",
        iphone_front: "iPhone Cámara Frontal (Selfie)",
        smartphone_rear: "Smartphone Genérico Trasero",
        professional_camera: "DSLR Profesional Full-Frame"
      },
      cameraLens: {
        auto: "Auto (24-26mm estándar)",
        ultraWide: "0.5x (Ultra Gran Angular ~13mm)",
        wide: "1x (Gran Angular ~24-26mm)",
        standard: "2x (Estándar ~48-52mm)",
        telephoto: "3x (Teleobjetivo ~77-85mm)",
        prime35: "Lente Fijo 35mm",
        prime50: "Lente Fijo 50mm"
      },
      cameraDistance: {
        auto: "Auto",
        very_close: "Muy cerca",
        close: "Cerca",
        medium: "Medio",
        far: "Lejos (Ambiental)",
        very_far: "Muy lejos"
      },
      cameraHeight: {
        auto: "Auto",
        ground: "A ras del suelo",
        waist: "A la altura de la cintura",
        chest: "A la altura del pecho",
        eye: "A la altura de los ojos",
        above_eye: "Por encima de los ojos",
        high: "Ángulo picado / Alto"
      },
      cameraFraming: {
        auto: "Auto",
        close_up: "Primer plano",
        chest: "Plano medio corto (pecho)",
        waist: "Plano medio (cintura)",
        threeQuarter: "Plano 3/4 (americano)",
        full_body: "Cuerpo entero",
        wide_environmental: "Plano general amplio"
      },
      lightTime: {
        auto: "Auto",
        morning: "Luz suave de la mañana",
        midday: "Sol directo del mediodía",
        afternoon: "Tarde avanzada",
        sunset: "Puesta de sol / Hora dorada",
        blue_hour: "Hora azul (Atardecer 18:30-19:30)",
        night: "Noche",
        late_night: "Madrugada profunda"
      },
      lightSource: {
        auto: "Auto",
        natural: "Solo ambiente natural",
        phone_flash: "Flash directo de móvil",
        streetlight: "Farola superior de calle",
        window: "Luz de ventana diurna",
        lamp: "Lámpara cálida de interior",
        mixed_light: "Mezcla de ambiente y flash",
        no_artificial: "Sin relleno artificial"
      },
      flashBehavior: {
        normal: "Flash de móvil normal natural",
        hard_direct: "Frontal directo duro (Snapshot crudo)",
        slight_blowout: "Ligero quemado en primer plano",
        natural_falloff: "Caída natural (Fondo lejano oscuro)",
        strong: "Ráfaga intensa"
      },
      subjectRelation: {
        leaning_against: "Apoyado en el vehículo",
        standing_near: "De pie junto al vehículo",
        inside: "Sentado en el interior",
        driving: "Conduciendo",
        entering: "Entrando",
        exiting: "Saliendo",
        sitting_on: "Sentado en el capó/maletero"
      },
      photoStyles: {
        auto: "Coincidencia fotográfica automática",
        casual_smartphone: "Smartphone Casual RAW",
        pov: "Punto de Vista en Primera Persona (POV)",
        candid: "Espontáneo sin pose",
        street_photography: "Fotografía Callejera",
        social_media_ugc: "Contenido UGC Redes Sociales",
        night_photography: "Fotografía Nocturna con Flash",
        portrait: "Retrato con Lente Fijo",
        editorial: "Editorial de Revista",
        fashion: "Alta Moda Estudio/Calle",
        luxury_lifestyle: "Estilo de Vida de Lujo (Realista)",
        automotive: "Forense Automotriz",
        product_photography: "Producto Táctil",
        architecture: "Óptica Arquitectónica",
        disposable_camera: "Cámara Desechable con Flash",
        film35mm: "Película Analógica 35mm",
        polaroid: "Polaroid Instantánea"
      },
      povHandVisibility: {
        auto: "Automático (Contextual)",
        one_hand: "Una Mano Visible",
        both_hands: "Ambas Manos Visibles",
        no_hands: "Sin Manos (POV Ocular Puro)"
      },
      povGripType: {
        auto: "Automático (Natural)",
        holding_object: "Sosteniendo Objeto con Firmeza",
        resting_on_surface: "Apoyadas sobre Superficie",
        touching_screen: "Tocando Pantalla o Controles",
        steering: "Manos al Volante",
        drinking_eating: "Llevando a la Boca / Bebiendo"
      },
      povHeight: {
        auto: "Automático (Contextual)",
        eye_level: "Nivel de Ojos",
        chest_level: "Nivel de Pecho",
        tabletop_lookdown: "Picado hacia Mesa (Desde Arriba)"
      },
      captureProfiles: {
        auto: "Automático (Contextual)",
        raw_smartphone: "Smartphone RAW",
        clean_smartphone: "Smartphone Limpio",
        night_flash: "Flash Nocturno",
        low_light: "Baja Iluminación",
        candid: "Candid Espontáneo",
        social_media: "Redes Sociales UGC",
        pov: "POV Primera Persona",
        mirror: "Reflejo en Espejo",
        selfie: "Selfie Frontal",
        documentary: "Instantánea Documental",
        automotive_casual: "Automotriz Casual",
        object_pov_raw: "Objeto / POV RAW"
      },
      captureProfileDescriptions: {
        auto: "Coincidencia forense contextual según sujeto y entorno",
        raw_smartphone: "Foto casual de celular, procesamiento natural, pequeñas imperfecciones",
        clean_smartphone: "Smartphone nítido y limpio sin apariencia profesional artificial",
        night_flash: "Flash directo de celular, fondo oscuro, sombras marcadas y rápida caída de luz",
        low_light: "Ruido digital realista, exposición automática y foco orgánico",
        candid: "Momento espontáneo, encuadre imperfecto, sin pose forzada",
        social_media: "Foto natural apropiada para redes sociales, sin apariencia publicitaria",
        pov: "Perspectiva realista en primera persona a la altura de ojos o pecho",
        mirror: "Comportamiento realista de foto frente al espejo",
        selfie: "Perspectiva frontal genuina de smartphone",
        documentary: "Registro cotidiano realista sin etalonaje cinematográfico",
        automotive_casual: "Foto de auto capturada con móvil, sin apariencia de comercial",
        object_pov_raw: "Objetos fotografiados de forma casual con contexto real alrededor"
      },
      cameraModes: {
        auto: "Automático",
        rear_main: "Cámara Trasera Principal",
        rear_ultrawide: "Trasera 0.5x Ultra Gran Angular",
        rear_1x: "Trasera 1x Principal",
        rear_2x: "Trasera 2x",
        rear_3x: "Trasera 3x",
        rear_telephoto: "Trasera Teleobjetivo",
        front_camera: "Cámara Frontal",
        mirror_selfie: "Selfie en Espejo",
        handheld_pov: "POV en Mano",
        chest_pov: "POV a Altura de Pecho",
        overhead: "Cenital / Desde Arriba",
        low_angle: "Contrapicado de Celular"
      },
      cameraFeels: {
        auto: "Automático",
        very_raw: "Muy RAW",
        casual: "Casual",
        clean: "Limpio",
        slightly_shaky: "Ligeramente Movido",
        quick_snapshot: "Instantánea Rápida",
        distracted_capture: "Captura Distraída",
        social_media: "Redes Sociales",
        low_light: "Baja Iluminación",
        direct_flash: "Flash Directo",
        older_phone_look: "Aspecto de Teléfono Antiguo"
      },
      surfaces: {
        auto: "Automático (Natural)",
        wood_table: "Mesa de Madera",
        glass_table: "Mesa de Vidrio",
        stone: "Piedra",
        concrete: "Concreto / Cemento",
        car_hood: "Capó de Auto",
        car_interior: "Interior de Auto",
        leather: "Cuero",
        fabric: "Tela / Textil",
        bed: "Cama",
        floor: "Suelo / Piso",
        counter: "Mostrador / Encimera",
        desk: "Escritorio",
        metal: "Metal",
        asphalt: "Asfalto",
        grass: "Césped",
        sand: "Arena",
        custom: "Superficie Personalizada"
      },
      environmentConditions: {
        auto: "Automático (Contextual)",
        very_clean: "Muy Limpio",
        normal: "Normal",
        lived_in: "Habitado / Cotidiano",
        slightly_messy: "Ligeramente Desordenado",
        messy: "Desordenado",
        raw: "Crudo / Rústico",
        dusty: "Polvoriento",
        used: "Usado",
        wet: "Mojado / Húmedo",
        dry: "Seco"
      },
      objectRealism: {
        clean_product: "Producto Limpio",
        natural: "Natural",
        used: "Usado",
        very_used: "Muy Usado",
        imperfect: "Imperfecto (Polvo y Marcas)",
        raw: "Crudo y Desgastado"
      },
      actionMoments: {
        auto: "Automático",
        static: "Estático / En Reposo",
        before_action: "Antes de la Acción",
        mid_action: "En Plena Acción",
        impact_moment: "Momento de Impacto",
        immediately_after: "Inmediatamente Después",
        walking: "Caminando",
        turning: "Girando / Volteando",
        sitting_down: "Sentándose",
        standing_up: "Poniéndose de Pie",
        reaching: "Alcanzando",
        holding: "Sosteniendo",
        using_object: "Usando un Objeto",
        distracted: "Distraído",
        waiting: "Esperando",
        talking: "Hablando",
        laughing: "Riendo",
        eating: "Comiendo",
        drinking: "Bebiendo",
        smoking: "Fumando",
        driving: "Conduciendo",
        custom: "Acción Personalizada"
      },
      flashes: {
        auto: "Automático",
        off: "Apagado",
        on: "Encendido",
        direct: "Flash Directo",
        hard_direct: "Flash Duro Directo",
        strong: "Flash Fuerte",
        slight_blowout: "Ligero Quemado de Luz",
        heavy_blowout: "Quemado Intenso de Luz",
        close_range_flash: "Flash de Corta Distancia",
        night_flash: "Flash Nocturno"
      },
      imperfectionsList: {
        motion_blur_slight: "Desenfoque de Movimiento Leve",
        motion_blur_medium: "Desenfoque de Movimiento Medio",
        motion_blur_strong: "Desenfoque de Movimiento Fuerte",
        focus_miss_small: "Ligero Fallo de Foco",
        soft_focus: "Foco Suave",
        digital_noise: "Ruido Digital de Sensor",
        high_iso_noise: "Grano de Alto ISO",
        flash_blowout: "Quemado por Flash",
        white_balance_error: "Error de Balance de Blancos",
        compression: "Compresión Móvil",
        lens_smudge: "Huella / Mancha en la Lente",
        finger_near_lens: "Dedo Cerca del Borde del Lente",
        minor_camera_shake: "Vibración Menor de Cámara",
        crooked_horizon: "Horizonte Ligeramente Torcido",
        slight_underexposure: "Ligera Subexposición",
        slight_overexposure: "Ligera Sobreexposición"
      },
      locks: {
        face: "Rostro",
        hair: "Cabello",
        skinTone: "Tono de Piel",
        body: "Cuerpo",
        height: "Estatura",
        outfit: "Vestimenta",
        accessories: "Accesorios",
        pose: "Postura",
        vehicle: "Vehículo",
        object: "Objeto",
        environment: "Entorno",
        camera: "Cámara",
        lighting: "Iluminación"
      },
      outputFormats: {
        auto: "Automático (Original)",
        ig_portrait: "Instagram Feed Retrato (4:5)",
        ig_square: "Instagram Feed Cuadrado (1:1)",
        ig_story: "Instagram Story (9:16)",
        ig_reel: "Instagram Reel (9:16)",
        tiktok: "TikTok (9:16)",
        youtube_thumb: "Miniatura YouTube (16:9)",
        youtube_shorts: "YouTube Shorts (9:16)",
        facebook_feed: "Facebook Feed (4:5)",
        facebook_story: "Facebook Story (9:16)",
        x_post: "Publicación X (16:9)",
        linkedin_post: "Publicación LinkedIn (1:1)",
        pinterest_pin: "Pin de Pinterest (2:3)",
        whatsapp_status: "Estado de WhatsApp (9:16)",
        telegram_story: "Historia de Telegram (9:16)",
        mobile_wallpaper: "Fondo de Pantalla Móvil (9:16)",
        desktop_wallpaper: "Fondo de Escritorio (16:9)",
        website_hero: "Banner Web Hero (21:9)",
        ecommerce_product: "Producto E-commerce (1:1)",
        custom: "Formato Personalizado"
      },
      typeCategories: {
        all: "Todos",
        people: "Personas",
        object_pov: "Objeto / POV",
        vehicles: "Vehículos",
        environments: "Entornos",
        architecture: "Arquitectura",
        product: "Producto",
        tools: "Herramientas de Prompt"
      },
      cameraCategories: {
        all: "Todas las Cámaras",
        iphone: "Apple iPhone",
        samsung: "Samsung Galaxy",
        pixel: "Google Pixel",
        other: "Otros Smartphones"
      },
      typesList: {
        person: "Persona (General)",
        solo_person: "Persona Sola",
        duo_people: "Dúo / Dos Personas",
        group_people: "Grupo",
        couple: "Pareja",
        selfie: "Selfie",
        mirror_selfie: "Selfie en Espejo",
        full_body: "Cuerpo Completo",
        half_body: "Medio Cuerpo",
        portrait: "Retrato",
        candid_person: "Persona Espontánea",
        person_walking: "Persona Caminando",
        person_sitting: "Persona Sentada",
        person_leaning: "Persona Apoyada",
        person_in_car: "Persona en el Auto",
        person_with_vehicle: "Persona con Vehículo",
        person_with_object: "Persona con Objeto",
        outfit_fashion: "Outfit / Moda",
        lifestyle_person: "Estilo de Vida",
        sport_action: "Deporte / Acción",
        object_pov: "Objeto / POV",
        object_close_up: "Primer Plano de Objeto",
        handheld_object: "Objeto Sostenido",
        object_on_table: "Objeto sobre Mesa",
        object_in_hand: "Objeto en la Mano",
        desk_pov: "POV Escritorio",
        food_pov: "POV Comida",
        table_food: "Mesa / Comida",
        luxury_objects: "Objetos de Lujo",
        watch_jewelry_pov: "POV Reloj / Joyería",
        phone_tech_pov: "POV Celular / Tecnología",
        bag_accessory_pov: "POV Bolso / Accesorio",
        sneaker_pov: "POV Zapatillas / Tenis",
        car_hood_pov: "POV Capó de Auto",
        car_interior_pov: "POV Interior de Auto",
        driver_pov: "POV Conductor",
        passenger_pov: "POV Pasajero",
        garage_pov: "POV Garaje",
        room_pov: "POV Habitación",
        bed_pov: "POV Cama",
        balcony_pov: "POV Balcón",
        street_pov: "POV Calle",
        vehicle: "Vehículo",
        car_exterior: "Exterior de Auto",
        car_interior: "Interior de Auto",
        driver_seat: "Asiento del Conductor",
        passenger_seat: "Asiento del Pasajero",
        open_door: "Puerta Abierta",
        entering_car: "Entrando al Auto",
        exiting_car: "Saliendo del Auto",
        leaning_against_car: "Apoyado contra el Auto",
        car_plus_person: "Auto + Persona",
        supercar: "Superdeportivo",
        suv_4x4: "SUV / Camioneta 4x4",
        sedan: "Sedán",
        sports_car: "Auto Deportivo",
        classic_car: "Auto Clásico",
        motorcycle: "Motocicleta",
        off_road: "Todo Terreno",
        garage_vehicle: "Garaje",
        driveway: "Entrada de Garaje",
        parking_lot: "Estacionamiento",
        scene: "Escena",
        interior: "Interior",
        exterior: "Exterior",
        home_interior: "Interior de Hogar",
        living_room: "Sala de Estar",
        bedroom: "Dormitorio",
        kitchen: "Cocina",
        office: "Oficina",
        garage_env: "Garaje",
        balcony_env: "Balcón",
        rooftop: "Azotea",
        restaurant: "Restaurante",
        cafe: "Cafetería",
        hotel: "Hotel",
        airport: "Aeropuerto",
        hangar: "Hangar",
        street: "Calle",
        residential_street: "Calle Residencial",
        city_night: "Ciudad de Noche",
        rural: "Rural / Campo",
        ranch: "Rancho / Finca",
        beach: "Playa",
        marina: "Marina / Puerto",
        golf_course: "Campo de Golf",
        sports_location: "Ubicación Deportiva",
        architecture: "Arquitectura",
        real_estate: "Bienes Raíces",
        house_exterior: "Exterior de Casa",
        house_interior: "Interior de Casa",
        apartment: "Apartamento",
        luxury_home: "Casa de Lujo",
        ordinary_home: "Casa Común",
        room_arch: "Habitación",
        lobby: "Vestíbulo / Lobby",
        pool_area: "Área de Piscina",
        garden: "Jardín",
        commercial_interior: "Interior Comercial",
        building_exterior: "Exterior de Edificio",
        product: "Producto",
        product_close_up: "Primer Plano de Producto",
        product_in_use: "Producto en Uso",
        product_on_table: "Producto sobre Mesa",
        packaging: "Empaque / Packaging",
        watch: "Reloj",
        jewelry: "Joyería",
        perfume: "Perfume",
        shoes: "Calzado / Zapatos",
        clothing_item: "Prenda de Vestir",
        tech_product: "Producto Tecnológico",
        food_product: "Producto Gastronómico",
        automotive_detail: "Detalle Automotriz",
        edit_existing_prompt: "Editar Prompt Existente",
        fix_realism: "Corregir Realismo",
        expand_prompt: "Expandir Prompt",
        rewrite_prompt: "Reescribir Prompt",
        idea_to_prompt: "De Idea a Prompt",
        reference_to_prompt: "De Referencia a Prompt",
        change_only: "Cambiar Solo Un Elemento",
        diagnose_fake_result: "Diagnosticar Resultado Artificial",
        rebuild_scene: "Reconstruir Escena"
      }
    },
    output: {
      v1Tab: "V1 Smart",
      v2Tab: "V2 Estructurado",
      v3Tab: "V3 Forense",
      compareTab: "Comparar",
      v1Title: "V1 — Instantánea Natural Inteligente",
      v1Sub: "Prompt compacto de smartphone con física resuelta",
      v2Title: "V2 — Reconstrucción Fotográfica Estructurada",
      v2Sub: "Reconstrucción fotográfica estructurada con lógica física de escena",
      v3Title: "V3 — Prompt Forense Profundo",
      v3Sub: "Reconstrucción física profunda en formato directo con llaves {}",
      compare: "Comparar Todos",
      copy: "Copiar",
      copied: "¡Copiado!",
      save: "Guardar en Ajustes",
      refine: "Refinar",
      refineTooltip: "Refinar elemento específico sin regenerar toda la escena",
      copyAll: "Copiar los 3 Prompts",
      copiedAll: "¡Los 3 Prompts Fueron Copiados!",
      copyNegative: "Copiar Negativo",
      negativePromptTitle: "Prompt Negativo (Filtro Anti-Artefactos)",
      statsCharacters: "Caract.",
      statsWords: "Palabras",
      statsTokens: "Tokens",
      refinePromptTitle: "Refinar Prompt",
      refinePromptSub: "Especifica únicamente la alteración exacta (ej: 'cambiar chaqueta a bomber negra', 'remover el auto'). La composición y geometría se mantendrán intactas.",
      refineInputPlaceholder: "¿Qué deseas alterar con exactitud?",
      refineApply: "Aplicar Ajuste",
      refineCancel: "Cancelar",
      refining: "Refinando...",
      emptyTitle: "No hay prompts generados aún",
      emptySub: "Sube una imagen de referencia o describe tu idea para generar los prompts V1, V2, V3, V4, V5 y V6.",
      loadingTitle: "Sintetizando Motores Ópticos",
      loadingSub: "Sintetizando motores fotográficos V1, V2, V3, V4, V5 y V6...",
      loadingSteps: [
        "Analizando Geometría de Escena y Grafo Espacial",
        "Extrayendo Física Óptica y Propagación de Luz",
        "Resolviendo Articulaciones y Biomecánica de Pose",
        "Construyendo V1 Instantánea Natural Inteligente",
        "Generando V2 Realismo Modular Estructurado",
        "Finalizando V3 Prompt Forense Profundo"
      ],
      snapshotSaved: "Snapshot"
    },
    history: {
      title: "Historial de Prompts",
      empty: "No hay historial guardado aún.",
      clearAll: "Borrar Todo",
      restore: "Restaurar",
      delete: "Eliminar",
      close: "Cerrar",
      imageRef: "Ref Imagen",
      idea: "Idea"
    },
    presets: {
      title: "Ajustes Fotográficos",
      apply: "Aplicar",
      saveCurrent: "Guardar Configuración Actual",
      saveBtn: "Guardar",
      presetNamePlaceholder: "Nombre del ajuste...",
      delete: "Eliminar",
      savedAlert: "¡Ajuste guardado con éxito!",
      defaultBadge: "Predeterminado",
      defaults: {
        rawIphone: "Instantánea RAW iPhone",
        rawIphoneDesc: "Captura ultra auténtica de smartphone con fallas naturales.",
        nightFlash: "Flash Directo Nocturno",
        nightFlashDesc: "Flash frontal directo de noche, caída rápida y fondo oscuro.",
        casualCandid: "Casual Espontáneo",
        casualCandidDesc: "Momento cotidiano sin pose, gradación neutra y geometría natural.",
        deepDof: "Profundidad de Campo Profunda",
        deepDofDesc: "Nitidez de primer plano a fondo, sin desenfoque artificial de retrato.",
        pov: "Punto de Vista en Primera Persona",
        povDesc: "Perspectiva sobre el hombro o manos visibles con interacción real.",
        automotive: "Forense Automotriz",
        automotiveDesc: "Geometría exacta del vehículo, pintura auténtica y reflejos plausibles."
      }
    },
    errors: {
      noInput: "Por favor proporciona una imagen de referencia o describe tu idea.",
      failed: "Error en el análisis. Por favor intenta nuevamente.",
      missingKey: "Se requiere la configuración de API Key."
    }
  },
  pt: {
    branding: {
      title: "Perfectly,",
      accent: "imperfect.",
      subtitle: "Motor Óptico Forense",
      edition: "EDIÇÃO PRO",
      status: "Sistema Online",
      footer: "PERFECTLY, IMPERFECT. — MOTOR ÓPTICO FORENSE V1 / V2 / V3 / V4 / V5 / V6"
    },
    nav: {
      fromImage: "Da Imagem",
      fromIdea: "Da Ideia",
      simpleMode: "Simples",
      advancedMode: "Avançado",
      history: "Histórico",
      presets: "Predefinições",
      themeDark: "Modo Escuro",
      themeLight: "Modo Claro",
      promptLang: "Idioma do Prompt",
      promptLangAuto: "Auto"
    },
    modalities: {
      typeLabel: "Tipo:",
      person: "Pessoa",
      object_pov: "Objeto / POV",
      scene: "Cena",
      vehicle: "Veículo",
      product: "Produto",
      interior: "Interior",
      architecture: "Arquitetura",
      edit_prompt: "Editar Prompt Existente"
    },
    upload: {
      title: "Enviar Referência",
      dragDrop: "Arraste e solte ou clique para enviar fotos",
      maxSize: "JPG, PNG, WebP até 15MB",
      addMore: "Adicionar Referência",
      referenceList: "Referências",
      primaryRef: "Referência Principal",
      refNumber: "Ref",
      role: "Papel",
      roles: {
        identity: "Identidade",
        face: "Rosto",
        outfit: "Roupa",
        pose: "Pose",
        location: "Local",
        vehicle: "Veículo",
        lighting: "Iluminação",
        style: "Estilo",
        object: "Objeto",
        full_image: "Imagem Completa"
      },
      assignment: "Atribuição de Sujeito",
      assignmentOptions: {
        general: "Cena Geral",
        subjectA: "Sujeito A",
        subjectB: "Sujeito B"
      },
      directivesLabel: "Diretivas Opcionais para a Referência",
      directivesPlaceholder: "ex: priorizar pose e iluminação, manter caimento exato do tecido, trocar modelo do carro se necessário...",
      remove: "Remover",
      replace: "Substituir"
    },
    idea: {
      placeholder: "Descreva a imagem que você deseja criar (ex: eu encostado numa 4x4 em Los Angeles às 18:30, distraído, usando puffer branca, lamborghini revuelto atrás, foto distante com flash de celular)...",
      magicEnhance: "Magic Enhance",
      magicEnhancing: "Refinando...",
      magicHint: "Enriquece o contexto óptico e físico sem alterar seus fatos explícitos.",
      suggestionsTitle: "Inícios Contextuais Rápidos:",
      charCount: "caracteres",
      examples: [
        "eu encostado numa 4x4 em los angeles às 18:30, distraído, usando puffer branca, lamborghini revuelto atrás, foto distante com flash de iphone",
        "homem sentado relaxado em um sofá de couro à noite olhando para o lado, iluminação quente de abajur, instantâneo casual de celular",
        "golfista no topo do backswing em fairway ensolarado, profundidade de campo nítida, tensão atlética autêntica, gradação neutra",
        "ponto de vista do motorista em um carro esportivo clássico durante a hora azul, mãos apoiadas no volante, gotas de chuva no para-brisa"
      ]
    },
    simple: {
      opticalSystem: "Sistema Óptico",
      aspectRatio: "Proporção da Imagem",
      photoStyle: "Estilo Fotográfico",
      realism: "Prioridade de Realismo",
      balanced: "Equilibrado",
      forensic100: "Forense Óptico (100%)",
      generate: "Gerar Prompts",
      analyzing: "Analisando Óptica...",
      generating: "Construindo Blueprint...",
      modeHint: "Parâmetros ópticos essenciais",
      captureProfile: "Perfil de Captura",
      outputFormat: "Formato de Saída",
      searchCamera: "Buscar câmera...",
      searchType: "Buscar tipo...",
      openLibrary: "Abrir Biblioteca",
      recent: "Recentes",
      favorites: "Favoritos"
    },
    advanced: {
      autoDetectTitle: "Auto Detect",
      autoDetectSub: "Analisa o contexto para sugerir parâmetros ópticos e físicos ideais",
      autoDetectOn: "Ativo",
      autoDetectOff: "Manual",
      detectedTitle: "Contexto Detectado (Clique para editar):",
      modeHint: "Controles forenses de cena",
      sections: {
        subject: "Sujeito e Anatomia",
        pose: "Pose e Postura",
        action: "Ação e Contexto",
        camera: "Câmera e Óptica",
        composition: "Composição e Enquadramento",
        light: "Luz e Atmosfera",
        sliders: "Realismo e Calibração",
        imperfections: "Imperfeições Forenses",
        wardrobe: "Vestuário e Materiais",
        vehicle: "Forense de Veículos",
        environment: "Ambiente e Espaço",
        priority: "Prioridade da Referência",
        fineControl: "Instruções de Precisão",
        pov: "POV Primeira Pessoa e Mãos",
        realismAndCleanup: "Nível de Realismo e Filtro Anti-IA",
        preserveLocks: "Bloqueios de Sujeito e Cena"
      },
      subject: {
        count: "Número de Sujeitos",
        height: "Estatura / Altura",
        bodyPosition: "Posição Corporal",
        orientation: "Orientação",
        weightDistribution: "Distribuição de Peso"
      },
      posture: {
        label: "Estado da Postura",
        custom: "Detalhes Específicos de Postura",
        expression: "Expressão Facial",
        gaze: "Direção do Olhar"
      },
      action: {
        label: "Descrever Ação...",
        placeholder: "ex: encostado no para-lama do carro, uma mão no bolso, olhando em direção à rua..."
      },
      camera: {
        device: "Tipo de Dispositivo",
        lens: "Lente / Distância Focal",
        distance: "Distância da Câmera",
        height: "Altura da Câmera",
        angle: "Ângulo da Câmera",
        framing: "Enquadramento"
      },
      light: {
        time: "Horário do Dia",
        source: "Fonte de Luz Primária",
        flash: "Modo do Flash",
        flashBehavior: "Comportamento do Flash"
      },
      sliders: {
        realism: "Realismo Cru",
        imperfection: "Imperfeição Óptica",
        cinematic: "Tratamento Cinematográfico",
        cinematicNote: "(Padrão: Baixo para Realismo Snapshot)",
        stylization: "Estilização",
        backgroundDetail: "Detalhe de Fundo",
        blur: "Desfoque Óptico / Bokeh"
      },
      imperfections: {
        motionBlur: "Desfoque de Movimento",
        slightFocusMiss: "Pequeno Erro de Foco",
        digitalNoise: "Ruído Digital de Sensor",
        flashBlowout: "Estouro Direto de Flash",
        whiteBalanceShift: "Desvio de Balanço de Branco",
        compression: "Artefatos de Compressão",
        lensSmudge: "Mancha / Reflexo na Lente",
        minorCameraShake: "Micro-tremor de Mão"
      },
      wardrobe: {
        top: "Parte Superior",
        bottom: "Calça / Inferior",
        shoes: "Calçado",
        outerwear: "Casaco / Jaqueta",
        accessories: "Acessórios",
        headwear: "Boné / Chapéu",
        jewelryWatch: "Relógio / Joias",
        customDetails: "Detalhes Específicos do Tecido",
        referenceLock: "Bloqueio Estrito de Roupas",
        topPlaceholder: "ex: jaqueta puffer branca espessa com gomos largos",
        bottomPlaceholder: "ex: calça jeans escura de caimento folgado"
      },
      vehicle: {
        vehicleText: "Marca, Modelo e Ano Aproximado do Veículo",
        placeholder: "ex: SUV 4x4 + Lamborghini Revuelto ao fundo",
        modelLock: "Bloqueio Estrito de Modelo",
        exteriorColor: "Cor Externa / Acabamento",
        interiorColor: "Estofamento Interno",
        driverPassenger: "Posição no Banco",
        doorState: "Estado da Porta",
        subjectRelation: "Relação do Sujeito com o Veículo"
      },
      environment: {
        location: "Local / Cidade",
        locationPlaceholder: "ex: entrada residencial em Los Angeles",
        setting: "Cenário / Contexto",
        background: "Elementos de Fundo",
        timeOfDay: "Horário Exato",
        timePlaceholder: "ex: crepúsculo 18:30",
        weather: "Condições Climáticas",
        crowd: "Pessoas / Movimentação",
        naturalClutter: "Desordem Cotidiana Natural",
        mood: "Nível Atmosférico",
        avoidPostcard: "Evitar Visual Cartão-Postal",
        avoidGenericLuxury: "Evitar Luxo Genérico"
      },
      priority: {
        label: "Prioridade da Referência",
        loose: "Livre (Liberdade criativa)",
        balanced: "Equilibrada (Alinhamento natural)",
        strong: "Forte (Detalhes fiéis)",
        absolute: "Absoluta (Bloqueio forense)"
      },
      fineControl: {
        subject: "Substituição de Sujeito",
        action: "Ação Específica",
        location: "Substituição de Local",
        environment: "Detalhes do Ambiente",
        background: "Estrutura do Fundo",
        atmosphere: "Atmosfera e Clima",
        imperfections: "Notas de Imperfeição",
        purpose: "Finalidade da Imagem",
        referenceUse: "Uso da Referência",
        textInsideImage: "Texto Visível na Imagem",
        avoid: "Evitar / Negativo",
        avoidPlaceholder: "ex: sem pele plástica, sem render CGI de estúdio, sem auréolas artificiais de HDR",
        additionalInstructions: "Diretivas Adicionais de Precisão",
        instructionsPlaceholder: "Diretivas finais exatas para o blueprint óptico..."
      },
      pov: {
        handVisibility: "Mãos no Quadro",
        gripType: "Pegada e Contato",
        heldObject: "Objeto Segurado / Interagido",
        heldObjectPlaceholder: "ex: xícara de café, volante, taça de coquetel, celular, relógio",
        pointOfViewHeight: "Altura do Ponto de Vista (POV)",
        surface: "Superfície / Plano de Contato",
        objectRealism: "Estado de Realismo do Objeto"
      },
      realismAndCleanup: {
        realismTier: "Nível de Realismo",
        aiCleanup: "Supressão de Artefatos de IA",
        aiCleanupHint: "Nível mais alto impõe restrições físicas e ópticas mais fortes contra a aparência artificial de IA."
      },
      preserveLocks: {
        title: "Preservar Atributos de Referência (Locks)",
        sub: "Selecione quais elementos das referências devem ser rigorosamente preservados no blueprint óptico."
      }
    },
    options: {
      subjectCount: {
        auto: "Auto Detect",
        solo: "1 Pessoa (Solo)",
        dupla: "2 Pessoas (Dupla)",
        three: "3 Pessoas",
        group: "Grupo"
      },
      bodyPosition: {
        auto: "Auto",
        standing: "Em pé",
        sitting: "Sentado / Em repouso",
        leaning: "Encostado",
        walking: "Caminhando",
        crouching: "Agachado",
        lying: "Deitado",
        mid_action: "Em ação"
      },
      orientation: {
        auto: "Auto",
        front: "De frente",
        threeQuarter: "Perfil 3/4",
        side: "Perfil lateral",
        rearThreeQuarter: "3/4 posterior",
        back: "De costas"
      },
      weightDistribution: {
        auto: "Auto",
        balanced: "Equilibrado ao centro",
        left: "Perna / Quadril esquerdo",
        right: "Perna / Quadril direito",
        dynamic: "Dinâmico atlético"
      },
      posture: {
        auto: "Auto Contextual",
        relaxed: "Relaxado",
        distracted: "Distraído / Espontâneo",
        casual: "Casual",
        leaning: "Encostado em superfície",
        slouched: "Encurvado",
        upright: "Ereto / Formal",
        walking: "A meio passo / Caminhando",
        running: "Dinâmico atlético"
      },
      gaze: {
        auto: "Auto",
        away_from_camera: "Olhando para longe da câmera",
        at_camera: "Direto para a câmera",
        down: "Olhando para baixo",
        up: "Olhando para cima",
        left: "Olhando para a esquerda",
        right: "Olhando para a direita",
        at_object: "Olhando para objeto em mãos",
        at_another_person: "Olhando para outra pessoa"
      },
      cameraDevice: {
        auto: "Correspondência automática de dispositivo",
        iphone_rear: "iPhone Câmera Traseira 1x (Snapshot padrão)",
        iphone_front: "iPhone Câmera Frontal (Selfie)",
        smartphone_rear: "Smartphone Genérico Traseiro",
        professional_camera: "DSLR Profissional Full-Frame"
      },
      cameraLens: {
        auto: "Auto (24-26mm padrão)",
        ultraWide: "0.5x (Ultra Grande Angular ~13mm)",
        wide: "1x (Grande Angular ~24-26mm)",
        standard: "2x (Padrão ~48-52mm)",
        telephoto: "3x (Teleobjetiva ~77-85mm)",
        prime35: "Lente Fixa 35mm Prime",
        prime50: "Lente Fixa 50mm Prime"
      },
      cameraDistance: {
        auto: "Auto",
        very_close: "Muito perto",
        close: "Perto",
        medium: "Médio",
        far: "Longe (Ambiental)",
        very_far: "Muito longe"
      },
      cameraHeight: {
        auto: "Auto",
        ground: "Nível do chão",
        waist: "Altura da cintura",
        chest: "Altura do peito",
        eye: "Nível dos olhos",
        above_eye: "Acima dos olhos",
        high: "Ângulo alto / Plongée"
      },
      cameraFraming: {
        auto: "Auto",
        close_up: "Primeiro plano (Close-up)",
        chest: "Plano médio curto (Peito)",
        waist: "Plano médio (Cintura)",
        threeQuarter: "Plano americano (3/4)",
        full_body: "Corpo inteiro",
        wide_environmental: "Plano geral amplo"
      },
      lightTime: {
        auto: "Auto",
        morning: "Luz suave matinal",
        midday: "Sol direto do meio-dia",
        afternoon: "Tarde avançada",
        sunset: "Pôr do sol / Golden Hour",
        blue_hour: "Hora azul (Crepúsculo 18:30-19:30)",
        night: "Noite",
        late_night: "Madrugada escura"
      },
      lightSource: {
        auto: "Auto",
        natural: "Apenas ambiente natural",
        phone_flash: "Flash direto de celular",
        streetlight: "Poste de iluminação de rua",
        window: "Luz de janela diurna",
        lamp: "Abajur / Lâmpada quente",
        mixed_light: "Luz mista (Ambiente + Flash)",
        no_artificial: "Sem preenchimento artificial"
      },
      flashBehavior: {
        normal: "Flash de celular normal natural",
        hard_direct: "Direto frontal duro (Snapshot cru)",
        slight_blowout: "Leve estouro em primeiro plano",
        natural_falloff: "Queda natural (Fundo distante escuro)",
        strong: "Disparo intenso"
      },
      subjectRelation: {
        leaning_against: "Encostado no carro",
        standing_near: "Em pé próximo ao carro",
        inside: "Sentado no interior",
        driving: "Dirigindo",
        entering: "Entrando",
        exiting: "Saindo",
        sitting_on: "Sentado no capô/porta-malas"
      },
      photoStyles: {
        auto: "Correspondência fotográfica automática",
        casual_smartphone: "Smartphone Casual RAW",
        pov: "Ponto de Vista em Primeira Pessoa (POV)",
        candid: "Espontâneo sem pose",
        street_photography: "Fotografia de Rua",
        social_media_ugc: "Conteúdo UGC de Redes Sociais",
        night_photography: "Fotografia Noturna com Flash",
        portrait: "Retrato com Lente Prime",
        editorial: "Editorial de Revista",
        fashion: "Alta Moda Estúdio/Rua",
        luxury_lifestyle: "Estilo de Vida de Luxo (Realista)",
        automotive: "Forense Automotivo",
        product_photography: "Produto Táctil",
        architecture: "Óptica Arquitetônica",
        disposable_camera: "Câmera Descartável com Flash",
        film35mm: "Filme Analógico 35mm",
        polaroid: "Polaroid Instantânea"
      },
      povHandVisibility: {
        auto: "Automático (Contextual)",
        one_hand: "Uma Mão Visível",
        both_hands: "Ambas as Mãos Visíveis",
        no_hands: "Sem Mãos (POV Ocular Puro)"
      },
      povGripType: {
        auto: "Automático (Natural)",
        holding_object: "Segurando Objeto com Firmeza",
        resting_on_surface: "Apoiadas sobre Superfície",
        touching_screen: "Tocando Tela ou Controles",
        steering: "Mãos ao Volante",
        drinking_eating: "Levando à Boca / Bebendo"
      },
      povHeight: {
        auto: "Automático (Contextual)",
        eye_level: "Nível dos Olhos",
        chest_level: "Nível do Peito",
        tabletop_lookdown: "Visão Superior da Mesa (De Cima)"
      },
      captureProfiles: {
        auto: "Automático (Contextual)",
        raw_smartphone: "Smartphone RAW",
        clean_smartphone: "Smartphone Limpo",
        night_flash: "Flash Noturno",
        low_light: "Baixa Luz",
        candid: "Candid Espontâneo",
        social_media: "Redes Sociais UGC",
        pov: "POV Primeira Pessoa",
        mirror: "Reflexo no Espelho",
        selfie: "Selfie Frontal",
        documentary: "Instantâneo Documental",
        automotive_casual: "Automotivo Casual",
        object_pov_raw: "Objeto / POV RAW"
      },
      captureProfileDescriptions: {
        auto: "Correspondência forense contextual com base no sujeito e ambiente",
        raw_smartphone: "Foto casual de celular, processamento natural, pequenas imperfeições",
        clean_smartphone: "Smartphone mais limpo e nítido, sem aparência profissional artificial",
        night_flash: "Flash direto de celular, fundo mais escuro, sombras fortes e queda rápida de luz",
        low_light: "Ruído digital realista, exposição automática e foco menos perfeito",
        candid: "Momento espontâneo, enquadramento menos perfeito, sem pose fotográfica",
        social_media: "Foto natural apropriada para redes sociais, sem aparência de publicidade",
        pov: "Perspectiva realista de primeira pessoa ou altura do peito",
        mirror: "Comportamento realista de foto no espelho",
        selfie: "Perspectiva frontal real de smartphone",
        documentary: "Registro cotidiano realista, sem estética cinematográfica",
        automotive_casual: "Foto de carro feita por celular, sem aparência de anúncio comercial",
        object_pov_raw: "Objetos fotografados de forma casual com contexto real ao redor"
      },
      cameraModes: {
        auto: "Automático",
        rear_main: "Câmera Traseira Principal",
        rear_ultrawide: "Traseira 0.5x Ultra Wide",
        rear_1x: "Traseira 1x Principal",
        rear_2x: "Traseira 2x",
        rear_3x: "Traseira 3x",
        rear_telephoto: "Traseira Telefoto",
        front_camera: "Câmera Frontal",
        mirror_selfie: "Mirror Selfie",
        handheld_pov: "POV na Mão",
        chest_pov: "POV na Altura do Peito",
        overhead: "Smartphone de Cima (Overhead)",
        low_angle: "Smartphone em Ângulo Baixo"
      },
      cameraFeels: {
        auto: "Automático",
        very_raw: "Muito RAW",
        casual: "Casual",
        clean: "Limpo",
        slightly_shaky: "Levemente Tremido",
        quick_snapshot: "Instantâneo Rápido",
        distracted_capture: "Captura Distraída",
        social_media: "Rede Social",
        low_light: "Baixa Luz",
        direct_flash: "Flash Direto",
        older_phone_look: "Aparência de Celular Antigo"
      },
      surfaces: {
        auto: "Automático (Natural)",
        wood_table: "Mesa de Madeira",
        glass_table: "Mesa de Vidro",
        stone: "Pedra",
        concrete: "Concreto",
        car_hood: "Capô de Carro",
        car_interior: "Interior de Carro",
        leather: "Couro",
        fabric: "Tecido",
        bed: "Cama",
        floor: "Chão / Piso",
        counter: "Bancada",
        desk: "Escrivaninha / Mesa",
        metal: "Metal",
        asphalt: "Asfalto",
        grass: "Grama",
        sand: "Areia",
        custom: "Superfície Personalizada"
      },
      environmentConditions: {
        auto: "Automático (Contextual)",
        very_clean: "Muito Limpo",
        normal: "Normal",
        lived_in: "Vivido / Cotidiano",
        slightly_messy: "Levemente Bagunçado",
        messy: "Bagunçado",
        raw: "Cru",
        dusty: "Empoeirado",
        used: "Usado",
        wet: "Molhado",
        dry: "Seco"
      },
      objectRealism: {
        clean_product: "Produto Limpo",
        natural: "Natural",
        used: "Usado",
        very_used: "Muito Usado",
        imperfect: "Imperfeito (Poeira e Marcas)",
        raw: "Cru e Desgastado"
      },
      actionMoments: {
        auto: "Automático",
        static: "Estático / Em Repouso",
        before_action: "Antes da Ação",
        mid_action: "Em Plena Ação",
        impact_moment: "Momento do Impacto",
        immediately_after: "Imediatamente Depois",
        walking: "Caminhando",
        turning: "Virando",
        sitting_down: "Sentando",
        standing_up: "Levantando",
        reaching: "Alcançando",
        holding: "Segurando",
        using_object: "Usando Objeto",
        distracted: "Distraído",
        waiting: "Esperando",
        talking: "Conversando",
        laughing: "Rindo",
        eating: "Comendo",
        drinking: "Bebendo",
        smoking: "Fumando",
        driving: "Dirigindo",
        custom: "Ação Personalizada"
      },
      flashes: {
        auto: "Automático",
        off: "Desligado",
        on: "Ligado",
        direct: "Flash Direto",
        hard_direct: "Flash Duro Direto",
        strong: "Flash Forte",
        slight_blowout: "Leve Estouro de Luz",
        heavy_blowout: "Estouro Intenso de Luz",
        close_range_flash: "Flash a Curta Distância",
        night_flash: "Flash Noturno"
      },
      imperfectionsList: {
        motion_blur_slight: "Desfoque de Movimento Leve",
        motion_blur_medium: "Desfoque de Movimento Médio",
        motion_blur_strong: "Desfoque de Movimento Forte",
        focus_miss_small: "Pequeno Erro de Foco",
        soft_focus: "Foco Suave",
        digital_noise: "Ruído Digital de Sensor",
        high_iso_noise: "Granulação Alto ISO",
        flash_blowout: "Estouro por Flash",
        white_balance_error: "Desvio de Balanço de Branco",
        compression: "Compressão de Celular",
        lens_smudge: "Marca de Dedo na Lente",
        finger_near_lens: "Dedo Perto da Borda da Lente",
        minor_camera_shake: "Leve Tremor de Câmera",
        crooked_horizon: "Horizonte Ligeiramente Torto",
        slight_underexposure: "Leve Subexposição",
        slight_overexposure: "Leve Superexposição"
      },
      locks: {
        face: "Rosto",
        hair: "Cabelo",
        skinTone: "Tom de Pele",
        body: "Corpo",
        height: "Altura",
        outfit: "Roupa",
        accessories: "Acessórios",
        pose: "Pose",
        vehicle: "Veículo",
        object: "Objeto",
        environment: "Ambiente",
        camera: "Câmera",
        lighting: "Iluminação"
      },
      outputFormats: {
        auto: "Automático (Original)",
        ig_portrait: "Instagram Feed Retrato (4:5)",
        ig_square: "Instagram Feed Quadrado (1:1)",
        ig_story: "Instagram Story (9:16)",
        ig_reel: "Instagram Reel (9:16)",
        tiktok: "TikTok (9:16)",
        youtube_thumb: "Miniatura YouTube (16:9)",
        youtube_shorts: "YouTube Shorts (9:16)",
        facebook_feed: "Facebook Feed (4:5)",
        facebook_story: "Facebook Story (9:16)",
        x_post: "Post no X (16:9)",
        linkedin_post: "Post no LinkedIn (1:1)",
        pinterest_pin: "Pin do Pinterest (2:3)",
        whatsapp_status: "Status do WhatsApp (9:16)",
        telegram_story: "Story do Telegram (9:16)",
        mobile_wallpaper: "Papel de Parede Celular (9:16)",
        desktop_wallpaper: "Papel de Parede Desktop (16:9)",
        website_hero: "Banner Hero de Site (21:9)",
        ecommerce_product: "Produto E-commerce (1:1)",
        custom: "Formato Personalizado"
      },
      typeCategories: {
        all: "Todos",
        people: "Pessoas",
        object_pov: "Objeto / POV",
        vehicles: "Veículos",
        environments: "Ambientes",
        architecture: "Arquitetura",
        product: "Produto",
        tools: "Ferramentas de Prompt"
      },
      cameraCategories: {
        all: "Todas as Câmeras",
        iphone: "Apple iPhone",
        samsung: "Samsung Galaxy",
        pixel: "Google Pixel",
        other: "Outros Smartphones"
      },
      typesList: {
        person: "Pessoa (Geral)",
        solo_person: "Pessoa Sozinha",
        duo_people: "Dupla / Duas Pessoas",
        group_people: "Grupo",
        couple: "Casal",
        selfie: "Selfie",
        mirror_selfie: "Mirror Selfie",
        full_body: "Corpo Inteiro",
        half_body: "Meio Corpo",
        portrait: "Retrato",
        candid_person: "Pessoa Espontânea",
        person_walking: "Pessoa Andando",
        person_sitting: "Pessoa Sentada",
        person_leaning: "Pessoa Apoiada",
        person_in_car: "Pessoa no Carro",
        person_with_vehicle: "Pessoa com Veículo",
        person_with_object: "Pessoa com Objeto",
        outfit_fashion: "Outfit / Moda",
        lifestyle_person: "Estilo de Vida",
        sport_action: "Esporte / Ação",
        object_pov: "Objeto / POV",
        object_close_up: "Close-up de Objeto",
        handheld_object: "Objeto Segurado",
        object_on_table: "Objeto na Mesa",
        object_in_hand: "Objeto na Mão",
        desk_pov: "POV Mesa de Trabalho",
        food_pov: "POV Comida",
        table_food: "Mesa / Comida",
        luxury_objects: "Objetos de Luxo",
        watch_jewelry_pov: "POV Relógio / Joia",
        phone_tech_pov: "POV Celular / Tech",
        bag_accessory_pov: "POV Bolsa / Acessório",
        sneaker_pov: "POV Tênis",
        car_hood_pov: "POV Capô de Carro",
        car_interior_pov: "POV Interior de Carro",
        driver_pov: "POV Motorista",
        passenger_pov: "POV Passageiro",
        garage_pov: "POV Garagem",
        room_pov: "POV Quarto",
        bed_pov: "POV Cama",
        balcony_pov: "POV Varanda",
        street_pov: "POV Rua",
        vehicle: "Veículo",
        car_exterior: "Exterior do Carro",
        car_interior: "Interior do Carro",
        driver_seat: "Banco do Motorista",
        passenger_seat: "Banco do Passageiro",
        open_door: "Porta Aberta",
        entering_car: "Entrando no Carro",
        exiting_car: "Saindo do Carro",
        leaning_against_car: "Apoiado no Carro",
        car_plus_person: "Carro + Pessoa",
        supercar: "Supercarro",
        suv_4x4: "SUV / 4x4",
        sedan: "Sedan",
        sports_car: "Carro Esportivo",
        classic_car: "Carro Clássico",
        motorcycle: "Motocicleta",
        off_road: "Off-Road",
        garage_vehicle: "Garagem",
        driveway: "Entrada de Garagem",
        parking_lot: "Estacionamento",
        scene: "Cena",
        interior: "Interior",
        exterior: "Exterior",
        home_interior: "Interior Residencial",
        living_room: "Sala de Estar",
        bedroom: "Quarto",
        kitchen: "Cozinha",
        office: "Escritório",
        garage_env: "Garagem",
        balcony_env: "Varanda",
        rooftop: "Rooftop / Terraço",
        restaurant: "Restaurante",
        cafe: "Café",
        hotel: "Hotel",
        airport: "Aeroporto",
        hangar: "Hangar",
        street: "Rua",
        residential_street: "Rua Residencial",
        city_night: "Cidade à Noite",
        rural: "Rural / Campo",
        ranch: "Rancho / Fazenda",
        beach: "Praia",
        marina: "Marina / Porto",
        golf_course: "Campo de Golfe",
        sports_location: "Local Esportivo",
        architecture: "Arquitetura",
        real_estate: "Imóveis",
        house_exterior: "Exterior da Casa",
        house_interior: "Interior da Casa",
        apartment: "Apartamento",
        luxury_home: "Casa de Luxo",
        ordinary_home: "Casa Comum",
        room_arch: "Cômodo",
        lobby: "Lobby / Recepção",
        pool_area: "Área da Piscina",
        garden: "Jardim",
        commercial_interior: "Interior Comercial",
        building_exterior: "Exterior do Prédio",
        product: "Produto",
        product_close_up: "Close-up de Produto",
        product_in_use: "Produto em Uso",
        product_on_table: "Produto na Mesa",
        packaging: "Embalagem",
        watch: "Relógio",
        jewelry: "Joia",
        perfume: "Perfume",
        shoes: "Tênis / Calçados",
        clothing_item: "Peça de Roupa",
        tech_product: "Produto Tech",
        food_product: "Produto Alimentício",
        automotive_detail: "Detalhe Automotivo",
        edit_existing_prompt: "Editar Prompt Existente",
        fix_realism: "Corrigir Realismo",
        expand_prompt: "Expandir Prompt",
        rewrite_prompt: "Reescrever Prompt",
        idea_to_prompt: "Da Ideia para Prompt",
        reference_to_prompt: "Da Referência para Prompt",
        change_only: "Mudar Apenas Um Elemento",
        diagnose_fake_result: "Diagnosticar Resultado Artificial",
        rebuild_scene: "Reconstruir Cena"
      }
    },
    output: {
      v1Tab: "V1 Smart",
      v2Tab: "V2 Estruturado",
      v3Tab: "V3 Forense",
      compareTab: "Comparar",
      v1Title: "V1 — Instantâneo Natural Inteligente",
      v1Sub: "Prompt compacto de smartphone com física resolvida",
      v2Title: "V2 — Reconstrução Fotográfica Estruturada",
      v2Sub: "Reconstrução fotográfica estruturada com lógica física de cena",
      v3Title: "V3 — Prompt Forense Profundo",
      v3Sub: "Reconstrução física profunda em formato direto com chaves {}",
      compare: "Comparar Todos",
      copy: "Copiar",
      copied: "Copiado!",
      save: "Salvar nas Predefinições",
      refine: "Refinar",
      refineTooltip: "Refinar elemento específico sem regenerar toda a cena",
      copyAll: "Copiar os 3 Prompts",
      copiedAll: "Todos os 3 Prompts Copiados!",
      copyNegative: "Copiar Negativo",
      negativePromptTitle: "Prompt Negativo (Filtro Anti-Artefatos)",
      statsCharacters: "Caract.",
      statsWords: "Palavras",
      statsTokens: "Tokens",
      refinePromptTitle: "Refinar Prompt",
      refinePromptSub: "Especifique apenas a alteração exata (ex: 'troque a jaqueta por uma puffer preta', 'remova o carro'). A composição e geometria permanecerão intactas.",
      refineInputPlaceholder: "O que você deseja alterar exatamente?",
      refineApply: "Aplicar Ajuste",
      refineCancel: "Cancelar",
      refining: "Refinando...",
      emptyTitle: "Nenhum prompt gerado ainda",
      emptySub: "Envie uma imagem de referência ou descreva sua ideia para gerar os prompts V1, V2, V3, V4, V5 e V6.",
      loadingTitle: "Sintetizando Motores Ópticos",
      loadingSub: "Sintetizando motores fotográficos V1, V2, V3, V4, V5 e V6...",
      loadingSteps: [
        "Analisando Geometria de Cena e Grafo Espacial",
        "Extraindo Física Óptica e Propagação de Luz",
        "Resolvendo Articulações e Biomecânica da Pose",
        "Construindo V1 Instantâneo Natural Inteligente",
        "Gerando V2 Realismo Modular Estruturado",
        "Finalizando V3 Prompt Forense Profundo"
      ],
      snapshotSaved: "Snapshot"
    },
    history: {
      title: "Histórico de Prompts",
      empty: "Nenhum histórico salvo ainda.",
      clearAll: "Limpar Tudo",
      restore: "Restaurar",
      delete: "Excluir",
      close: "Fechar",
      imageRef: "Ref Imagem",
      idea: "Ideia"
    },
    presets: {
      title: "Predefinições Fotográficas",
      apply: "Aplicar",
      saveCurrent: "Salvar Configuração Atual",
      saveBtn: "Salvar",
      presetNamePlaceholder: "Nome da predefinição...",
      delete: "Excluir",
      savedAlert: "Predefinição salva com sucesso!",
      defaultBadge: "Padrão",
      defaults: {
        rawIphone: "Instantâneo RAW iPhone",
        rawIphoneDesc: "Captura autêntica de smartphone com imperfeições naturais e sem pós-produção pesada.",
        nightFlash: "Flash Direto Noturno",
        nightFlashDesc: "Flash frontal do celular à noite, queda rápida de luz e fundo escuro preservado.",
        casualCandid: "Candid Casual",
        casualCandidDesc: "Momento espontâneo sem pose ensaiada, cores neutras e enquadramento real.",
        deepDof: "Profundidade de Campo Ampla",
        deepDofDesc: "Nitidez profunda do primeiro plano ao fundo, sem recorte de modo retrato artificial.",
        pov: "Ponto de Vista (POV)",
        povDesc: "Perspectiva em primeira pessoa com mãos e interação física visíveis no quadro.",
        automotive: "Forense Automotivo",
        automotiveDesc: "Geometria exata do veículo, pintura realística e reflexos ópticos convincentes."
      }
    },
    errors: {
      noInput: "Por favor envie uma imagem de referência ou descreva sua ideia de cena.",
      failed: "Falha na análise. Verifique sua conexão e tente novamente.",
      missingKey: "Configuração de chave de API ausente."
    }
  }
};
