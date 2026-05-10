// lib/validation/add-pyq-schema.ts
import { z } from "zod";
import { hasTextContent } from "@/lib/utils/htmlUtils";

export const questionCategories = [
  "neet",
  "jee-main",
  "jee-advanced",
  "boards",
  "wbjee",
] as const;

export type QuestionCategory = (typeof questionCategories)[number];

export const questionSubjects = [
  "physics",
  "chemistry",
  "mathematics",
  "botany",
  "zoology",
  "biology",
  "english",
  "hindi",
] as const;

export type QuestionSubjectEnum = (typeof questionSubjects)[number];

export const questionTypes = [
  "SINGLE_CORRECT",
  "MULTI_CORRECT",
  "INTEGER",
  "NUMERICAL",
] as const;

export type QuestionType = (typeof questionTypes)[number];

export const roundingModes = [
  "NONE",
  "ONE_DECIMAL",
  "TWO_DECIMALS",
  "THREE_DECIMALS",
  "FLOOR",
  "CEIL",
] as const;

export type RoundingMode = (typeof roundingModes)[number];

const toNumberOrUndefined = (value: unknown) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "number") {
    return Number.isNaN(value) ? undefined : value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? value : parsed;
  }

  return value;
};

export const addPyqSchema = z
  .object({
    category: z.enum(questionCategories, {
      message: "Category is required",
    }),
    subject: z.enum(questionSubjects).optional(),
    chapter: z.string().optional(),
    topic: z.string().optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),

    // Validate that there's actual text content or math blocks, not just empty HTML tags
    question: z
      .string()
      .refine((val) => hasTextContent(val), "Question text is required"),
    solution: z.string().optional(),

    questionType: z.enum(questionTypes).optional(),

    // For MCQ / Single Correct
    options: z
      .array(
        z.object({
          id: z.string(),
          text: z
            .string()
            .refine((val) => hasTextContent(val), "Option cannot be empty"),
          isCorrect: z.boolean(),
          imageBase64: z.string().optional(),
        })
      )
      .optional(),

    // For Integer / Numerical Type
    numericalAnswer: z.preprocess(
      toNumberOrUndefined,
      z.number().optional()
    ),
    tolerance: z.preprocess(toNumberOrUndefined, z.number().optional()),
  })
  .superRefine((data, ctx) => {
    const questionType = data.questionType ?? "SINGLE_CORRECT";

    if (questionType === "SINGLE_CORRECT" || questionType === "MULTI_CORRECT") {
      if (!data.options || data.options.length < 2) {
        ctx.addIssue({
          path: ["options"],
          code: z.ZodIssueCode.custom,
          message: "At least 2 options are required",
        });
      }

      if (!data.options?.some((o) => o.isCorrect)) {
        ctx.addIssue({
          path: ["options"],
          code: z.ZodIssueCode.custom,
          message: "At least one correct option is required",
        });
      }

      if (questionType === "SINGLE_CORRECT") {
        const correctCount =
          data.options?.filter((o) => o.isCorrect).length ?? 0;
        if (correctCount !== 1) {
          ctx.addIssue({
            path: ["options"],
            code: z.ZodIssueCode.custom,
            message: "Exactly one option must be marked correct",
          });
        }
      }
    }

    if (questionType === "INTEGER") {
      if (data.numericalAnswer === undefined) {
        ctx.addIssue({
          path: ["numericalAnswer"],
          code: z.ZodIssueCode.custom,
          message: "Answer is required",
        });
      } else if (!Number.isInteger(data.numericalAnswer)) {
        ctx.addIssue({
          path: ["numericalAnswer"],
          code: z.ZodIssueCode.custom,
          message: "Answer must be a whole number",
        });
      }
    }

    if (questionType === "NUMERICAL") {
      if (data.numericalAnswer === undefined) {
        ctx.addIssue({
          path: ["numericalAnswer"],
          code: z.ZodIssueCode.custom,
          message: "Answer is required",
        });
      }

      if (data.tolerance !== undefined && data.tolerance < 0) {
        ctx.addIssue({
          path: ["tolerance"],
          code: z.ZodIssueCode.custom,
          message: "Tolerance must be a non-negative number",
        });
      }
    }
  });

export type AddPyqFormInput = z.input<typeof addPyqSchema>;
export type AddPyqFormValues = z.output<typeof addPyqSchema>;
