import { Language, ModalityType, CameraMode, CaptureProfile, InputMode } from '../types';

export interface ContextualStarterContext {
  language: Language;
  modality: ModalityType;
  typeId?: string;
  sourceMode?: InputMode;
  camera?: string;
  cameraMode?: CameraMode;
  captureProfile?: CaptureProfile;
  timeOfDay?: string;
  shuffleKey?: number;
  library?: boolean;
}

export interface StarterItem {
  id: string;
  title: string;
  promptText: string;
  categoryTag?: string;
}

export interface SuggestionComplement {
  label: string;
  appendText: string;
}

// Comprehensive database of authentic photographic starters strictly tailored by type
const STARTERS_BY_CATEGORY: Record<
  string,
  Record<
    Language,
    Array<{ title: string; text: string; subcategories?: string[] }>
  >
> = {
  // ==========================================
  // PERSON / PORTRAIT / LIFESTYLE
  // ==========================================
  person: {
    pt: [
      {
        title: "Encostado numa 4x4",
        text: "eu encostado distraído numa 4x4 em frente a uma casa às 18:30 com luz natural suave de entardecer e corte relaxado",
        subcategories: ['solo_male', 'solo_female', 'person', 'street_candid']
      },
      {
        title: "Sentado no sofá à noite",
        text: "eu sentado relaxado num sofá de tecido à noite, olhando para o lado, iluminação ambiente suave de luminária de sala",
        subcategories: ['sitting', 'solo_male', 'solo_female', 'person']
      },
      {
        title: "Andando por rua residencial",
        text: "foto minha andando por uma calçada residencial tranquila sem olhar para a câmera, perspectiva casual de celular",
        subcategories: ['street_candid', 'in_motion', 'person', 'full_body']
      },
      {
        title: "Saindo do carro com flash",
        text: "eu saindo de um carro à noite com a porta do motorista aberta e flash direto do celular disparado, iluminação crua",
        subcategories: ['in_car', 'night_out', 'person', 'solo_male', 'solo_female']
      },
      {
        title: "Dois conversando na mesa",
        text: "dois homens sentados numa mesa de cafeteria conversando distraídos, xícaras de café e celular pousado sobre a mesa",
        subcategories: ['duo', 'group', 'sitting']
      },
      {
        title: "Duas pessoas saindo do carro",
        text: "duas pessoas saindo de um carro estacionado na calçada durante a noite, luz ambiente de poste público e pose espontânea",
        subcategories: ['duo', 'night_out', 'in_car']
      },
      {
        title: "Grupo de amigos na sala",
        text: "grupo de amigos reunidos em uma sala de estar, cada um fazendo uma ação diferente e descontraída, fotografia casual",
        subcategories: ['group']
      },
      {
        title: "Selfie no espelho de academia ou elevador",
        text: "selfie casual no espelho de elevador com iluminação embutida neutra, reflexo natural segurando o celular sem pose forçada",
        subcategories: ['mirror_selfie', 'person']
      },
      {
        title: "Parado no trânsito visto do passageiro",
        text: "foto casual tirada do banco do passageiro enquanto o motorista observa o trânsito com luz dourada suave nas mãos no volante",
        subcategories: ['in_car', 'driver_seat', 'person']
      }
    ],
    es: [
      {
        title: "Apoyado en una 4x4",
        text: "yo apoyado distraído en una 4x4 frente a una casa a las 18:30 con luz natural suave de atardecer y encuadre relajado",
        subcategories: ['solo_male', 'solo_female', 'person', 'street_candid']
      },
      {
        title: "Sentado en el sofá de noche",
        text: "yo sentado relajado en un sofá de tela de noche, mirando hacia un lado, iluminación ambiental tenue de lámpara de sala",
        subcategories: ['sitting', 'solo_male', 'solo_female', 'person']
      },
      {
        title: "Caminando por calle residencial",
        text: "foto mía caminando por una acera residencial tranquila sin mirar a la cámara, ángulo casual de smartphone",
        subcategories: ['street_candid', 'in_motion', 'person', 'full_body']
      },
      {
        title: "Saliendo del auto con flash",
        text: "yo saliendo de un auto de noche con la puerta del conductor abierta y flash directo de celular, iluminación cruda",
        subcategories: ['in_car', 'night_out', 'person', 'solo_male', 'solo_female']
      },
      {
        title: "Dos conversando en la mesa",
        text: "dos hombres sentados en una mesa de cafetería charlando distraídos, tazas de café y teléfono apoyado en la mesa",
        subcategories: ['duo', 'group', 'sitting']
      },
      {
        title: "Dos personas saliendo del coche",
        text: "dos personas saliendo de un auto estacionado en la calle de noche, luz de farola urbana y pose espontánea",
        subcategories: ['duo', 'night_out', 'in_car']
      },
      {
        title: "Grupo de amigos en la sala",
        text: "grupo de amigos reunidos en una sala de estar, cada uno en una acción diferente y relajada, fotografía casual",
        subcategories: ['group']
      },
      {
        title: "Selfie en el espejo",
        text: "selfie casual en el espejo de ascensor con luz integrada neutra, reflejo natural sosteniendo el móvil sin pose forzada",
        subcategories: ['mirror_selfie', 'person']
      }
    ],
    en: [
      {
        title: "Leaning on a 4x4",
        text: "me leaning distracted against a 4x4 in front of a residential house at 6:30 PM with soft golden hour natural light",
        subcategories: ['solo_male', 'solo_female', 'person', 'street_candid']
      },
      {
        title: "Sitting on living room couch",
        text: "me sitting relaxed on a fabric sofa at night, glancing away from camera, warm dim floor lamp ambient illumination",
        subcategories: ['sitting', 'solo_male', 'solo_female', 'person']
      },
      {
        title: "Walking down residential sidewalk",
        text: "candid snapshot of me walking down a quiet residential sidewalk without looking at the camera, phone perspective",
        subcategories: ['street_candid', 'in_motion', 'person', 'full_body']
      },
      {
        title: "Exiting car with direct flash",
        text: "me stepping out of a car at night with the driver door open and direct phone flash, raw realistic shadows",
        subcategories: ['in_car', 'night_out', 'person', 'solo_male', 'solo_female']
      },
      {
        title: "Two men talking at coffee table",
        text: "two men sitting at a coffee table chatting casually and unposed, espresso cups and smartphone lying flat on the surface",
        subcategories: ['duo', 'group', 'sitting']
      },
      {
        title: "Two people exiting car at night",
        text: "two people getting out of a parked car on a neighborhood street at night, ambient street lamp lighting, unposed",
        subcategories: ['duo', 'night_out', 'in_car']
      },
      {
        title: "Group of friends hanging out",
        text: "group of friends hanging out in a real living room, each engaged in a natural candid gesture, smartphone snapshot",
        subcategories: ['group']
      },
      {
        title: "Elevator mirror selfie",
        text: "casual elevator mirror selfie with neutral overhead LED ceiling light, holding phone naturally, no influencer pose",
        subcategories: ['mirror_selfie', 'person']
      }
    ]
  },

  // ==========================================
  // OBJECT / FIRST-PERSON POV
  // ==========================================
  object_pov: {
    pt: [
      {
        title: "POV iPhone novo na mesa de quartzo",
        text: "POV de um iPhone novo sobre uma mesa de quartzo claro logo após abrir a caixa, plástico protetor e detalhes nítidos",
        subcategories: ['table_surface', 'tech_device', 'object_close']
      },
      {
        title: "Bandejas de tacos no capô do carro",
        text: "várias bandejas de tacos apoiadas casualmente no capô de um carro dentro de uma garagem residencial iluminada",
        subcategories: ['car_hood', 'table_food', 'food_pov']
      },
      {
        title: "POV segurando relógio no carro à noite",
        text: "POV segurando um relógio com pulseira de couro dentro de um carro à noite, luz do painel refletindo no vidro",
        subcategories: ['watch_jewelry', 'handheld', 'car_interior']
      },
      {
        title: "Mesa de trabalho com MacBook e chaves",
        text: "mesa de madeira com MacBook aberto, chaves com chaveiro de couro, xícara de café e carteira, foto casual de celular",
        subcategories: ['table_surface', 'desk_setup', 'tech_device']
      },
      {
        title: "POV mão segurando chave de carro",
        text: "POV de uma mão segurando uma chave de carro moderna diante de uma garagem residencial no fim da tarde",
        subcategories: ['handheld', 'car_hood']
      },
      {
        title: "Café e croissant perto da janela",
        text: "POV de xícara de cappuccino e croissant sobre mesa de madeira rústica perto da janela com migalhas naturais",
        subcategories: ['food_pov', 'table_food']
      }
    ],
    es: [
      {
        title: "POV iPhone nuevo en encimera de cuarzo",
        text: "POV de un iPhone nuevo sobre una mesa de cuarzo blanco recién sacado de la caja, detalles nítidos y reflejo tenue",
        subcategories: ['table_surface', 'tech_device', 'object_close']
      },
      {
        title: "Bandejas de tacos sobre el capó",
        text: "varias bandejas de tacos apoyadas casualmente en el capó de un auto dentro de un garaje residencial",
        subcategories: ['car_hood', 'table_food', 'food_pov']
      },
      {
        title: "POV sosteniendo reloj en el coche",
        text: "POV sosteniendo un reloj elegante dentro de un auto de noche con la suave luz del cuadro de instrumentos",
        subcategories: ['watch_jewelry', 'handheld', 'car_interior']
      },
      {
        title: "Mesa con portátil, llaves y cartera",
        text: "mesa de madera con portátil abierto, llaves de casa, taza de espresso y cartera, foto casual de smartphone",
        subcategories: ['table_surface', 'desk_setup', 'tech_device']
      },
      {
        title: "POV mano con llave de coche",
        text: "POV de una mano sosteniendo la llave de un auto frente a un garaje residencial en el atardecer",
        subcategories: ['handheld', 'car_hood']
      }
    ],
    en: [
      {
        title: "POV unboxed iPhone on quartz table",
        text: "POV shot looking down at a newly unboxed iPhone on a quartz countertop, peel tab visible, crisp phone camera optics",
        subcategories: ['table_surface', 'tech_device', 'object_close']
      },
      {
        title: "Taco takeout boxes on car hood",
        text: "casual takeout foil containers with tacos resting on the hood of a car inside a residential garage, overhead lighting",
        subcategories: ['car_hood', 'table_food', 'food_pov']
      },
      {
        title: "POV holding luxury watch inside car",
        text: "POV holding a steel watch inside a parked car at night, subtle instrument cluster backlighting and natural reflection",
        subcategories: ['watch_jewelry', 'handheld', 'car_interior']
      },
      {
        title: "Cluttered desk with laptop & keys",
        text: "casual smartphone shot of a wooden desk with open laptop, car keys, ceramic espresso cup, and leather wallet",
        subcategories: ['table_surface', 'desk_setup', 'tech_device']
      },
      {
        title: "POV hand holding car key fob",
        text: "first-person POV holding a modern key fob facing a residential driveway in the late afternoon sun",
        subcategories: ['handheld', 'car_hood']
      },
      {
        title: "Coffee & pastry by morning window",
        text: "POV of ceramic coffee cup and flaky croissant on wooden cafe table with crumbs and morning window light",
        subcategories: ['food_pov', 'table_food']
      }
    ]
  },

  // ==========================================
  // FOOD / DINING
  // ==========================================
  food: {
    pt: [
      {
        title: "Tacos pela metade na mesa",
        text: "tacos pela metade servidos em prato rústico sobre uma mesa depois de uma refeição com guardanapo e limão espremido",
        subcategories: ['table_food', 'food_pov']
      },
      {
        title: "Pizza aberta e copos usados",
        text: "mesa de cozinha com caixa de pizza aberta, fatias consumidas, copos usados e papel toalha em ambiente descontraído",
        subcategories: ['table_food', 'food_pov']
      },
      {
        title: "Café da manhã na janela",
        text: "POV de xícara de cappuccino fumegante e torrada com abacate sobre mesa perto da janela em manhã ensolarada",
        subcategories: ['food_pov', 'table_food']
      },
      {
        title: "Comida apoiada no capô do carro",
        text: "hambúrguer e batatas fritas em embalagem de papel apoiados casualmente sobre o capô de um carro estacionado",
        subcategories: ['car_hood', 'food_pov']
      }
    ],
    es: [
      {
        title: "Tacos a medio comer en la mesa",
        text: "tacos a medio comer en plato rústico sobre la mesa tras una comida, con servilletas usadas y rodajas de lima",
        subcategories: ['table_food', 'food_pov']
      },
      {
        title: "Mesa con pizza abierta y vasos",
        text: "mesa de cocina con caja de pizza abierta, porciones empezadas, vasos usados y servilletas en ambiente cotidiano",
        subcategories: ['table_food', 'food_pov']
      },
      {
        title: "Café con croissant matutino",
        text: "POV de café con leche y croissant sobre mesa de cafetería junto a ventana con luz matutina natural",
        subcategories: ['food_pov', 'table_food']
      }
    ],
    en: [
      {
        title: "Half-eaten tacos on table",
        text: "half-eaten tacos on ceramic plate after a meal with crumpled napkin, lime wedge, and authentic table clutter",
        subcategories: ['table_food', 'food_pov']
      },
      {
        title: "Kitchen table with pizza box",
        text: "kitchen table with open delivery pizza box, remaining slices, half-full soda glasses, and paper napkins",
        subcategories: ['table_food', 'food_pov']
      },
      {
        title: "POV morning coffee & pastry",
        text: "first-person view of hot coffee and pastry by sunlit cafe window with natural crumbs on raw oak surface",
        subcategories: ['food_pov', 'table_food']
      },
      {
        title: "Fast food tray on car hood",
        text: "paper bag and smash burger wrapped in foil resting on car hood in an evening parking lot with casual snapshot feel",
        subcategories: ['car_hood', 'food_pov']
      }
    ]
  },

  // ==========================================
  // VEHICLE (EXTERIOR)
  // ==========================================
  vehicle: {
    pt: [
      {
        title: "Lamborghini no driveway à noite",
        text: "Lamborghini estacionado num driveway residencial ao começo da noite, luz das janelas da casa refletindo na pintura",
        subcategories: ['supercar', 'car_exterior']
      },
      {
        title: "Traseira de BMW na rua com flash",
        text: "foto traseira casual de uma BMW preta estacionada no meio-fio à noite, flash de smartphone iluminando placas e detalhes",
        subcategories: ['sedan', 'car_exterior', 'night_vehicle']
      },
      {
        title: "SUV preta na garagem comum",
        text: "SUV preta estacionada em uma garagem residencial comum com caixas e ferramentas organizadas ao fundo",
        subcategories: ['suv', 'car_exterior']
      },
      {
        title: "Carro esportivo na rua molhada",
        text: "carro esportivo cinza estacionado em rua molhada após chuva fina, reflexos no asfalto e ângulo baixo de smartphone",
        subcategories: ['car_exterior', 'sports_car']
      }
    ],
    es: [
      {
        title: "Lamborghini en driveway residencial",
        text: "Lamborghini estacionado en la entrada de una casa al anochecer, luces residenciales reflejándose en la carrocería",
        subcategories: ['supercar', 'car_exterior']
      },
      {
        title: "Trasera de BMW con flash nocturno",
        text: "foto trasera casual de BMW negro aparcado en la calle de noche, flash de móvil iluminando pilotos traseros",
        subcategories: ['sedan', 'car_exterior', 'night_vehicle']
      },
      {
        title: "SUV negro en garaje doméstico",
        text: "SUV negro estacionado dentro de un garaje residencial con estantes y cajas de fondo, ángulo natural",
        subcategories: ['suv', 'car_exterior']
      }
    ],
    en: [
      {
        title: "Supercar parked in driveway at dusk",
        text: "Lamborghini parked in a residential concrete driveway at dusk, warm porch light reflecting off metallic body panels",
        subcategories: ['supercar', 'car_exterior']
      },
      {
        title: "Rear angle of BMW with night flash",
        text: "casual rear snapshot of a dark BMW parked at the curb at night, direct phone flash lighting up badges and tail lights",
        subcategories: ['sedan', 'car_exterior', 'night_vehicle']
      },
      {
        title: "Black SUV in suburban garage",
        text: "clean black SUV parked inside a typical suburban garage, tools and storage shelves in background, eye-level phone shot",
        subcategories: ['suv', 'car_exterior']
      },
      {
        title: "Sports car on damp pavement",
        text: "graphite sports coupe parked on wet street after light drizzle, realistic water beads and pavement reflections",
        subcategories: ['car_exterior', 'sports_car']
      }
    ]
  },

  // ==========================================
  // CAR INTERIOR / POV
  // ==========================================
  car_interior: {
    pt: [
      {
        title: "POV do motorista à noite",
        text: "POV do motorista dentro de um carro estacionado à noite, mãos no volante de couro e display central ligado",
        subcategories: ['driver_seat', 'car_interior']
      },
      {
        title: "Mão no volante e console central",
        text: "mão esquerda repousando no volante, console central visível com copos e celular carregando por indução",
        subcategories: ['driver_seat', 'car_interior']
      },
      {
        title: "Banco traseiro visto com porta aberta",
        text: "foto casual tirada do lado de fora mostrando banco traseiro de couro e porta aberta com luz de cortesia acesa",
        subcategories: ['passenger_seat', 'car_interior']
      },
      {
        title: "Painel visto da altura do peito",
        text: "painel, volante e para-brisa vistos da altura do peito a partir do banco dianteiro, iluminação suave do trânsito",
        subcategories: ['driver_seat', 'car_interior']
      }
    ],
    es: [
      {
        title: "POV del conductor de noche",
        text: "POV del conductor dentro de un auto aparcado de noche, manos en el volante de cuero y pantalla central encendida",
        subcategories: ['driver_seat', 'car_interior']
      },
      {
        title: "Mano en volante y consola central",
        text: "mano izquierda en el volante, consola central visible con posavasos y teléfono móvil, luz tenue de tablero",
        subcategories: ['driver_seat', 'car_interior']
      },
      {
        title: "Vista del tablero a la altura del pecho",
        text: "salpicadero y volante vistos desde el asiento delantero a la altura del pecho con tráfico exterior desenfocado",
        subcategories: ['driver_seat', 'car_interior']
      }
    ],
    en: [
      {
        title: "Driver seat night POV",
        text: "driver POV sitting inside a parked car at night, hands resting on leather steering wheel, dashboard infotainment glow",
        subcategories: ['driver_seat', 'car_interior']
      },
      {
        title: "Hand on steering wheel & console",
        text: "left hand resting on steering wheel rim, center console visible with cup holder and charging phone",
        subcategories: ['driver_seat', 'car_interior']
      },
      {
        title: "Rear seats through open car door",
        text: "casual snapshot looking into rear leather seats with door held open and warm interior courtesy lamp",
        subcategories: ['passenger_seat', 'car_interior']
      },
      {
        title: "Dashboard from chest height",
        text: "dashboard, gauge cluster and windshield photographed from chest level inside modern vehicle, street view outside",
        subcategories: ['driver_seat', 'car_interior']
      }
    ]
  },

  // ==========================================
  // PRODUCT
  // ==========================================
  product: {
    pt: [
      {
        title: "iPhone recém-tirado da caixa",
        text: "iPhone recém-tirado da caixa aberto sobre uma mesa residencial, cabo USB e manual ao lado, iluminação neutra",
        subcategories: ['product_shot', 'tech_device']
      },
      {
        title: "Perfume na bancada do banheiro",
        text: "frasco de perfume de luxo apoiado numa bancada de mármore de banheiro com gotas de água e toalha dobrada",
        subcategories: ['cosmetics', 'product_shot']
      },
      {
        title: "Relógio na mesa de madeira",
        text: "relógio analógico sobre mesa de carvalho com celular ao lado, capturado com luz lateral de janela matutina",
        subcategories: ['watch_jewelry', 'product_shot']
      },
      {
        title: "Tênis novos próximos da caixa",
        text: "par de tênis de corrida novos retirados da caixa de papelão sobre piso de madeira claro de quarto",
        subcategories: ['apparel_shoes', 'product_shot']
      }
    ],
    es: [
      {
        title: "iPhone recién salido de la caja",
        text: "iPhone nuevo junto a su caja abierta sobre una mesa doméstica, película protectora y accesorios ordenados",
        subcategories: ['product_shot', 'tech_device']
      },
      {
        title: "Perfume en lavabo de mármol",
        text: "frasco de perfume de lujo sobre encimera de baño con gotas finas de agua y toalla doblada cerca",
        subcategories: ['cosmetics', 'product_shot']
      },
      {
        title: "Zapatillas nuevas junto a la caja",
        text: "par de zapatillas deportivas nuevas sobre suelo de parquet junto a la caja de cartón abierta",
        subcategories: ['apparel_shoes', 'product_shot']
      }
    ],
    en: [
      {
        title: "Unboxed phone on home table",
        text: "new smartphone resting beside its opened packaging on a wooden dining table, USB cable coiled beside it",
        subcategories: ['product_shot', 'tech_device']
      },
      {
        title: "Perfume bottle on marble vanity",
        text: "luxury perfume bottle placed on marble bathroom vanity counter with realistic water droplet accents and soft towel",
        subcategories: ['cosmetics', 'product_shot']
      },
      {
        title: "Wristwatch on natural oak desk",
        text: "mechanical wristwatch sitting on oak desk beside a leather notebook, soft diffused morning window light",
        subcategories: ['watch_jewelry', 'product_shot']
      },
      {
        title: "Sneakers by opened shoebox",
        text: "fresh unworn sneakers placed on bedroom wood flooring right next to the opened branded shoebox",
        subcategories: ['apparel_shoes', 'product_shot']
      }
    ]
  },

  // ==========================================
  // INTERIOR / RESIDENTIAL
  // ==========================================
  interior: {
    pt: [
      {
        title: "Sala residencial real à noite",
        text: "sala de estar residencial real à noite com objetos cotidianos, luminária de chão ligada e televisão desligada ao fundo",
        subcategories: ['living_room', 'residential_interior']
      },
      {
        title: "Quarto vivido com roupas espalhadas",
        text: "quarto vivido com cobertor levemente desalinhado na cama, jaqueta sobre a cadeira e luz suave de abajur",
        subcategories: ['bedroom', 'residential_interior']
      },
      {
        title: "Cozinha com luz solar da janela",
        text: "cozinha residencial durante o dia com luz natural entrando pela janela da pia, louça seca e cafeteira no balcão",
        subcategories: ['kitchen', 'residential_interior']
      },
      {
        title: "Garagem residencial com ferramentas",
        text: "garagem residencial comum com carro estacionado, estantes de ferramentas, caixas e iluminação fluorescente de teto",
        subcategories: ['garage', 'residential_interior']
      }
    ],
    es: [
      {
        title: "Salón de casa real de noche",
        text: "salón residencial real de noche con objetos cotidianos, lámpara de pie encendida e iluminación acogedora normal",
        subcategories: ['living_room', 'residential_interior']
      },
      {
        title: "Dormitorio vivido con ropa natural",
        text: "dormitorio con cama hecha de forma relajada, chaqueta en la silla y luz tenue de mesilla de noche",
        subcategories: ['bedroom', 'residential_interior']
      },
      {
        title: "Cocina con luz natural de día",
        text: "cocina doméstica iluminada por la luz del día a través de la ventana, encimera con cafetera y detalles cotidianos",
        subcategories: ['kitchen', 'residential_interior']
      }
    ],
    en: [
      {
        title: "Suburban living room at night",
        text: "real suburban living room at night with everyday clutter, warm floor lamp on, unposed domestic atmosphere",
        subcategories: ['living_room', 'residential_interior']
      },
      {
        title: "Lived-in bedroom with natural disorder",
        text: "lived-in bedroom with slightly ruffled bed linens, jacket thrown over a chair, warm bedside lamp glow",
        subcategories: ['bedroom', 'residential_interior']
      },
      {
        title: "Daytime kitchen with window sun",
        text: "residential kitchen during the day with natural sunlight streaming through sink window, clean counters with coffee maker",
        subcategories: ['kitchen', 'residential_interior']
      },
      {
        title: "Home garage with tools and storage",
        text: "residential garage with parked car, storage shelving units, tool organizer and typical overhead utility lighting",
        subcategories: ['garage', 'residential_interior']
      }
    ]
  },

  // ==========================================
  // ARCHITECTURE / REAL ESTATE
  // ==========================================
  architecture: {
    pt: [
      {
        title: "Fachada residencial da calçada",
        text: "fachada de casa residencial comum fotografada da calçada em dia levemente nublado com linhas verticais naturais de smartphone",
        subcategories: ['architecture_exterior', 'luxury_home']
      },
      {
        title: "Sala ampla a partir da entrada",
        text: "sala de estar ampla fotografada com câmera grande-angular de celular a partir do hall de entrada, piso de porcelanato",
        subcategories: ['real_estate_interior', 'living_room']
      },
      {
        title: "Piscina através de porta de vidro",
        text: "área externa com deck e piscina vista a partir de dentro através de uma grande porta de correr de vidro",
        subcategories: ['pool_outdoor', 'architecture_exterior']
      },
      {
        title: "Cozinha em perspectiva de smartphone",
        text: "cozinha gourmet com ilha central fotografada em perspectiva realista de smartphone na altura do peito",
        subcategories: ['kitchen', 'real_estate_interior']
      }
    ],
    es: [
      {
        title: "Fachada residencial desde la acera",
        text: "fachada de casa residencial contemporánea fotografiada desde la acera en día claro, perspectiva limpia de móvil",
        subcategories: ['architecture_exterior', 'luxury_home']
      },
      {
        title: "Salón amplio desde el recibidor",
        text: "salón luminoso fotografiado con lente gran angular de smartphone desde la entrada, luz natural de ventanales",
        subcategories: ['real_estate_interior', 'living_room']
      },
      {
        title: "Piscina vista por puerta de cristal",
        text: "terraza exterior con piscina vista a través de gran puerta corredera de vidrio desde el interior",
        subcategories: ['pool_outdoor', 'architecture_exterior']
      }
    ],
    en: [
      {
        title: "Suburban home facade from sidewalk",
        text: "everyday residential home facade shot from the sidewalk on an overcast afternoon, true-to-life smartphone perspective",
        subcategories: ['architecture_exterior', 'luxury_home']
      },
      {
        title: "Open concept living room from foyer",
        text: "wide living space photographed from the entryway with smartphone ultra-wide lens, natural daylight through sliding doors",
        subcategories: ['real_estate_interior', 'living_room']
      },
      {
        title: "Pool patio through sliding glass door",
        text: "outdoor patio and pool deck viewed from inside through clean floor-to-ceiling glass sliding doors",
        subcategories: ['pool_outdoor', 'architecture_exterior']
      },
      {
        title: "Modern kitchen with center island",
        text: "kitchen interior with quartz island and pendant lights photographed from chest height with balanced vertical lines",
        subcategories: ['kitchen', 'real_estate_interior']
      }
    ]
  },

  // ==========================================
  // SPORT / ATHLETIC ACTION
  // ==========================================
  sport: {
    pt: [
      {
        title: "Golfista no momento do impacto",
        text: "golfista no impacto exato do swing, peso transferindo para a perna dianteira, grama voando e luz do meio-dia",
        subcategories: ['sport_action', 'golf_swing']
      },
      {
        title: "Jogador no follow-through do swing",
        text: "jogador no início do follow-through completo de taco de golfe em campo aberto com horizonte natural",
        subcategories: ['sport_action', 'golf_swing']
      },
      {
        title: "Pessoa com raquete após bater na bola",
        text: "pessoa segurando raquete de tênis/beach tennis logo após bater na bola na quadra ao ar livre",
        subcategories: ['sport_action']
      },
      {
        title: "Corrida casual na calçada",
        text: "corrida casual em calçada da orla ou parque fotografada lateralmente com leve motion blur natural",
        subcategories: ['sport_action', 'in_motion']
      }
    ],
    es: [
      {
        title: "Golfista en el impacto del swing",
        text: "golfista en el impacto exacto con la bola, peso transfiriéndose a la pierna delantera y luz de sol directa",
        subcategories: ['sport_action', 'golf_swing']
      },
      {
        title: "Follow-through de swing de golf",
        text: "jugador en el follow-through completo de swing en campo de golf con césped verde y fondo natural",
        subcategories: ['sport_action', 'golf_swing']
      },
      {
        title: "Jugador de tenis tras golpear la bola",
        text: "jugador en pista deportiva exterior con raqueta en mano instantes después de impactar la pelota",
        subcategories: ['sport_action']
      }
    ],
    en: [
      {
        title: "Golfer at impact with weight transfer",
        text: "golfer captured at the exact moment of ball impact, weight transferring to lead leg, tiny grass divot, midday sun",
        subcategories: ['sport_action', 'golf_swing']
      },
      {
        title: "Full golf follow-through finish",
        text: "golfer in full high finish follow-through on open fairway with natural trees and unposed athletic form",
        subcategories: ['sport_action', 'golf_swing']
      },
      {
        title: "Tennis player right after ball strike",
        text: "athlete holding racket immediately after hitting a forehand on an outdoor hard court, candid sports snapshot",
        subcategories: ['sport_action']
      },
      {
        title: "Runner on outdoor sidewalk with subtle blur",
        text: "runner on a paved park pathway captured from the side with subtle natural foot motion blur, handheld phone shot",
        subcategories: ['sport_action', 'in_motion']
      }
    ]
  }
};

