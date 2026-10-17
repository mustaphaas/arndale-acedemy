import { defineAction } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

export default defineAction({
  description: "Update whether an assignment is complete.",
  schema: z.object({ id: z.string(), completed: z.boolean() }),
  run: async ({ id, completed }) => {
    const [assignment] = await getDb().update(schema.assignments)
      .set({ completed })
      .where(eq(schema.assignments.id, id))
      .returning();
    return assignment;
  },
});
