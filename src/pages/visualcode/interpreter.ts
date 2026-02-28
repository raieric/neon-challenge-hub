// Types
export type Language = 'python' | 'c';

export interface StackFrame {
  functionName: string;
  args: Record<string, any>;
}

export interface ExecutionStep {
  line: number;
  type: 'assignment' | 'print' | 'condition_true' | 'condition_false' | 'loop_start' | 'loop_check' | 'function_call' | 'function_return' | 'expression' | 'define';
  explanation: string;
  variables: Record<string, any>;
  callStack: StackFrame[];
  output: string[];
}

class ReturnValue {
  constructor(public value: any) {}
}

// ─── Python Interpreter ───
class PythonInterpreter {
  private lines: { text: string; indent: number; lineNum: number; isEmpty: boolean }[] = [];
  private steps: ExecutionStep[] = [];
  private globalVars: Record<string, any> = {};
  private callStack: StackFrame[] = [];
  private output: string[] = [];
  private functions: Record<string, { params: string[]; start: number; end: number }> = {};
  private stepCount = 0;
  private maxSteps = 500;
  private indentUnit = 4;

  run(code: string): ExecutionStep[] {
    this.lines = code.split('\n').map((raw, i) => ({
      text: raw.trim(),
      indent: raw.search(/\S/) < 0 ? 0 : raw.search(/\S/),
      lineNum: i,
      isEmpty: raw.trim() === '' || raw.trim().startsWith('#'),
    }));
    this.steps = [];
    this.globalVars = {};
    this.callStack = [];
    this.output = [];
    this.functions = {};
    this.stepCount = 0;
    this.detectIndent();
    this.findFunctions();
    try {
      this.executeBlock(0, this.lines.length, 0, this.globalVars);
    } catch (e) {
      if (!(e instanceof ReturnValue)) {
        this.record(0, 'expression', `Error: ${e}`);
      }
    }
    return this.steps;
  }

  private detectIndent() {
    for (const l of this.lines) {
      if (l.indent > 0 && !l.isEmpty) { this.indentUnit = l.indent; return; }
    }
    this.indentUnit = 4;
  }

