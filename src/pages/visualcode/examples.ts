import { Language } from './interpreter';

export interface CodeExample {
  name: string;
  language: Language;
  code: string;
  description: string;
}

export const examples: CodeExample[] = [
  // ═══════════════════════════════════
  // PYTHON EXAMPLES
  // ═══════════════════════════════════
  {
    name: 'Variables & Types',
    language: 'python',
    description: 'Basic variable assignments and types',
    code: `name = "Alice"
age = 25
height = 5.6
is_student = True

print(name)
print(age)
print(height)
print(is_student)`,
  },
  {
    name: 'If-Elif-Else',
    language: 'python',
    description: 'Multi-branch conditional logic',
    code: `score = 75

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(grade)`,
  },
  {
    name: 'Nested Conditions',
    language: 'python',
    description: 'Conditions inside conditions',
    code: `x = 15

if x > 0:
    if x > 10:
        print("Greater than 10")
    else:
        print("Between 1 and 10")
else:
    print("Non-positive")

print("Done")`,
  },
  {
    name: 'While Loop',
    language: 'python',
    description: 'Counting with while loop',
    code: `count = 1
total = 0

while count <= 5:
    total += count
    print(total)
    count += 1

print(total)`,
  },
  {
    name: 'For Loop & Range',
    language: 'python',
    description: 'Iterating with for loop',
    code: `for i in range(1, 6):
    print(i * i)

total = 0
for i in range(1, 11):
    total += i

print(total)`,
  },
  {
    name: 'Nested Loops',
    language: 'python',
    description: 'Multiplication table pattern',
    code: `for i in range(1, 4):
    for j in range(1, 4):
        result = i * j
        print(result)
    print("---")`,
  },
  {
    name: 'List Operations',
    language: 'python',
    description: 'Creating and modifying lists',
    code: `fruits = ["apple", "banana", "cherry"]
print(fruits)

fruits.append("date")
print(fruits)
print(len(fruits))

first = fruits[0]
last = fruits[3]
print(first)
print(last)`,
  },
  {
    name: 'List with Loops',
    language: 'python',
    description: 'Processing list elements',
    code: `numbers = [4, 2, 7, 1, 9, 3]
n = len(numbers)

total = 0
for i in range(n):
    total += numbers[i]
    print(numbers[i])

average = total / n
print(average)`,
  },
  {
    name: 'Functions',
    language: 'python',
    description: 'Defining and calling functions',
    code: `def greet(name):
    print(name)

def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

greet("Alice")
result = add(3, 5)
print(result)
product = multiply(4, 6)
print(product)`,
  },
  {
    name: 'Factorial (Recursion)',
    language: 'python',
    description: 'Recursive function call',
    code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

result = factorial(5)
print(result)`,
  },
  {
    name: 'Fibonacci',
    language: 'python',
    description: 'Fibonacci sequence with recursion',
    code: `def fib(n):
    if n <= 0:
        return 0
    if n == 1:
        return 1
    return fib(n - 1) + fib(n - 2)

for i in range(8):
    print(fib(i))`,
  },
  {
    name: 'Bubble Sort',
    language: 'python',
    description: 'Sorting algorithm visualization',
    code: `arr = [5, 3, 8, 1, 2]
n = len(arr)

for i in range(n):
    for j in range(n - 1):
        if arr[j] > arr[j + 1]:
            temp = arr[j]
            arr[j] = arr[j + 1]
            arr[j + 1] = temp

print(arr)`,
  },
  {
    name: 'Linear Search',
    language: 'python',
    description: 'Searching in a list',
    code: `def search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

numbers = [10, 25, 30, 45, 60]
pos = search(numbers, 30)
print(pos)

pos2 = search(numbers, 99)
print(pos2)`,
  },
  {
    name: 'Sum & Average',
    language: 'python',
    description: 'Computing stats from a list',
    code: `def compute_sum(arr):
    total = 0
    for i in range(len(arr)):
        total += arr[i]
    return total

data = [12, 45, 67, 23, 89]
s = compute_sum(data)
avg = s / len(data)
print(s)
print(avg)`,
  },
  {
    name: 'Power Function',
    language: 'python',
    description: 'Recursive exponentiation',
    code: `def power(base, exp):
    if exp == 0:
        return 1
    return base * power(base, exp - 1)

result = power(2, 8)
print(result)

result2 = power(3, 4)
print(result2)`,
  },
  {
    name: 'GCD (Euclid)',
    language: 'python',
    description: 'Greatest Common Divisor',
    code: `def gcd(a, b):
    if b == 0:
        return a
    return gcd(b, a % b)

result = gcd(48, 18)
print(result)

result2 = gcd(100, 75)
print(result2)`,
  },

  // ═══════════════════════════════════
  // C EXAMPLES
  // ═══════════════════════════════════
  {
    name: 'Basic Variables',
    language: 'c',
    description: 'Variable declarations and arithmetic',
    code: `#include <stdio.h>

int main() {
    int a = 10;
    int b = 20;
    int sum = a + b;
    int diff = a - b;
    printf("Sum = %d\\n", sum);
    printf("Diff = %d\\n", diff);
    return 0;
}`,
  },
  {
    name: 'If-Else',
    language: 'c',
    description: 'Conditional branching in C',
    code: `#include <stdio.h>

int main() {
    int x = 15;
    int y = 20;
    if (x > y) {
        printf("x is greater\\n");
    } else {
        printf("y is greater\\n");
    }
    return 0;
}`,
  },
  {
    name: 'For Loop',
    language: 'c',
    description: 'Counting with for loop',
    code: `#include <stdio.h>

int main() {
    int total = 0;
    for (int i = 1; i <= 5; i++) {
        total += i;
        printf("i=%d total=%d\\n", i, total);
    }
    printf("Final = %d\\n", total);
    return 0;
}`,
  },
  {
    name: 'While Loop',
    language: 'c',
    description: 'While loop countdown',
    code: `#include <stdio.h>

int main() {
    int n = 5;
    int factorial = 1;
    int i = 1;
    while (i <= n) {
        factorial *= i;
        printf("%d\\n", factorial);
        i++;
    }
    printf("Result = %d\\n", factorial);
    return 0;
}`,
  },
  {
    name: 'Nested Loops',
    language: 'c',
    description: 'Multiplication table',
    code: `#include <stdio.h>

int main() {
    for (int i = 1; i <= 3; i++) {
        for (int j = 1; j <= 3; j++) {
            int product = i * j;
            printf("%d\\n", product);
        }
    }
    return 0;
}`,
  },
  {
    name: 'Arrays',
    language: 'c',
    description: 'Array declaration and traversal',
    code: `#include <stdio.h>

int main() {
    int arr[5];
    arr[0] = 10;
    arr[1] = 20;
    arr[2] = 30;
    arr[3] = 40;
    arr[4] = 50;
    int sum = 0;
    for (int i = 0; i < 5; i++) {
        sum += arr[i];
        printf("%d\\n", arr[i]);
    }
    printf("Sum = %d\\n", sum);
    return 0;
}`,
  },
  {
    name: 'Functions',
    language: 'c',
    description: 'Function definition and calls',
    code: `#include <stdio.h>

int add(int a, int b) {
    int result = a + b;
    return result;
}

int multiply(int a, int b) {
    int result = a * b;
    return result;
}

int main() {
    int x = 5;
    int y = 3;
    int sum = add(x, y);
    int prod = multiply(x, y);
    printf("Sum = %d\\n", sum);
    printf("Product = %d\\n", prod);
    return 0;
}`,
  },
  {
    name: 'Recursive Factorial',
    language: 'c',
    description: 'Recursion in C',
    code: `#include <stdio.h>

int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

int main() {
    int result = factorial(5);
    printf("5! = %d\\n", result);
    return 0;
}`,
  },
  {
    name: 'String Length',
    language: 'c',
    description: 'Counting characters in a string',
    code: `#include <stdio.h>

int main() {
    char word[6];
    word[0] = 72;
    word[1] = 101;
    word[2] = 108;
    word[3] = 108;
    word[4] = 111;
    int length = 5;
    printf("Length = %d\\n", length);
    return 0;
}`,
  },
  {
    name: 'Swap Values',
    language: 'c',
    description: 'Swapping two variables',
    code: `#include <stdio.h>

int main() {
    int a = 10;
    int b = 20;
    printf("Before: a=%d b=%d\\n", a, b);
    int temp = a;
    a = b;
    b = temp;
    printf("After: a=%d b=%d\\n", a, b);
    return 0;
}`,
  },
  {
    name: 'Find Maximum',
    language: 'c',
    description: 'Finding max in array',
    code: `#include <stdio.h>

int main() {
    int arr[5];
    arr[0] = 34;
    arr[1] = 12;
    arr[2] = 67;
    arr[3] = 45;
    arr[4] = 23;
    int max = arr[0];
    for (int i = 1; i < 5; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    printf("Max = %d\\n", max);
    return 0;
}`,
  },
  {
    name: 'Sum of Digits',
    language: 'c',
    description: 'Extract and sum digits of a number',
    code: `#include <stdio.h>

int main() {
    int num = 1234;
    int sum = 0;
    int n = num;
    while (n > 0) {
        int digit = n % 10;
        sum += digit;
        printf("Digit: %d\\n", digit);
        n = n / 10;
    }
    printf("Sum = %d\\n", sum);
    return 0;
}`,
  },
];
