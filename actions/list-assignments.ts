import { defineAction } from "@agent-native/core/action";
import { asc } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

export default defineAction({
  description: "List classroom assignments by due date.",
  schema: z.object({}),
  http: { method: "GET" },
  run: async () => {
    return getDb().select().from(schema.assignments).orderBy(asc(schema.assignments.dueDate));
  },
});