  private findFunctions() {
    for (let i = 0; i < this.lines.length; i++) {
      const m = this.lines[i].text.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:/);
      if (m) {
        const params = m[2] ? m[2].split(',').map(p => p.trim()).filter(Boolean) : [];
        const bodyIndent = this.lines[i].indent + this.indentUnit;
        let end = i + 1;
        while (end < this.lines.length && (this.lines[end].isEmpty || this.lines[end].indent >= bodyIndent)) end++;
        this.functions[m[1]] = { params, start: i + 1, end };
      }
    }
  }

  private blockEnd(start: number, bodyIndent: number): number {
    let i = start;
    while (i < this.lines.length && (this.lines[i].isEmpty || this.lines[i].indent >= bodyIndent)) i++;
    return i;
  }

  private record(line: number, type: ExecutionStep['type'], explanation: string, scope?: Record<string, any>) {
    if (this.stepCount++ > this.maxSteps) throw new Error('Max steps exceeded');
    this.steps.push({
      line,
      type,
      explanation,
      variables: JSON.parse(JSON.stringify(scope ?? this.globalVars)),
      callStack: JSON.parse(JSON.stringify(this.callStack)),
      output: [...this.output],
    });
  }

  private executeBlock(start: number, end: number, indent: number, scope: Record<string, any>) {
    let i = start;
    while (i < end && this.stepCount < this.maxSteps) {
      const l = this.lines[i];
      if (l.isEmpty) { i++; continue; }
      if (l.indent < indent) break;
      if (l.indent > indent) { i++; continue; }

      if (l.text.startsWith('def ')) {
        const name = l.text.match(/def\s+(\w+)/)?.[1] ?? '?';
        this.record(l.lineNum, 'define', `Define function ${name}`, scope);
        const f = this.functions[name];
        i = f ? f.end : i + 1;
        continue;
      }

      i = this.executeLine(i, indent, scope);
    }
  }

  private executeLine(idx: number, indent: number, scope: Record<string, any>): number {
    const l = this.lines[idx];
    const t = l.text;

    // Keywords first
    if (t.startsWith('if ') || t.startsWith('elif ')) return this.handleCond(idx, indent, scope);
    if (t.startsWith('while ')) return this.handleWhile(idx, indent, scope);
    if (t.startsWith('for ')) return this.handleFor(idx, indent, scope);

    if (t.startsWith('return')) {
      const expr = t.slice(6).trim();
      const val = expr ? this.evaluate(expr, scope) : undefined;
      this.record(l.lineNum, 'function_return', `Return ${JSON.stringify(val)}`, scope);
      throw new ReturnValue(val);
    }

    if (t.startsWith('print(') && t.endsWith(')')) {
      const argsStr = t.slice(6, -1);
      const args = argsStr.trim() ? this.parseComma(argsStr).map(a => this.evaluate(a, scope)) : [];
      const out = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
      this.output.push(out);
      this.record(l.lineNum, 'print', `Output: ${out}`, scope);
      return idx + 1;
    }

    // Augmented assignment
    const aug = t.match(/^(\w+)\s*(\+=|-=|\*=|\/=)\s*(.+)$/);
    if (aug) {
      const v = this.evaluate(aug[3], scope);
      const op = aug[2];
      if (op === '+=') scope[aug[1]] = (scope[aug[1]] ?? 0) + v;
      else if (op === '-=') scope[aug[1]] = (scope[aug[1]] ?? 0) - v;
      else if (op === '*=') scope[aug[1]] = (scope[aug[1]] ?? 0) * v;
      else scope[aug[1]] = (scope[aug[1]] ?? 0) / v;
      this.record(l.lineNum, 'assignment', `${aug[1]} ${op} ${v} → ${scope[aug[1]]}`, scope);
      return idx + 1;
    }

    // Assignment
    const assign = t.match(/^(\w+)\s*=(?!=)\s*(.+)$/);
    if (assign) {
      const val = this.evaluate(assign[2], scope);
      scope[assign[1]] = val;
      this.record(l.lineNum, 'assignment', `${assign[1]} = ${JSON.stringify(val)}`, scope);
      return idx + 1;
    }

    // Method calls like list.append(x)
    const method = t.match(/^(\w+)\.(\w+)\s*\(([^)]*)\)$/);
    if (method) {
      const obj = scope[method[1]];
      const args = method[3].trim() ? this.parseComma(method[3]).map(a => this.evaluate(a, scope)) : [];
      if (method[2] === 'append' && Array.isArray(obj)) obj.push(args[0]);
      this.record(l.lineNum, 'expression', `${method[1]}.${method[2]}(${args.map(a => JSON.stringify(a)).join(', ')})`, scope);
      return idx + 1;
    }

    // Expression
    this.evaluate(t, scope);
    this.record(l.lineNum, 'expression', `Evaluated: ${t}`, scope);
    return idx + 1;
  }

  private handleCond(idx: number, indent: number, scope: Record<string, any>): number {
    const l = this.lines[idx];
    const condStr = l.text.match(/^(?:if|elif)\s+(.+):$/)?.[1] ?? '';
    const val = this.evaluate(condStr, scope);
    const bodyIndent = indent + this.indentUnit;
    const bodyEnd = this.blockEnd(idx + 1, bodyIndent);

    if (val) {
      this.record(l.lineNum, 'condition_true', `${condStr} → True`, scope);
      this.executeBlock(idx + 1, bodyEnd, bodyIndent, scope);
      return this.skipBranches(bodyEnd, indent);
    } else {
      this.record(l.lineNum, 'condition_false', `${condStr} → False`, scope);
      if (bodyEnd < this.lines.length && !this.lines[bodyEnd].isEmpty && this.lines[bodyEnd].indent === indent) {
        const next = this.lines[bodyEnd].text;
        if (next.startsWith('elif ')) return this.handleCond(bodyEnd, indent, scope);
        if (next.startsWith('else:')) {
          const elseEnd = this.blockEnd(bodyEnd + 1, bodyIndent);
          this.record(this.lines[bodyEnd].lineNum, 'condition_true', 'Entering else block', scope);
          this.executeBlock(bodyEnd + 1, elseEnd, bodyIndent, scope);
          return elseEnd;
        }
      }
      return bodyEnd;
    }
  }

  private skipBranches(idx: number, indent: number): number {
    let i = idx;
    while (i < this.lines.length) {
      const l = this.lines[i];
      if (l.isEmpty) { i++; continue; }
      if (l.indent !== indent) break;
      if (l.text.startsWith('elif ') || l.text.startsWith('else:')) {
        i = this.blockEnd(i + 1, indent + this.indentUnit);
      } else break;
    }
    return i;
  }

  private handleWhile(idx: number, indent: number, scope: Record<string, any>): number {
    const l = this.lines[idx];
    const condStr = l.text.match(/^while\s+(.+):$/)?.[1] ?? '';
    const bodyIndent = indent + this.indentUnit;
    const bodyEnd = this.blockEnd(idx + 1, bodyIndent);

    this.record(l.lineNum, 'loop_start', `While loop: ${condStr}`, scope);
    let iter = 0;
    while (this.evaluate(condStr, scope) && iter++ < 200 && this.stepCount < this.maxSteps) {
      this.record(l.lineNum, 'loop_check', `${condStr} → True (iteration ${iter})`, scope);
      this.executeBlock(idx + 1, bodyEnd, bodyIndent, scope);
    }
    if (iter > 0) this.record(l.lineNum, 'condition_false', `${condStr} → False, loop ended`, scope);
    return bodyEnd;
  }

  private handleFor(idx: number, indent: number, scope: Record<string, any>): number {
    const l = this.lines[idx];
    const m = l.text.match(/^for\s+(\w+)\s+in\s+(.+):$/);
    if (!m) return idx + 1;
    const varName = m[1];
    const iterable = this.evaluate(m[2], scope);
    const bodyIndent = indent + this.indentUnit;
    const bodyEnd = this.blockEnd(idx + 1, bodyIndent);

    this.record(l.lineNum, 'loop_start', `For loop: ${varName} in ${m[2]}`, scope);
    if (Array.isArray(iterable)) {
      for (let i = 0; i < iterable.length && this.stepCount < this.maxSteps; i++) {
        scope[varName] = iterable[i];
        this.record(l.lineNum, 'loop_check', `${varName} = ${JSON.stringify(iterable[i])} (iteration ${i + 1})`, scope);
        this.executeBlock(idx + 1, bodyEnd, bodyIndent, scope);
      }
    }
    return bodyEnd;
  }

  // ─── Expression Evaluator ───
  evaluate(expr: string, scope: Record<string, any>): any {
    expr = expr.trim();
    if (!expr) return undefined;

    // String literal
    if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'")))
      return expr.slice(1, -1);

    // Number
    if (/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);

    // Booleans
    if (expr === 'True') return true;
    if (expr === 'False') return false;
    if (expr === 'None') return null;

    // Simple variable
    if (/^\w+$/.test(expr) && expr in scope) return scope[expr];

    // List literal
    if (expr.startsWith('[') && expr.endsWith(']')) {
      const inner = expr.slice(1, -1).trim();
      if (!inner) return [];
      return this.parseComma(inner).map(e => this.evaluate(e, scope));
    }

    // List indexing
    const idxM = expr.match(/^(\w+)\[(.+)\]$/);
    if (idxM) {
      const arr = scope[idxM[1]];
      const i = this.evaluate(idxM[2], scope);
      return arr?.[i];
    }

    // Preprocess function calls
    let processed = this.preprocessFuncs(expr, scope);

    // Convert Python → JS
    let js = processed
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null')
      .replace(/\band\b/g, '&&')
      .replace(/\bor\b/g, '||')
      .replace(/\bnot\s+/g, '!');

    // Integer division
    js = js.replace(/(\w+)\s*\/\/\s*(\w+)/g, 'Math.floor($1/$2)');

    const keys = Object.keys(scope);
    const vals = Object.values(scope);
    try {
      const fn = new Function(...keys, `"use strict"; return (${js})`);
      return fn(...vals);
    } catch { return undefined; }
  }

  private preprocessFuncs(expr: string, scope: Record<string, any>): string {
    let result = expr;
    let safety = 20;
    while (safety-- > 0) {
      const m = result.match(/\b(\w+)\s*\(([^()]*)\)/);
      if (!m) break;
      const name = m[1];
      if (['if', 'while', 'for', 'def', 'return', 'Math'].includes(name)) break;
      const args = m[2].trim() ? this.parseComma(m[2]).map(a => this.evaluate(a, scope)) : [];
      const ret = this.callFunc(name, args, scope);
      result = result.replace(m[0], ret === undefined ? 'null' : JSON.stringify(ret));
    }
    return result;
  }

  private callFunc(name: string, args: any[], scope: Record<string, any>): any {
    // Built-ins
    if (name === 'len') return args[0]?.length ?? 0;
    if (name === 'range') {
      if (args.length === 1) return Array.from({ length: args[0] }, (_, i) => i);
      if (args.length === 2) return Array.from({ length: args[1] - args[0] }, (_, i) => args[0] + i);
      if (args.length === 3) { const r: number[] = []; for (let i = args[0]; i < args[1]; i += args[2]) r.push(i); return r; }
      return [];
    }
    if (name === 'abs') return Math.abs(args[0]);
    if (name === 'max') return Math.max(...args);
    if (name === 'min') return Math.min(...args);
    if (name === 'str') return String(args[0]);
    if (name === 'int') return parseInt(String(args[0]));
    if (name === 'float') return parseFloat(String(args[0]));
    if (name === 'print') { this.output.push(args.map(String).join(' ')); return undefined; }
    if (name === 'type') return typeof args[0];
    if (name === 'sorted') return [...(args[0] ?? [])].sort((a, b) => a - b);
    if (name === 'reversed') return [...(args[0] ?? [])].reverse();
    if (name === 'sum') return (args[0] ?? []).reduce((a: number, b: number) => a + b, 0);
    if (name === 'list') return Array.isArray(args[0]) ? [...args[0]] : [];

    // User-defined
    const func = this.functions[name];
    if (!func) return undefined;

    const local: Record<string, any> = {};
    func.params.forEach((p, i) => { local[p] = args[i]; });

    this.callStack.push({ functionName: name, args: { ...local } });
    this.record(func.start - 1, 'function_call', `Call ${name}(${args.map(a => JSON.stringify(a)).join(', ')})`, local);

    try {
      this.executeBlock(func.start, func.end, this.lines[func.start]?.indent ?? this.indentUnit, local);
      this.callStack.pop();
      return undefined;
    } catch (e) {
      if (e instanceof ReturnValue) { this.callStack.pop(); return e.value; }
      this.callStack.pop();
      throw e;
    }
  }

  private parseComma(str: string): string[] {
    const result: string[] = [];
    let cur = '', depth = 0, inStr = false, sc = '';
    for (const ch of str) {
      if (inStr) { cur += ch; if (ch === sc) inStr = false; continue; }
      if (ch === '"' || ch === "'") { inStr = true; sc = ch; cur += ch; continue; }
      if (ch === '(' || ch === '[') { depth++; cur += ch; continue; }
      if (ch === ')' || ch === ']') { depth--; cur += ch; continue; }
      if (ch === ',' && depth === 0) { result.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    if (cur.trim()) result.push(cur.trim());
    return result;
  }
}

// ─── C Interpreter (simplified) ───
class CInterpreter {
  private steps: ExecutionStep[] = [];
  private vars: Record<string, any> = {};
  private callStack: StackFrame[] = [];
  private output: string[] = [];
  private functions: Record<string, { params: { type: string; name: string }[]; body: string[] ; startLine: number }> = {};
  private stepCount = 0;
  private maxSteps = 500;
  private originalLines: string[] = [];

  run(code: string): ExecutionStep[] {
    this.steps = [];
    this.vars = {};
    this.callStack = [];
    this.output = [];
    this.functions = {};
    this.stepCount = 0;
    this.originalLines = code.split('\n');

    // Simple line-by-line C interpreter
    const lines = this.originalLines.map(l => l.trim()).filter(l => l && !l.startsWith('//') && !l.startsWith('#'));
    this.findCFunctions(lines);
    this.executeCLines(lines, this.vars);
    return this.steps;
  }

  private record(line: number, type: ExecutionStep['type'], explanation: string, scope?: Record<string, any>) {
    if (this.stepCount++ > this.maxSteps) throw new Error('Max steps');
    this.steps.push({
      line: Math.min(line, this.originalLines.length - 1),
      type, explanation,
      variables: JSON.parse(JSON.stringify(scope ?? this.vars)),
      callStack: JSON.parse(JSON.stringify(this.callStack)),
      output: [...this.output],
    });
  }

  private findCFunctions(lines: string[]) {
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^(?:int|void|float|double|char)\s+(\w+)\s*\(([^)]*)\)\s*\{?$/);
      if (m && m[1] !== 'main') {
        const params = m[2] ? m[2].split(',').map(p => {
          const parts = p.trim().split(/\s+/);
          return { type: parts[0], name: parts[1] || parts[0] };
        }) : [];
        // Find matching brace
        let depth = lines[i].includes('{') ? 1 : 0;
        let j = i + 1;
        if (depth === 0 && j < lines.length && lines[j] === '{') { depth = 1; j++; }
        const bodyStart = j;
        while (j < lines.length && depth > 0) {
          if (lines[j].includes('{')) depth++;
          if (lines[j].includes('}')) depth--;
          if (depth > 0) j++;
          else break;
        }
        this.functions[m[1]] = { params, body: lines.slice(bodyStart, j), startLine: i };
      }
    }
  }

  private executeCLines(lines: string[], scope: Record<string, any>) {
    let i = 0;
    let inMain = false;
    let depth = 0;
    while (i < lines.length && this.stepCount < this.maxSteps) {
      let line = lines[i].replace(/;$/, '').trim();
      if (!line || line === '{' || line === '}') {
        if (lines[i].includes('{')) depth++;
        if (lines[i].includes('}')) depth--;
        i++; continue;
      }

      // Skip function definitions (non-main)
      if (line.match(/^(?:int|void|float|double|char)\s+\w+\s*\([^)]*\)\s*\{?$/) && !line.includes('main')) {
        let d = line.includes('{') ? 1 : 0;
        i++;
        while (i < lines.length) {
          if (lines[i].includes('{')) d++;
          if (lines[i].includes('}')) d--;
          i++;
          if (d <= 0) break;
        }
        continue;
      }

      // Main function start
      if (line.includes('main')) { i++; continue; }

      i = this.executeCLine(line, i, lines, scope);
    }
  }

  private executeCLine(line: string, idx: number, lines: string[], scope: Record<string, any>): number {
    line = line.replace(/;$/, '').trim();

    // Variable declaration/assignment
    const decl = line.match(/^(?:int|float|double|char|long)\s+(\w+)\s*(?:=\s*(.+))?$/);
    if (decl) {
      const val = decl[2] ? this.evalC(decl[2], scope) : 0;
      scope[decl[1]] = val;
      this.record(idx, 'assignment', `${decl[1]} = ${val}`, scope);
      return idx + 1;
    }

    // Assignment
    const assign = line.match(/^(\w+)\s*=\s*(.+)$/);
    if (assign && !line.includes('==')) {
      const val = this.evalC(assign[2], scope);
      scope[assign[1]] = val;
      this.record(idx, 'assignment', `${assign[1]} = ${val}`, scope);
      return idx + 1;
    }

    // Increment/decrement
    const inc = line.match(/^(\w+)(\+\+|--)$/);
    if (inc) {
      scope[inc[1]] = (scope[inc[1]] ?? 0) + (inc[2] === '++' ? 1 : -1);
      this.record(idx, 'assignment', `${inc[1]}${inc[2]} → ${scope[inc[1]]}`, scope);
      return idx + 1;
    }

    // Augmented assignment
    const augC = line.match(/^(\w+)\s*(\+=|-=|\*=|\/=)\s*(.+)$/);
    if (augC) {
      const v = this.evalC(augC[3], scope);
      const op = augC[2];
      if (op === '+=') scope[augC[1]] += v;
      else if (op === '-=') scope[augC[1]] -= v;
      else if (op === '*=') scope[augC[1]] *= v;
      else scope[augC[1]] /= v;
      this.record(idx, 'assignment', `${augC[1]} ${op} ${v} → ${scope[augC[1]]}`, scope);
      return idx + 1;
    }

    // printf
    if (line.startsWith('printf(')) {
      const argsStr = line.slice(7, line.lastIndexOf(')'));
      const parts = this.parseCComma(argsStr);
      let fmt = parts[0]?.replace(/^"|"$/g, '') ?? '';
      const args = parts.slice(1).map(a => this.evalC(a, scope));
      let ai = 0;
      fmt = fmt.replace(/%[difs]/g, () => String(args[ai++] ?? ''));
      fmt = fmt.replace(/\\n/g, '');
      this.output.push(fmt);
      this.record(idx, 'print', `Output: ${fmt}`, scope);
      return idx + 1;
    }

    // If
    if (line.startsWith('if') && line.includes('(')) {
      const cond = line.match(/if\s*\((.+)\)/)?.[1] ?? '';
      const val = this.evalC(cond, scope);
      // Find block
      let blockLines: string[] = [];
      let j = idx + 1;
      if (line.includes('{') || (j < lines.length && lines[j].trim() === '{')) {
        if (!line.includes('{')) j++;
        let d = 1;
        const start = j;
        while (j < lines.length && d > 0) {
          if (lines[j].includes('{')) d++;
          if (lines[j].includes('}')) d--;
          if (d > 0) { blockLines.push(lines[j]); j++; }
          else j++;
        }
      } else {
        blockLines = [lines[j] ?? ''];
        j = idx + 2;
      }

      if (val) {
        this.record(idx, 'condition_true', `${cond} → True`, scope);
        for (const bl of blockLines) this.executeCLine(bl, idx, lines, scope);
      } else {
        this.record(idx, 'condition_false', `${cond} → False`, scope);
      }

      // Check for else
      if (j < lines.length && lines[j]?.trim().startsWith('else')) {
        let elseLines: string[] = [];
        let k = j + 1;
        if (lines[j].includes('{') || (k < lines.length && lines[k].trim() === '{')) {
          if (!lines[j].includes('{')) k++;
          let d = 1;
          while (k < lines.length && d > 0) {
            if (lines[k].includes('{')) d++;
            if (lines[k].includes('}')) d--;
            if (d > 0) { elseLines.push(lines[k]); k++; }
            else k++;
          }
        } else {
          elseLines = [lines[k] ?? ''];
          k++;
        }
        if (!val) {
          this.record(j, 'condition_true', 'Entering else block', scope);
          for (const bl of elseLines) this.executeCLine(bl, j, lines, scope);
        }
        return k;
      }
      return j;
    }

    // For loop
    const forM = line.match(/^for\s*\((.+)\)/);
    if (forM) {
      const parts = forM[1].split(';').map(s => s.trim());
      if (parts.length === 3) {
        // Init
        this.executeCLine(parts[0], idx, lines, scope);
        this.record(idx, 'loop_start', `For loop started`, scope);
        let iter = 0;
        // Find body
        let blockLines: string[] = [];
        let j = idx + 1;
        if (line.includes('{') || (j < lines.length && lines[j].trim() === '{')) {
          if (!line.includes('{')) j++;
          let d = 1;
          const start = j;
          while (j < lines.length && d > 0) {
            if (lines[j].includes('{')) d++;
            if (lines[j].includes('}')) d--;
            if (d > 0) { blockLines.push(lines[j]); j++; }
            else j++;
          }
        }
        while (this.evalC(parts[1], scope) && iter++ < 200 && this.stepCount < this.maxSteps) {
          this.record(idx, 'loop_check', `Condition true (iteration ${iter})`, scope);
          for (const bl of blockLines) this.executeCLine(bl, idx, lines, scope);
          this.executeCLine(parts[2], idx, lines, scope);
        }
        return j;
      }
    }

    // Return
    if (line.startsWith('return')) {
      const val = this.evalC(line.slice(6).trim(), scope);
      this.record(idx, 'function_return', `Return ${val}`, scope);
      throw new ReturnValue(val);
    }

    this.record(idx, 'expression', line, scope);
    return idx + 1;
  }

  private evalC(expr: string, scope: Record<string, any>): any {
    expr = expr.trim().replace(/;$/, '');
    if (!expr) return 0;
    if (/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);
    if (expr.startsWith('"') && expr.endsWith('"')) return expr.slice(1, -1);
    if (expr.startsWith("'") && expr.endsWith("'")) return expr.charCodeAt(1);
    if (/^\w+$/.test(expr) && expr in scope) return scope[expr];

    // Function call
    const fm = expr.match(/^(\w+)\s*\(([^()]*)\)$/);
    if (fm && fm[1] in this.functions) {
      const func = this.functions[fm[1]];
      const args = fm[2].trim() ? this.parseCComma(fm[2]).map(a => this.evalC(a, scope)) : [];
      const local: Record<string, any> = {};
      func.params.forEach((p, i) => { local[p.name] = args[i]; });
      this.callStack.push({ functionName: fm[1], args: { ...local } });
      this.record(func.startLine, 'function_call', `Call ${fm[1]}(${args.join(', ')})`, local);
      try {
        for (const bl of func.body) this.executeCLine(bl, func.startLine, func.body, local);
        this.callStack.pop();
        return 0;
      } catch (e) {
        if (e instanceof ReturnValue) { this.callStack.pop(); return e.value; }
        this.callStack.pop(); throw e;
      }
    }

    // JS eval fallback
    const keys = Object.keys(scope);
    const vals = Object.values(scope);
    try {
      return new Function(...keys, `"use strict"; return (${expr})`)(...vals);
    } catch { return 0; }
  }

  private parseCComma(str: string): string[] {
    const r: string[] = [];
    let cur = '', depth = 0, inStr = false, sc = '';
    for (const ch of str) {
      if (inStr) { cur += ch; if (ch === sc) inStr = false; continue; }
      if (ch === '"') { inStr = true; sc = ch; cur += ch; continue; }
      if (ch === '(') { depth++; cur += ch; continue; }
      if (ch === ')') { depth--; cur += ch; continue; }
      if (ch === ',' && depth === 0) { r.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    if (cur.trim()) r.push(cur.trim());
    return r;
  }
}

// ─── Public API ───
export function traceCode(code: string, language: Language): ExecutionStep[] {
  if (language === 'python') return new PythonInterpreter().run(code);
  return new CInterpreter().run(code);
}
