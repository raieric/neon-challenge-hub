import { Language } from './interpreter';

export interface CodeExample {
  name: string;
  language: Language;
  code: string;
  description: string;
}

export const examples: CodeExample[] = [
  {
    name: 'If-Else Logic',
    language: 'python',
    description: 'Basic conditional branching',
    code: `x = 10
y = 20

if x > y:
    print("x is greater")
else:
    print("y is greater")

print("Done")`,
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
    name: 'Bubble Sort',
    language: 'python',
    description: 'Sorting algorithm',
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
    name: 'Loops & Functions',
    language: 'python',
    description: 'Combining loops with functions',
    code: `def square(x):
    return x * x

total = 0
for i in range(1, 6):
    s = square(i)
    total += s
    print(s)

print(total)`,
  },
  {
    name: 'Fibonacci',
    language: 'python',
    description: 'Fibonacci sequence',
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
    name: 'Basic Variables',
    language: 'c',
    description: 'Variable declarations and arithmetic',
    code: `#include <stdio.h>

int main() {
    int a = 10;
    int b = 20;
    int sum = a + b;
    printf("Sum = %d\\n", sum);
    return 0;
}`,
  },
  {
    name: 'For Loop',
    language: 'c',
    description: 'Loop with counter',
    code: `#include <stdio.h>

int main() {
    int total = 0;
    for (int i = 1; i <= 5; i++) {
        total += i;
        printf("%d\\n", total);
    }
    printf("Total = %d\\n", total);
    return 0;
}`,
  },
  {
    name: 'Functions',
    language: 'c',
    description: 'Function calls',
    code: `#include <stdio.h>

int add(int a, int b) {
    int result = a + b;
    return result;
}

int main() {
    int x = 5;
    int y = 3;
    int sum = add(x, y);
    printf("Sum = %d\\n", sum);
    return 0;
}`,
  },
];
