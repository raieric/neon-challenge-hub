export interface Question {
  id: string;
  text: string;
  answer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  used?: boolean;
}

export const categories = [
  'Geography',
  'World History',
  'Nepalese History',
  'Nepal General Knowledge',
  'Programming',
  'Coding',
  'Robotics',
  'Artificial Intelligence',
  'Emerging Technology',
  'Science & Technology',
  'Current Affairs',
] as const;

export type Category = typeof categories[number];

export const roundTypes = [
  'Rapid Fire Round',
  'Topic Selection Round',
  'Buzzer Round',
  'General Knowledge Round',
  'Tie-Breaker Round',
] as const;

export type RoundType = typeof roundTypes[number];

export const sampleQuestions: Question[] = [
  // Geography
  { id: 'geo-1', text: 'What is the largest continent by area?', answer: 'Asia', category: 'Geography', difficulty: 'easy' },
  { id: 'geo-2', text: 'Which river is the longest in the world?', answer: 'Nile River', category: 'Geography', difficulty: 'easy' },
  { id: 'geo-3', text: 'What is the smallest country in the world?', answer: 'Vatican City', category: 'Geography', difficulty: 'easy' },
  { id: 'geo-4', text: 'Name the deepest ocean trench on Earth.', answer: 'Mariana Trench', category: 'Geography', difficulty: 'medium' },
  { id: 'geo-5', text: 'Which country has the most natural lakes?', answer: 'Canada', category: 'Geography', difficulty: 'medium' },
  { id: 'geo-6', text: 'What is the driest desert in the world?', answer: 'Atacama Desert', category: 'Geography', difficulty: 'hard' },

  // World History
  { id: 'wh-1', text: 'In which year did World War II end?', answer: '1945', category: 'World History', difficulty: 'easy' },
  { id: 'wh-2', text: 'Who was the first person to walk on the Moon?', answer: 'Neil Armstrong', category: 'World History', difficulty: 'easy' },
  { id: 'wh-3', text: 'What ancient civilization built the pyramids at Giza?', answer: 'Ancient Egyptians', category: 'World History', difficulty: 'easy' },
  { id: 'wh-4', text: 'Who invented the printing press?', answer: 'Johannes Gutenberg', category: 'World History', difficulty: 'medium' },
  { id: 'wh-5', text: 'What year did the Berlin Wall fall?', answer: '1989', category: 'World History', difficulty: 'medium' },
  { id: 'wh-6', text: 'Name the treaty that ended World War I.', answer: 'Treaty of Versailles', category: 'World History', difficulty: 'hard' },

  // Nepalese History
  { id: 'nh-1', text: 'Who unified modern Nepal?', answer: 'Prithvi Narayan Shah', category: 'Nepalese History', difficulty: 'easy' },
  { id: 'nh-2', text: 'In which year was Nepal declared a federal democratic republic?', answer: '2008', category: 'Nepalese History', difficulty: 'easy' },
  { id: 'nh-3', text: 'What was the Rana regime in Nepal?', answer: 'A hereditary prime ministerial system that ruled Nepal from 1846 to 1951', category: 'Nepalese History', difficulty: 'medium' },
  { id: 'nh-4', text: 'Who was the first king of the Shah dynasty?', answer: 'Dravya Shah', category: 'Nepalese History', difficulty: 'medium' },
  { id: 'nh-5', text: 'What significant event happened in Nepal on Jestha 1, 2058 BS?', answer: 'The Royal Massacre', category: 'Nepalese History', difficulty: 'hard' },
  { id: 'nh-6', text: 'When was the Sugauli Treaty signed?', answer: '1816', category: 'Nepalese History', difficulty: 'hard' },

  // Nepal General Knowledge
  { id: 'ngk-1', text: 'What is the national flower of Nepal?', answer: 'Rhododendron (Laligurans)', category: 'Nepal General Knowledge', difficulty: 'easy' },
  { id: 'ngk-2', text: 'How many provinces does Nepal have?', answer: '7', category: 'Nepal General Knowledge', difficulty: 'easy' },
  { id: 'ngk-3', text: 'What is the highest peak in Nepal?', answer: 'Mount Everest (Sagarmatha)', category: 'Nepal General Knowledge', difficulty: 'easy' },
  { id: 'ngk-4', text: 'Name the birthplace of Gautam Buddha in Nepal.', answer: 'Lumbini', category: 'Nepal General Knowledge', difficulty: 'easy' },
  { id: 'ngk-5', text: 'What is the national animal of Nepal?', answer: 'Cow', category: 'Nepal General Knowledge', difficulty: 'medium' },
  { id: 'ngk-6', text: 'Which is the largest lake in Nepal?', answer: 'Rara Lake', category: 'Nepal General Knowledge', difficulty: 'medium' },

  // Programming
  { id: 'prog-1', text: 'What does HTML stand for?', answer: 'HyperText Markup Language', category: 'Programming', difficulty: 'easy' },
  { id: 'prog-2', text: 'What is the time complexity of binary search?', answer: 'O(log n)', category: 'Programming', difficulty: 'medium' },
  { id: 'prog-3', text: 'What is a pointer in C programming?', answer: 'A variable that stores the memory address of another variable', category: 'Programming', difficulty: 'medium' },
  { id: 'prog-4', text: 'What is polymorphism in OOP?', answer: 'The ability of objects to take many forms; same interface, different implementations', category: 'Programming', difficulty: 'medium' },
  { id: 'prog-5', text: 'What data structure uses FIFO (First In, First Out)?', answer: 'Queue', category: 'Programming', difficulty: 'easy' },
  { id: 'prog-6', text: 'What is the difference between stack and heap memory?', answer: 'Stack is for static allocation (function calls), heap is for dynamic allocation', category: 'Programming', difficulty: 'hard' },

  // Coding
  { id: 'code-1', text: 'What will print(2**3) output in Python?', answer: '8', category: 'Coding', difficulty: 'easy' },
  { id: 'code-2', text: 'What is the output of: console.log(typeof NaN) in JavaScript?', answer: 'number', category: 'Coding', difficulty: 'medium' },
  { id: 'code-3', text: 'What keyword is used to define a function in Python?', answer: 'def', category: 'Coding', difficulty: 'easy' },
  { id: 'code-4', text: 'What does SQL stand for?', answer: 'Structured Query Language', category: 'Coding', difficulty: 'easy' },
  { id: 'code-5', text: 'What is a segmentation fault in C?', answer: 'An error caused by accessing memory that does not belong to the program', category: 'Coding', difficulty: 'medium' },
  { id: 'code-6', text: 'What is the output of: print("Hello"[1]) in Python?', answer: 'e', category: 'Coding', difficulty: 'easy' },

  // Robotics
  { id: 'rob-1', text: 'What does the acronym ROS stand for in robotics?', answer: 'Robot Operating System', category: 'Robotics', difficulty: 'medium' },
  { id: 'rob-2', text: 'What sensor is used to measure distance in robots?', answer: 'Ultrasonic sensor', category: 'Robotics', difficulty: 'easy' },
  { id: 'rob-3', text: 'What is an actuator in robotics?', answer: 'A component that converts energy into physical motion', category: 'Robotics', difficulty: 'medium' },
  { id: 'rob-4', text: 'What programming language is commonly used with Arduino?', answer: 'C/C++', category: 'Robotics', difficulty: 'easy' },
  { id: 'rob-5', text: 'What is inverse kinematics?', answer: 'Computing joint angles needed to achieve a desired end-effector position', category: 'Robotics', difficulty: 'hard' },

  // Artificial Intelligence
  { id: 'ai-1', text: 'What does AI stand for?', answer: 'Artificial Intelligence', category: 'Artificial Intelligence', difficulty: 'easy' },
  { id: 'ai-2', text: 'What is a neural network?', answer: 'A computing system inspired by biological neurons that learns from data', category: 'Artificial Intelligence', difficulty: 'medium' },
  { id: 'ai-3', text: 'What does GPT stand for?', answer: 'Generative Pre-trained Transformer', category: 'Artificial Intelligence', difficulty: 'medium' },
  { id: 'ai-4', text: 'What is the Turing Test?', answer: 'A test to determine if a machine can exhibit intelligent behavior indistinguishable from a human', category: 'Artificial Intelligence', difficulty: 'medium' },
  { id: 'ai-5', text: 'What is overfitting in machine learning?', answer: 'When a model learns training data too well and performs poorly on new data', category: 'Artificial Intelligence', difficulty: 'hard' },
  { id: 'ai-6', text: 'Who is considered the father of Artificial Intelligence?', answer: 'John McCarthy', category: 'Artificial Intelligence', difficulty: 'medium' },

  // Emerging Technology
  { id: 'et-1', text: 'What does IoT stand for?', answer: 'Internet of Things', category: 'Emerging Technology', difficulty: 'easy' },
  { id: 'et-2', text: 'What is blockchain technology?', answer: 'A decentralized, distributed digital ledger that records transactions', category: 'Emerging Technology', difficulty: 'medium' },
  { id: 'et-3', text: 'What is quantum computing?', answer: 'Computing using quantum bits (qubits) that can exist in multiple states simultaneously', category: 'Emerging Technology', difficulty: 'hard' },
  { id: 'et-4', text: 'What does 5G stand for?', answer: 'Fifth Generation (of mobile networks)', category: 'Emerging Technology', difficulty: 'easy' },
  { id: 'et-5', text: 'What is edge computing?', answer: 'Processing data near the source rather than in a centralized data center', category: 'Emerging Technology', difficulty: 'medium' },

  // Science & Technology
  { id: 'st-1', text: 'What is the speed of light in vacuum?', answer: 'Approximately 3 × 10⁸ meters per second', category: 'Science & Technology', difficulty: 'medium' },
  { id: 'st-2', text: 'What planet is known as the Red Planet?', answer: 'Mars', category: 'Science & Technology', difficulty: 'easy' },
  { id: 'st-3', text: 'What is the chemical formula for water?', answer: 'H₂O', category: 'Science & Technology', difficulty: 'easy' },
  { id: 'st-4', text: 'Who developed the theory of relativity?', answer: 'Albert Einstein', category: 'Science & Technology', difficulty: 'easy' },
  { id: 'st-5', text: 'What is CRISPR used for?', answer: 'Gene editing / modifying DNA sequences', category: 'Science & Technology', difficulty: 'hard' },

  // Current Affairs
  { id: 'ca-1', text: 'Which country hosted the 2022 FIFA World Cup?', answer: 'Qatar', category: 'Current Affairs', difficulty: 'easy' },
  { id: 'ca-2', text: 'What is the full form of UNESCO?', answer: 'United Nations Educational, Scientific and Cultural Organization', category: 'Current Affairs', difficulty: 'medium' },
  { id: 'ca-3', text: 'Who is the current Secretary-General of the United Nations (as of 2024)?', answer: 'António Guterres', category: 'Current Affairs', difficulty: 'medium' },
  { id: 'ca-4', text: 'What does SDG stand for?', answer: 'Sustainable Development Goals', category: 'Current Affairs', difficulty: 'easy' },
  { id: 'ca-5', text: 'Which country launched the Chandrayaan-3 mission?', answer: 'India', category: 'Current Affairs', difficulty: 'easy' },
];
