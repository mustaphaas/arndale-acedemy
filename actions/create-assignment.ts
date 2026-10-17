import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

export default defineAction({
  description: "Create a classroom assignment.",
  schema: z.object({
    title: z.string().min(1),
    subject: z.string().min(1),
    description: z.string().default(""),
    dueDate: z.string().min(1),
  }),
  run: async ({ title, subject, description, dueDate }) => {
    const [assignment] = await getDb().insert(schema.assignments).values({
      id: crypto.randomUUID(),
      title: title.trim(),
      subject: subject.trim(),
      description: description.trim(),
      dueDate,
    }).returning();
    return assignment;
  },
});
