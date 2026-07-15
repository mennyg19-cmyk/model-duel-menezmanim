// === What's in this file ===
// Database work for screens (D2) and styles (D7). Screens are the physical
// displays; styles are the board designs they show. Reads return a whole org's
// rows in order; writes create/update/delete and manage the "default style" flag.
// The visual editor (A6) edits a style's placed widgets; this file handles the
// screen/style records around it.

import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { displayObjects, screens, styles } from "@/db/schema";

export type ScreenRow = typeof screens.$inferSelect;
export type ScreenInsert = typeof screens.$inferInsert;
export type StyleRow = typeof styles.$inferSelect;
export type StyleInsert = typeof styles.$inferInsert;

export async function listScreens(orgId: string): Promise<ScreenRow[]> {
  return db.select().from(screens).where(eq(screens.orgId, orgId)).orderBy(asc(screens.name));
}

export async function listStyles(orgId: string): Promise<StyleRow[]> {
  return db.select().from(styles).where(eq(styles.orgId, orgId)).orderBy(asc(styles.sortOrder), asc(styles.name));
}

export async function createScreen(data: Omit<ScreenInsert, "id">): Promise<string> {
  const [row] = await db.insert(screens).values(data).returning({ id: screens.id });
  return row!.id;
}

export async function updateScreen(orgId: string, id: string, data: Partial<ScreenInsert>): Promise<void> {
  await db.update(screens).set(data).where(and(eq(screens.id, id), eq(screens.orgId, orgId)));
}

export async function deleteScreen(orgId: string, id: string): Promise<void> {
  await db.delete(screens).where(and(eq(screens.id, id), eq(screens.orgId, orgId)));
}

export async function createStyle(data: Omit<StyleInsert, "id">): Promise<string> {
  const [row] = await db.insert(styles).values(data).returning({ id: styles.id });
  return row!.id;
}

export async function updateStyle(orgId: string, id: string, data: Partial<StyleInsert>): Promise<void> {
  await db.update(styles).set(data).where(and(eq(styles.id, id), eq(styles.orgId, orgId)));
}

export async function deleteStyle(orgId: string, id: string): Promise<void> {
  await db.delete(styles).where(and(eq(styles.id, id), eq(styles.orgId, orgId)));
}

/** Make one style the org default and clear the flag on the others. */
export async function setDefaultStyle(orgId: string, id: string): Promise<void> {
  const orgStyles = await listStyles(orgId);
  await Promise.all(
    orgStyles.map((style) =>
      db.update(styles).set({ isDefault: style.id === id }).where(eq(styles.id, style.id)),
    ),
  );
}

/** Copy a style and all its placed widgets into a new "(copy)" style. */
export async function duplicateStyle(orgId: string, id: string): Promise<string> {
  const [source] = await db.select().from(styles).where(and(eq(styles.id, id), eq(styles.orgId, orgId))).limit(1);
  if (!source) throw new Error("Style not found in this organization.");
  const { id: _omit, createdAt: _c, updatedAt: _u, ...rest } = source;
  const [copy] = await db
    .insert(styles)
    .values({ ...rest, name: `${source.name} (copy)`, isDefault: false, sortOrder: source.sortOrder + 1 })
    .returning({ id: styles.id });
  const newStyleId = copy!.id;

  const objects = await db.select().from(displayObjects).where(eq(displayObjects.styleId, id));
  if (objects.length) {
    await db.insert(displayObjects).values(
      objects.map(({ id: _oid, createdAt: _oc, updatedAt: _ou, ...obj }) => ({ ...obj, styleId: newStyleId })),
    );
  }
  return newStyleId;
}

export async function countStyleObjects(styleId: string): Promise<number> {
  const rows = await db.select({ id: displayObjects.id }).from(displayObjects).where(eq(displayObjects.styleId, styleId));
  return rows.length;
}

export type DisplayObjectRow = typeof displayObjects.$inferSelect;
export type DisplayObjectInsert = typeof displayObjects.$inferInsert;

/** A style plus its placed widgets, scoped to the org (null when not found here). */
export async function getStyleWithObjects(
  orgId: string,
  styleId: string,
): Promise<{ style: StyleRow; objects: DisplayObjectRow[] } | null> {
  const [style] = await db
    .select()
    .from(styles)
    .where(and(eq(styles.id, styleId), eq(styles.orgId, orgId)))
    .limit(1);
  if (!style) return null;
  const objects = await db
    .select()
    .from(displayObjects)
    .where(eq(displayObjects.styleId, styleId))
    .orderBy(asc(displayObjects.layer));
  return { style, objects };
}

export interface StyleLayoutInput {
  style: Pick<
    StyleInsert,
    | "name"
    | "canvasWidth"
    | "canvasHeight"
    | "backgroundColor"
    | "backgroundMode"
    | "backgroundImage"
    | "backgroundGradient"
    | "backgroundTexture"
    | "backgroundFrameId"
    | "backgroundFrameThickness"
  >;
  /** The complete set of objects after editing. Anything missing is deleted. */
  objects: DisplayObjectInsert[];
}

/**
 * Saves a whole style layout in one transaction: updates the style record, then
 * replaces its placed widgets with exactly the set the editor sent (delete-all +
 * re-insert keeps ids stable because the editor passes each object's own id).
 */
export async function saveStyleLayout(orgId: string, styleId: string, input: StyleLayoutInput): Promise<void> {
  await db.transaction(async (tx) => {
    const [owned] = await tx
      .select({ id: styles.id })
      .from(styles)
      .where(and(eq(styles.id, styleId), eq(styles.orgId, orgId)))
      .limit(1);
    if (!owned) throw new Error("Style not found in this organization.");

    await tx.update(styles).set({ ...input.style, updatedAt: new Date() }).where(eq(styles.id, styleId));
    await tx.delete(displayObjects).where(eq(displayObjects.styleId, styleId));
    if (input.objects.length > 0) {
      await tx.insert(displayObjects).values(input.objects.map((o) => ({ ...o, styleId })));
    }
  });
}
