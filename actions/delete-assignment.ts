import { defineAction } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

export default defineAction({
  description: "Delete a classroom assignment.",
  schema: z.object({ id: z.string() }),
  http: { method: "DELETE" },
  run: async ({ id }) => {
    const [assignment] = await getDb().delete(schema.assignments)
      .where(eq(schema.assignments.id, id))
      .returning();
    return assignment;
  },
});
