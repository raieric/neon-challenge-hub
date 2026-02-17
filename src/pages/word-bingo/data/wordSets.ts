export interface WordSet {
  name: string;
  icon: string;
  words: string[];
}

export const wordSets: WordSet[] = [
  {
    name: "C Programming",
    icon: "🟢",
    words: [
      "int", "float", "printf", "scanf", "pointer", "array", "function", "loop",
      "if", "else", "struct", "break", "continue", "return", "sizeof", "switch",
      "case", "typedef", "header file", "main", "recursion", "variable", "operator",
      "constant", "argument", "parameter", "logical AND", "logical OR", "char",
      "double", "void", "enum", "union", "malloc", "calloc", "free", "realloc",
      "static", "extern", "register", "volatile", "signed", "unsigned", "short",
      "long", "do while", "for loop", "while loop", "goto", "ternary", "bitwise",
      "increment", "decrement", "modulus", "preprocessor", "macro", "define",
      "include", "stdio", "stdlib", "string.h", "math.h", "NULL", "EOF",
      "fopen", "fclose", "fprintf", "fscanf", "fgets", "fputs", "getchar", "putchar",
    ],
  },
  {
    name: "Java",
    icon: "🟡",
    words: [
      "class", "object", "interface", "abstract", "extends", "implements", "public",
      "private", "protected", "static", "final", "void", "int", "String", "boolean",
      "double", "float", "char", "byte", "short", "long", "new", "this", "super",
      "return", "if", "else", "switch", "case", "for", "while", "do", "break",
      "continue", "try", "catch", "finally", "throw", "throws", "import", "package",
      "enum", "instanceof", "null", "true", "false", "ArrayList", "HashMap",
      "LinkedList", "HashSet", "Iterator", "Collections", "Arrays", "Thread",
      "Runnable", "synchronized", "volatile", "lambda", "stream", "Optional",
      "override", "overload", "constructor", "getter", "setter", "encapsulation",
      "inheritance", "polymorphism", "JVM", "JDK", "JRE", "garbage collector",
    ],
  },
  {
    name: "Python",
    icon: "🟢",
    words: [
      "def", "class", "import", "from", "print", "input", "if", "elif", "else",
      "for", "while", "break", "continue", "return", "pass", "lambda", "try",
      "except", "finally", "raise", "with", "as", "yield", "global", "nonlocal",
      "True", "False", "None", "and", "or", "not", "in", "is", "del", "assert",
      "list", "tuple", "dict", "set", "str", "int", "float", "bool", "range",
      "len", "type", "isinstance", "enumerate", "zip", "map", "filter", "reduce",
      "sorted", "reversed", "append", "extend", "pop", "remove", "slice",
      "comprehension", "decorator", "generator", "iterator", "self", "init",
      "pip", "venv", "module", "package", "f-string", "format", "split", "join",
    ],
  },
];
