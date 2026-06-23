export type Professional = {
  id: string;
  name: string;
  title: string;
  bio: string;
  specialty: string;
  location: string;
  modality: string;
  price: number;
  isPremium: boolean;
  image: string;
};

export const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: "1",
    name: "Dra. Ana López",
    title: "Nutrióloga clínica",
    bio:
      "Especialista en nutrición clínica y planes de alimentación personalizados. Más de 10 años de experiencia ayudando a pacientes a alcanzar sus objetivos de salud.",
    specialty: "Nutrición",
    location: "Ciudad de México",
    modality: "Online / Presencial",
    price: 800,
    isPremium: true,
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "2",
    name: "Carlos Ruiz",
    title: "Entrenador personal",
    bio:
      "Diseño de rutinas de entrenamiento adaptadas a tu somatotipo y objetivos. Certificado en entrenamiento funcional y rehabilitación.",
    specialty: "Entrenamiento",
    location: "Guadalajara",
    modality: "Online",
    price: 600,
    isPremium: false,
    image:
      "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "3",
    name: "Dra. María Torres",
    title: "Nutrióloga deportiva",
    bio:
      "Nutrióloga enfocada en rendimiento deportivo y composición corporal. Acompañamiento profesional para atletas y aficionados.",
    specialty: "Nutrición",
    location: "Monterrey",
    modality: "Presencial",
    price: 950,
    isPremium: true,
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "4",
    name: "Luis Hernández",
    title: "Preparador físico",
    bio:
      "Especialista en preparación física para deportistas y personas que buscan mejorar su condición. Enfoque en técnica y prevención de lesiones.",
    specialty: "Entrenamiento",
    location: "Ciudad de México",
    modality: "Presencial",
    price: 700,
    isPremium: false,
    image:
      "https://images.unsplash.com/photo-1597347343908-2937e7dcc560?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "5",
    name: "Dra. Sofía Méndez",
    title: "Nutrióloga pediátrica",
    bio:
      "Nutrióloga especializada en alimentación infantil y adolescente. Apoyo a familias para crear hábitos saludables desde la infancia.",
    specialty: "Nutrición",
    location: "Puebla",
    modality: "Online",
    price: 850,
    isPremium: true,
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "6",
    name: "Diego Castillo",
    title: "Entrenador de fuerza",
    bio:
      "Entrenador especializado en hipertrofia y fuerza. Diseño de planes progresivos según tu nivel y disponibilidad.",
    specialty: "Entrenamiento",
    location: "Querétaro",
    modality: "Online / Presencial",
    price: 650,
    isPremium: false,
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "7",
    name: "Dra. Fernanda Vega",
    title: "Nutrióloga oncológica",
    bio:
      "Atención nutricional especializada en pacientes oncológicos y personas con condiciones crónicas.",
    specialty: "Nutrición",
    location: "Guadalajara",
    modality: "Online / Presencial",
    price: 900,
    isPremium: true,
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "8",
    name: "Ricardo Mendoza",
    title: "Entrenador de running",
    bio:
      "Preparación física para corredores de todos los niveles. Planes de entrenamiento para 5K, 10K, medio maratón y maratón.",
    specialty: "Entrenamiento",
    location: "Monterrey",
    modality: "Online",
    price: 550,
    isPremium: false,
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "9",
    name: "Dra. Camila Herrera",
    title: "Nutrióloga vegana",
    bio:
      "Asesoría nutricional basada en plantas. Planes personalizados para vegetarianos, veganos y personas que buscan reducir el consumo de carne.",
    specialty: "Nutrición",
    location: "Ciudad de México",
    modality: "Online",
    price: 750,
    isPremium: true,
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "10",
    name: "Andrés Navarro",
    title: "Fisioterapeuta deportivo",
    bio:
      "Rehabilitación y prevención de lesiones deportivas. Trabajo conjunto con entrenadores para retorno seguro a la actividad.",
    specialty: "Entrenamiento",
    location: "Puebla",
    modality: "Presencial",
    price: 700,
    isPremium: true,
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&h=400&q=80",
  },
];
