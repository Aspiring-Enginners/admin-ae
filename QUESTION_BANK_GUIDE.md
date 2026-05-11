# Quick Reference: Using the Question Bank

## Adding Questions with Math Formulas

### In Question Text or Solution

1. Type your content in the editor
2. Click **"∫ Math"** button in toolbar
3. Enter LaTeX formula (e.g., `\frac{x^2}{2}` or `\int_0^1 x dx`)
4. Formula appears as rendered block
5. Double-click to edit formula later

### In Options (MCQ)

1. Each option has its own mini-editor
2. Type option text
3. Click **"∫ Math"** button for formulas
4. Mark correct answer with checkbox
5. Options automatically labeled A, B, C, D

## Common LaTeX Examples

### Fractions

```latex
\frac{numerator}{denominator}
```

Example: `\frac{x^2 + 1}{x - 1}`

### Integrals

```latex
\int_a^b f(x) dx
```

Example: `\int_0^{\pi} \sin(x) dx`

### Limits

```latex
\lim_{x \to a} f(x)
```

Example: `\lim_{n \to \infty} \frac{1}{n}`

### Summation

```latex
\sum_{i=1}^{n} i^2
```

### Square Root

```latex
\sqrt{expression}
```

Example: `\sqrt{x^2 + y^2}`

### Superscript & Subscript

```latex
x^2    (superscript)
x_i    (subscript)
```

### Greek Letters

```latex
\alpha, \beta, \gamma, \delta, \theta, \pi, \sigma
```

### Vectors

```latex
\vec{v} = 3\hat{i} + 4\hat{j}
```

---

## Question Types & Required Fields

### Required Fields (ALL question types)

| Field          | Type   | Allowed Values                                          |
|----------------|--------|---------------------------------------------------------|
| `category`     | enum   | `neet`, `jee-main`, `jee-advanced`, `boards`, `wbjee`  |
| `questionText` | string | Plain text, HTML, or LaTeX content                      |

### Optional Fields (ALL question types)

| Field                 | Type       | Notes                                                                      |
|-----------------------|------------|----------------------------------------------------------------------------|
| `questionType`        | enum       | `single-correct` (default), `multiple-correct`, `integer`, `numerical`     |
| `subject`             | enum       | `physics`, `chemistry`, `mathematics`, `botany`, `zoology`, `biology`, `english`, `hindi` |
| `chapter`             | string     | Free text (e.g., "Thermodynamics")                                         |
| `topic`               | string     | Free text (e.g., "Laws of Thermodynamics")                                 |
| `difficulty`          | enum       | `easy`, `medium` (default), `hard`                                         |
| `solutionText`        | string     | LaTeX/HTML supported                                                       |
| `questionImageBase64` | string     | Base64 encoded image for the question                                      |
| `solutionImageBase64` | string     | Base64 encoded image for the solution                                      |
| `metadata`            | object     | `{ marks?: number, year?: number }`                                        |

---

### Single Correct MCQ (`questionType: "single-correct"`)

- **`options`**: Array of option objects, each with `text` (string) and/or `imageBase64` (string)
- **`correctAnswer`**: A string identifying the correct option (e.g., `"A"` or `"0"` for first option)

### Multiple Correct MCQ (`questionType: "multiple-correct"`)

- **`options`**: Array of option objects, each with `text` (string) and/or `imageBase64` (string)
- **`correctAnswers`**: Array of strings identifying correct options (e.g., `["A", "C"]`)

### Integer Type (`questionType: "integer"`)

