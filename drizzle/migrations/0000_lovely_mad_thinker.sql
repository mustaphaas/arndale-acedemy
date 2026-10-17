CREATE TABLE "assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subject" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"due_date" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" text DEFAULT now() NOT NULL
);

INSERT INTO "assignments" ("id", "title", "subject", "description", "due_date", "completed") VALUES
  ('assignment-fractions', 'Fraction detectives', 'Maths', '5 fun questions to solve', 'Tomorrow', false),
  ('assignment-reading', 'Read a little, dream a lot', 'English', 'Read for 15 minutes and share your favorite part', 'Friday', false),
  ('assignment-spelling', 'Spelling superstars', 'English', 'Practice this week’s word list', 'Today', true),
  ('assignment-plants', 'How plants grow', 'Science', 'Draw the stages of a plant’s life', 'Thursday', false);