// Additive suggestions for when user already typed text in the textarea
const COMPLEMENT_SUGGESTIONS: Record<Language, SuggestionComplement[]> = {
  pt: [
    { label: "Flash direto", appendText: ", flash direto de smartphone ligado" },
    { label: "Luz de entardecer", appendText: ", luz suave e quente de fim de tarde" },
    { label: "Ângulo na altura do peito", appendText: ", capturado na altura do peito" },
    { label: "Sem olhar para a câmera", appendText: ", olhar distraído para o lado sem encarar a lente" },
    { label: "Câmera traseira 1x", appendText: ", câmera traseira 1x de celular com foco nítido" },
    { label: "Lente 0.5x Ultra Wide", appendText: ", lente 0.5x ultra-wide com leve distorção periférica" },
    { label: "Textura crua e sem filtro", appendText: ", sem filtro, textura crua e granulação natural de sensor" },
    { label: "Clutter e detalhes reais", appendText: ", objetos cotidianos e imperfeições reais no ambiente" },
    { label: "Momento do impacto", appendText: ", no momento exato do impacto com transferência de peso" }
  ],
  es: [
    { label: "Flash directo", appendText: ", flash directo de móvil encendido" },
    { label: "Luz de atardecer", appendText: ", luz suave y cálida de atardecer" },
    { label: "A la altura del pecho", appendText: ", capturado a la altura del pecho" },
    { label: "Mirada distraída", appendText: ", mirada distraída hacia un lado sin mirar a la cámara" },
    { label: "Cámara trasera 1x", appendText: ", cámara principal 1x con enfoque natural" },
    { label: "Ultra gran angular 0.5x", appendText: ", lente 0.5x ultra gran angular con sutil distorsión" },
    { label: "Textura cruda sin filtro", appendText: ", sin filtros, textura cruda y grano natural de sensor" },
    { label: "Objetos cotidianos", appendText: ", ambiente vivido con detalles cotidianos reales" }
  ],
  en: [
    { label: "Direct phone flash", appendText: ", on-camera direct phone flash with dark falloff" },
    { label: "Golden hour light", appendText: ", warm natural late afternoon golden hour light" },
    { label: "Chest height angle", appendText: ", framed naturally at chest height" },
    { label: "Looking away casually", appendText: ", looking away from camera, unposed natural glance" },
    { label: "Rear 1x camera", appendText: ", shot on rear 1x main camera, crisp natural depth" },
    { label: "0.5x Ultra-wide", appendText: ", 0.5x ultra-wide phone lens with subtle edge distortion" },
    { label: "Raw unfiltered texture", appendText: ", unfiltered raw smartphone sensor texture with natural grain" },
    { label: "Authentic room clutter", appendText: ", lived-in atmosphere with natural subtle everyday clutter" },
    { label: "Impact moment", appendText: ", at the exact moment of athletic impact with weight shift" }
  ]
};