- **`numericalAnswer`**: The correct answer as a number (e.g., `42`)
- No options or tolerance needed
- During evaluation, exact match is required (user's answer must equal the correct answer exactly)

### Numerical Type (`questionType: "numerical"`)

- **`numericalAnswer`**: The correct answer as a number (e.g., `0.333`)
- **`tolerance`** (optional): Acceptable margin of error as a number (e.g., `0.01`)
- During evaluation, the answer is correct if: |userAnswer - correctAnswer| <= tolerance
- No rounding mode exists — comparison is a simple absolute-difference check

**IMPORTANT: There is NO `roundingMode` field. Do NOT send or display a rounding mode selector.**

---

## Viewing Questions

### Question List

- All questions show rendered HTML
- Math formulas display properly
- Click **Eye icon** to view full details

### Question Detail

- Full question with formatting
- All options rendered with HTML
- Correct answers highlighted in green
- Solution with all formatting

---

## Tips

1. **Preview**: Math renders instantly after entering LaTeX
2. **Editing**: Double-click rendered formula to edit
3. **Validation**: Form won't submit without the two required fields (`category` and `questionText`)
4. **Options**: For MCQ types, provide options with text and/or images
5. **HTML**: All content stored as HTML, renders automatically
6. **Integer questions**: Enter the answer in the `numericalAnswer` field (same field as numerical type)
7. **Numerical questions**: Enter the answer in `numericalAnswer` and optionally set `tolerance`
8. **Both integer and numerical types use the same `numericalAnswer` field** — there is no separate `integerAnswer` field

---

## Troubleshooting

### Formula Not Rendering

- Check LaTeX syntax
- Ensure formula is in math block (use ∫ Math button)
- Check browser console for errors

### Option Empty Error

- Make sure option has text content
- HTML tags alone don't count as content
- Add at least some text or formula

### Question Won't Save

- Check required fields: **category** and **question text** (these are the ONLY required fields)
- Subject, chapter, topic, and difficulty are all optional (difficulty defaults to "medium")
- For single-correct MCQ: provide `correctAnswer`
- For multiple-correct MCQ: provide `correctAnswers` array
- For integer/numerical: provide `numericalAnswer`

### Integer/Numerical Upload Fails

- Ensure `numericalAnswer` is sent as a number, not a string (e.g., `42` not `"42"`)
- The backend accepts both formats after the latest fix, but prefer sending actual numbers
- Do NOT send a `roundingMode` field — the backend will reject the request with `forbidNonWhitelisted` error

---

## Keyboard Shortcuts (in editor)

- **Ctrl/Cmd + B**: Bold
- **Ctrl/Cmd + I**: Italic
- **Ctrl/Cmd + Z**: Undo
- **Ctrl/Cmd + Shift + Z**: Redo

---

## API Endpoint Reference

### Create Question
- **POST** `/api/v1/questions`
- Auth: Bearer JWT (Admin only)
- Body: JSON with fields described above

### Example: Single Correct MCQ
```json
{
  "category": "neet",
  "subject": "physics",
  "questionText": "What is Newton's first law?",
  "questionType": "single-correct",
  "options": [
    { "text": "Law of inertia" },
    { "text": "F = ma" },
    { "text": "Action-reaction" },
    { "text": "Law of gravitation" }
  ],
  "correctAnswer": "A",
  "difficulty": "easy"
}
```

### Example: Integer Type
```json
{
  "category": "jee-main",
  "subject": "physics",
  "questionText": "A body starts from rest and travels 120 cm in the 6th second. Find acceleration in cm/s².",
  "questionType": "integer",
  "numericalAnswer": 20,
  "difficulty": "medium"
}
```

### Example: Numerical Type
```json
{
  "category": "jee-advanced",
  "subject": "mathematics",
  "questionText": "Find the value of ∫₀¹ x² dx",
  "questionType": "numerical",
  "numericalAnswer": 0.333,
  "tolerance": 0.01,
  "difficulty": "easy"
}
```

### Example: Multiple Correct MCQ
```json
{
  "category": "jee-advanced",
  "subject": "chemistry",
  "questionText": "Which of the following are noble gases?",
  "questionType": "multiple-correct",
  "options": [
    { "text": "Helium" },
    { "text": "Nitrogen" },
    { "text": "Neon" },
    { "text": "Oxygen" }
  ],
  "correctAnswers": ["A", "C"],
  "difficulty": "easy"
}
```
