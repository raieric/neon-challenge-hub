import { QuizQuestion } from "./cQuestions";

const pythonQuestions: QuizQuestion[] = [
  { id: 1, question: "How do you print text in Python?", options: ["echo()", "printf()", "print()", "console.log()"], correct: 2, explanation: "print() is the built-in function for output in Python." },
  { id: 2, question: "Which keyword defines a function?", options: ["function", "func", "def", "fn"], correct: 2, explanation: "'def' keyword is used to define a function in Python." },
  { id: 3, question: "How are code blocks defined in Python?", options: ["Curly braces", "Parentheses", "Indentation", "Semicolons"], correct: 2, explanation: "Python uses indentation (whitespace) to define code blocks." },
  { id: 4, question: "Which data type is immutable?", options: ["list", "dict", "tuple", "set"], correct: 2, explanation: "Tuples are immutable — their elements cannot be changed after creation." },
  { id: 5, question: "What does `len()` return?", options: ["Last element", "Number of elements", "First element", "Data type"], correct: 1, explanation: "len() returns the number of items in a sequence or collection." },
  { id: 6, question: "How do you create a list?", options: ["(1,2,3)", "[1,2,3]", "{1,2,3}", "<1,2,3>"], correct: 1, explanation: "Square brackets [] create a list in Python." },
  { id: 7, question: "What does `append()` do?", options: ["Removes last item", "Adds to end of list", "Sorts the list", "Reverses the list"], correct: 1, explanation: "append() adds a single element to the end of a list." },
  { id: 8, question: "Which operator checks membership?", options: ["has", "contains", "in", "exists"], correct: 2, explanation: "'in' checks if a value exists in a sequence: 'x in list'." },
  { id: 9, question: "What is a dictionary?", options: ["Ordered list", "Key-value store", "Set of unique values", "Character array"], correct: 1, explanation: "A dictionary stores data as key-value pairs using curly braces {}." },
  { id: 10, question: "What does `range(5)` produce?", options: ["1 to 5", "0 to 5", "0 to 4", "1 to 4"], correct: 2, explanation: "range(5) produces numbers 0, 1, 2, 3, 4 (0 inclusive, 5 exclusive)." },
  { id: 11, question: "Which keyword handles exceptions?", options: ["catch", "except", "handle", "rescue"], correct: 1, explanation: "try/except blocks handle exceptions in Python." },
  { id: 12, question: "What is a list comprehension?", options: ["A loop", "Compact way to create lists", "A function", "An import"], correct: 1, explanation: "List comprehension creates lists concisely: [x for x in range(5)]." },
  { id: 13, question: "What does `self` refer to?", options: ["The class", "The current instance", "A global variable", "The parent class"], correct: 1, explanation: "'self' refers to the current instance of the class in methods." },
  { id: 14, question: "Which keyword creates a class?", options: ["struct", "object", "class", "type"], correct: 2, explanation: "The 'class' keyword defines a new class in Python." },
  { id: 15, question: "What is `None` in Python?", options: ["Zero", "Empty string", "Null/no value", "False"], correct: 2, explanation: "None represents the absence of a value (similar to null in other languages)." },
  { id: 16, question: "How do you import a module?", options: ["include module", "require module", "import module", "#include module"], correct: 2, explanation: "'import module_name' loads a module for use in your code." },
  { id: 17, question: "What does `strip()` do to a string?", options: ["Deletes it", "Removes whitespace from ends", "Converts to list", "Reverses it"], correct: 1, explanation: "strip() removes leading and trailing whitespace from a string." },
  { id: 18, question: "What is `pip`?", options: ["Python IDE", "Package manager", "Debugger", "Compiler"], correct: 1, explanation: "pip is Python's package installer for downloading and managing libraries." },
  { id: 19, question: "What does `//` operator do?", options: ["Comment", "Float division", "Floor division", "Exponent"], correct: 2, explanation: "// performs floor division, returning the integer part of the quotient." },
  { id: 20, question: "What is a lambda function?", options: ["Named function", "Anonymous single-expression function", "Class method", "Generator"], correct: 1, explanation: "lambda creates small anonymous functions: lambda x: x + 1." },
];

export default pythonQuestions;
