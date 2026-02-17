import { QuizQuestion } from "./cQuestions";

const javaQuestions: QuizQuestion[] = [
  { id: 1, question: "Which keyword is used to define a class in Java?", options: ["struct", "class", "define", "object"], correct: 1, explanation: "The 'class' keyword defines a new class in Java." },
  { id: 2, question: "What is the entry point of a Java program?", options: ["start()", "main()", "run()", "init()"], correct: 1, explanation: "public static void main(String[] args) is the entry point." },
  { id: 3, question: "Which data type is used for true/false values?", options: ["int", "char", "boolean", "bit"], correct: 2, explanation: "boolean stores true or false values in Java." },
  { id: 4, question: "What does `System.out.println()` do?", options: ["Reads input", "Prints with newline", "Prints without newline", "Throws error"], correct: 1, explanation: "println() prints text followed by a newline character." },
  { id: 5, question: "Which keyword creates an object?", options: ["create", "new", "make", "alloc"], correct: 1, explanation: "The 'new' keyword allocates memory and creates an object." },
  { id: 6, question: "What is inheritance in Java?", options: ["Copying code", "A class acquiring properties of another", "Memory sharing", "Variable aliasing"], correct: 1, explanation: "Inheritance allows a child class to inherit fields and methods from a parent." },
  { id: 7, question: "Which keyword is used for inheritance?", options: ["inherits", "extends", "implements", "super"], correct: 1, explanation: "'extends' is used when a class inherits from another class." },
  { id: 8, question: "What is an interface?", options: ["A class with only abstract methods", "A concrete class", "A variable type", "A package"], correct: 0, explanation: "An interface defines method signatures without implementations (prior to Java 8)." },
  { id: 9, question: "What does `final` keyword do to a variable?", options: ["Deletes it", "Makes it constant", "Makes it global", "Makes it private"], correct: 1, explanation: "A final variable cannot be reassigned after initialization." },
  { id: 10, question: "What is polymorphism?", options: ["Many variables", "Many forms of a method", "Many classes", "Many packages"], correct: 1, explanation: "Polymorphism allows methods to behave differently based on the object calling them." },
  { id: 11, question: "Which exception is thrown for null reference?", options: ["IOException", "NullPointerException", "ArrayException", "TypeError"], correct: 1, explanation: "NullPointerException occurs when accessing a member of a null reference." },
  { id: 12, question: "What is an ArrayList?", options: ["Fixed-size array", "Resizable array", "Linked list", "Hash map"], correct: 1, explanation: "ArrayList is a dynamic array that can grow and shrink in size." },
  { id: 13, question: "Which access modifier allows access only within the class?", options: ["public", "protected", "private", "default"], correct: 2, explanation: "private restricts access to only the declaring class." },
  { id: 14, question: "What does `static` mean?", options: ["Instance-level", "Class-level (shared)", "Local only", "Constant"], correct: 1, explanation: "static members belong to the class rather than any specific instance." },
  { id: 15, question: "What is a constructor?", options: ["A destructor", "Method to initialize objects", "Loop type", "Variable declaration"], correct: 1, explanation: "A constructor initializes an object when it is created with 'new'." },
  { id: 16, question: "What keyword handles exceptions?", options: ["handle", "try", "catch", "try-catch"], correct: 3, explanation: "try-catch blocks are used together to handle exceptions." },
  { id: 17, question: "What does `this` refer to?", options: ["Parent class", "Current object", "Static context", "Package"], correct: 1, explanation: "'this' refers to the current instance of the class." },
  { id: 18, question: "What is method overloading?", options: ["Same name, different parameters", "Same name, same parameters", "Different name", "Overriding a method"], correct: 0, explanation: "Overloading means multiple methods with the same name but different parameter lists." },
  { id: 19, question: "What is the default value of an int in Java?", options: ["null", "0", "undefined", "-1"], correct: 1, explanation: "Instance int variables default to 0 in Java." },
  { id: 20, question: "Which collection stores key-value pairs?", options: ["ArrayList", "HashSet", "HashMap", "LinkedList"], correct: 2, explanation: "HashMap stores data as key-value pairs with O(1) average lookup." },
];

export default javaQuestions;
