// Vocabulario organizado por categorías para el juego de memoria

export interface WordPair {
  id: number;
  english: string;
  spanish: string;
  emoji: string;
  category: string;
}

export const vocabulary: Record<string, WordPair[]> = {
  animals: [
    { id: 1, english: "Cat", spanish: "Gato", emoji: "🐱", category: "animals" },
    { id: 2, english: "Dog", spanish: "Perro", emoji: "🐶", category: "animals" },
    { id: 3, english: "Bird", spanish: "Pájaro", emoji: "🐦", category: "animals" },
    { id: 4, english: "Fish", spanish: "Pez", emoji: "🐟", category: "animals" },
    { id: 5, english: "Rabbit", spanish: "Conejo", emoji: "🐰", category: "animals" },
    { id: 6, english: "Bear", spanish: "Oso", emoji: "🐻", category: "animals" },
    { id: 7, english: "Lion", spanish: "León", emoji: "🦁", category: "animals" },
    { id: 8, english: "Elephant", spanish: "Elefante", emoji: "🐘", category: "animals" },
  ],
  
  household: [
    { id: 11, english: "House", spanish: "Casa", emoji: "🏠", category: "household" },
    { id: 12, english: "Door", spanish: "Puerta", emoji: "🚪", category: "household" },
    { id: 13, english: "Window", spanish: "Ventana", emoji: "🪟", category: "household" },
    { id: 14, english: "Chair", spanish: "Silla", emoji: "🪑", category: "household" },
    { id: 15, english: "Table", spanish: "Mesa", emoji: "🪑", category: "household" },
    { id: 16, english: "Bed", spanish: "Cama", emoji: "🛏️", category: "household" },
    { id: 17, english: "Lamp", spanish: "Lámpara", emoji: "💡", category: "household" },
    { id: 18, english: "Clock", spanish: "Reloj", emoji: "🕐", category: "household" },
  ],

  transportation: [
    { id: 21, english: "Car", spanish: "Carro", emoji: "🚗", category: "transportation" },
    { id: 22, english: "Bus", spanish: "Autobús", emoji: "🚌", category: "transportation" },
    { id: 23, english: "Train", spanish: "Tren", emoji: "🚂", category: "transportation" },
    { id: 24, english: "Airplane", spanish: "Avión", emoji: "✈️", category: "transportation" },
    { id: 25, english: "Bicycle", spanish: "Bicicleta", emoji: "🚲", category: "transportation" },
    { id: 26, english: "Boat", spanish: "Barco", emoji: "🚢", category: "transportation" },
    { id: 27, english: "Motorcycle", spanish: "Motocicleta", emoji: "🏍️", category: "transportation" },
    { id: 28, english: "Helicopter", spanish: "Helicóptero", emoji: "🚁", category: "transportation" },
  ],

  nature: [
    { id: 31, english: "Tree", spanish: "Árbol", emoji: "🌳", category: "nature" },
    { id: 32, english: "Flower", spanish: "Flor", emoji: "🌸", category: "nature" },
    { id: 33, english: "Sun", spanish: "Sol", emoji: "☀️", category: "nature" },
    { id: 34, english: "Moon", spanish: "Luna", emoji: "🌙", category: "nature" },
    { id: 35, english: "Star", spanish: "Estrella", emoji: "⭐", category: "nature" },
    { id: 36, english: "Cloud", spanish: "Nube", emoji: "☁️", category: "nature" },
    { id: 37, english: "Rain", spanish: "Lluvia", emoji: "🌧️", category: "nature" },
    { id: 38, english: "Mountain", spanish: "Montaña", emoji: "⛰️", category: "nature" },
  ],

  food: [
    { id: 41, english: "Apple", spanish: "Manzana", emoji: "🍎", category: "food" },
    { id: 42, english: "Banana", spanish: "Plátano", emoji: "🍌", category: "food" },
    { id: 43, english: "Orange", spanish: "Naranja", emoji: "🍊", category: "food" },
    { id: 44, english: "Bread", spanish: "Pan", emoji: "🍞", category: "food" },
    { id: 45, english: "Milk", spanish: "Leche", emoji: "🥛", category: "food" },
    { id: 46, english: "Cheese", spanish: "Queso", emoji: "🧀", category: "food" },
    { id: 47, english: "Pizza", spanish: "Pizza", emoji: "🍕", category: "food" },
    { id: 48, english: "Cake", spanish: "Pastel", emoji: "🎂", category: "food" },
  ],

  school: [
    { id: 51, english: "Book", spanish: "Libro", emoji: "📚", category: "school" },
    { id: 52, english: "Pencil", spanish: "Lápiz", emoji: "✏️", category: "school" },
    { id: 53, english: "Pen", spanish: "Bolígrafo", emoji: "🖊️", category: "school" },
    { id: 54, english: "Paper", spanish: "Papel", emoji: "📄", category: "school" },
    { id: 55, english: "Backpack", spanish: "Mochila", emoji: "🎒", category: "school" },
    { id: 56, english: "Computer", spanish: "Computadora", emoji: "💻", category: "school" },
    { id: 57, english: "Calculator", spanish: "Calculadora", emoji: "🧮", category: "school" },
    { id: 58, english: "Globe", spanish: "Globo terráqueo", emoji: "🌍", category: "school" },
  ],
};

// Función para obtener palabras aleatorias de una categoría específica
export function getRandomWordsFromCategory(category: string, count: number): WordPair[] {
  const categoryWords = vocabulary[category] || [];
  const shuffled = [...categoryWords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, categoryWords.length));
}

// Función para obtener palabras aleatorias de todas las categorías
export function getRandomWordsFromAll(count: number): WordPair[] {
  const allWords = Object.values(vocabulary).flat();
  const shuffled = [...allWords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, allWords.length));
}

// Función para obtener palabras mixtas de múltiples categorías
export function getMixedWords(categories: string[], wordsPerCategory: number): WordPair[] {
  const words: WordPair[] = [];
  
  categories.forEach(category => {
    const categoryWords = getRandomWordsFromCategory(category, wordsPerCategory);
    words.push(...categoryWords);
  });
  
  return words.sort(() => Math.random() - 0.5);
}

// Configuración de niveles mejorada
export const levelConfigs = {
  easy: {
    wordsCount: 4,
    timeLimit: 120,
    categories: ['animals', 'household'],
    gridCols: 4,
    description: '4 parejas • Animales y hogar • 2 minutos',
  },
  medium: {
    wordsCount: 6,
    timeLimit: 180,
    categories: ['animals', 'household', 'food'],
    gridCols: 4,
    description: '6 parejas • Animales, hogar y comida • 3 minutos',
  },
  hard: {
    wordsCount: 8,
    timeLimit: 240,
    categories: ['animals', 'household', 'food', 'transportation'],
    gridCols: 4,
    description: '8 parejas • Múltiples categorías • 4 minutos',
  },
  expert: {
    wordsCount: 10,
    timeLimit: 300,
    categories: ['animals', 'household', 'food', 'transportation', 'nature', 'school'],
    gridCols: 5,
    description: '10 parejas • Todas las categorías • 5 minutos',
  },
};

// Función para obtener palabras según la configuración del nivel
export function getWordsForLevel(level: keyof typeof levelConfigs): WordPair[] {
  const config = levelConfigs[level];
  return getMixedWords(config.categories, Math.ceil(config.wordsCount / config.categories.length));
}