/**
 * Returns contextual starters dynamically matched to the active modality, type, camera, etc.
 * Never shows incompatible examples (e.g. never shows people when Object/POV is active).
 */
export function getContextualStarters(context: ContextualStarterContext): StarterItem[] {
  const {
    language = 'pt',
    modality = 'person',
    typeId = '',
    cameraMode = 'auto',
    captureProfile = 'auto',
    shuffleKey = 0,
    library = false
  } = context;

  // Determine the semantic starter family first.
  let categoryKey = 'person';
  if (modality === 'vehicle') {
    categoryKey =
      /interior|driver|passenger|seat/i.test(typeId)
        ? 'car_interior'
        : 'vehicle';
  } else if (modality === 'object_pov') {
    categoryKey = /food|table_food/i.test(typeId) ? 'food' : 'object_pov';
  } else if (modality === 'product') {
    categoryKey = /food/i.test(typeId) ? 'food' : 'product';
  } else if (modality === 'architecture') {
    categoryKey = 'architecture';
  } else if (modality === 'interior') {
    categoryKey = 'interior';
  } else if (/sport|golf/i.test(typeId)) {
    categoryKey = 'sport';
  } else if (/food/i.test(typeId)) {
    categoryKey = 'food';
  }

  const categoryPool = STARTERS_BY_CATEGORY[categoryKey] || STARTERS_BY_CATEGORY.person;
  const langList = categoryPool[language] || categoryPool.pt || [];

  // A selected subtype should materially change the suggestions.
  // Score by exact subtype and shared semantic tokens instead of relying on
  // brittle string equality (e.g. car_hood_pov should match car_hood).
  const normalizeTokens = (value: string) =>
    value
      .toLowerCase()
      .replace(/people|person|photo|scene|pov|env|arch/g, ' ')
      .split(/[_\s/-]+/)
      .filter(Boolean);

  const requestedTokens = new Set(normalizeTokens(typeId));
  const scoreItem = (item: { subcategories?: string[] }) => {
    if (!typeId || !item.subcategories?.length) return 0;
    let score = 0;
    for (const sub of item.subcategories) {
      if (sub === typeId) score += 100;
      const subTokens = normalizeTokens(sub);
      for (const tok of subTokens) {
        if (requestedTokens.has(tok)) score += 8;
      }
    }
    return score;
  };

  const ranked = langList
    .map((item, originalIndex) => ({ item, originalIndex, score: scoreItem(item) }))
    .sort((a, b) => b.score - a.score || a.originalIndex - b.originalIndex)
    .map(entry => entry.item);

  // Context suffixes only apply when the user has explicitly selected a
  // non-auto capture behavior. They never override the scene itself.
  const profileSuffix: Partial<Record<CaptureProfile, Record<Language, string>>> = {
    night_flash: {
      pt: ', fotografado com flash direto de celular e fundo naturalmente mais escuro',
      es: ', fotografiado con flash directo de celular y fondo naturalmente más oscuro',
      en: ', shot with direct phone flash and naturally darker background'
    },
    low_light: {
      pt: ', em baixa luz com ruído digital realista de smartphone',
      es: ', con poca luz y ruido digital realista de smartphone',
      en: ', in low light with realistic smartphone digital noise'
    },
    candid: {
      pt: ', capturado de forma espontânea e sem pose',
      es: ', capturado de forma espontánea y sin pose',
      en: ', captured candidly without a posed stance'
    },
    pov: {
      pt: ', em perspectiva POV realista de smartphone',
      es: ', en perspectiva POV realista de smartphone',
      en: ', from a realistic smartphone POV perspective'
    },
    object_pov_raw: {
      pt: ', com textura crua de smartphone e contexto cotidiano ao redor do objeto',
      es: ', con textura cruda de smartphone y contexto cotidiano alrededor del objeto',
      en: ', with raw smartphone texture and everyday context around the object'
    }
  };

  const modeSuffix: Partial<Record<CameraMode, Record<Language, string>>> = {
    rear_ultrawide: {
      pt: ', usando câmera traseira 0.5x com distorção periférica natural',
      es: ', usando cámara trasera 0.5x con distorsión periférica natural',
      en: ', using the rear 0.5x camera with natural edge distortion'
    },
    rear_1x: {
      pt: ', usando câmera traseira principal 1x',
      es: ', usando cámara trasera principal 1x',
      en: ', using the rear main 1x camera'
    },
    rear_2x: {
      pt: ', usando câmera traseira 2x com enquadramento mais fechado',
      es: ', usando cámara trasera 2x con encuadre más cerrado',
      en: ', using the rear 2x camera with tighter framing'
    },
    front_camera: {
      pt: ', usando câmera frontal de smartphone',
      es: ', usando cámara frontal de smartphone',
      en: ', using the smartphone front camera'
    },
    chest_pov: {
      pt: ', com o celular aproximadamente na altura do peito',
      es: ', con el celular aproximadamente a la altura del pecho',
      en: ', with the phone approximately at chest height'
    }
  };

  const suffix =
    (profileSuffix[captureProfile]?.[language] || '') +
    (modeSuffix[cameraMode]?.[language] || '');

  const rotated = library
    ? Object.entries(STARTERS_BY_CATEGORY).flatMap(([sourceCategory, pool]) =>
        (pool[language] || pool.pt || []).map(item => ({
          ...item,
          libraryCategory: sourceCategory
        }))
      )
    : [...ranked];
  if (rotated.length > 1 && shuffleKey > 0) {
    const offset = shuffleKey % rotated.length;
    rotated.push(...rotated.splice(0, offset));
  }

  return (library ? rotated : rotated.slice(0, 4)).map((item: any, idx) => ({
    id: `starter_${item.libraryCategory || categoryKey}_${typeId || 'general'}_${idx}_${shuffleKey}`,
    title: item.title,
    promptText: `${item.text}${suffix}`,
    categoryTag: (item.libraryCategory || categoryKey).toUpperCase().replace('_', ' ')
  }));
}

/**
 * Returns intelligent suggestions to append to an in-progress user idea.
 */
export function getIntelligentComplements(language: Language): SuggestionComplement[] {
  return COMPLEMENT_SUGGESTIONS[language] || COMPLEMENT_SUGGESTIONS['pt'];
}
