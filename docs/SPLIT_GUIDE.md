### 📝 Scene-Split Cheat-Sheet

*(Put this table in **docs/SPLIT\_GUIDE.md** so everyone follows the same rule.)*

| Step                                     | What you do                                                                                                | JSON example                                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **1 Start draft**                        | Create the first beat of a scene.                                                                          | `json { "id": "brainBurst", "scene": 3, "shoot": 1, "action": "Neural fireworks." }`        |
| **2 Need an insert between 3-1 and 3-2** | Copy the JSON, change **`id`** and give **`shoot` a letter suffix**.                                    | `json { "id": "brainBurstA", "scene": 3, "shoot": "1a", "action": "Extra camera cut." }`    |
| **3 Another late insert**                | Use the next letter (`1b`, `1c`, …).                                                                       | `json { "id": "brainBurstB", "scene": 3, "shoot": "1b", "action": "Close-up neuron pop." }` |
| **4 Re-index**                           | Run `npm run reindex` (or `python tools/reindex.py`) to update the numeric **`index`** of every shot.      | *Tool writes `"index": 12, 13, 14 …"` automatically.*                                          |
| **5 Freeze IDs after Review**            | Once a shot passes **Review** profile, its `id` **must never change**. All later patches refer to that ID. | —                                                                                              |
| **6 Optional new scene**                 | If an entire new scene appears, pick the next integer (`scene: 4`) and start `shoot: 1`.                | `json { "id": "newScene1", "scene": 4, "shoot": 1 }`                                        |

---

### Rules in one breath

1. **`id`** – any slug (`^[A-Za-z0-9._-]+$`). Unique, never renamed after Review.
2. **`scene`** – whole integer (1, 2, 3 …).
3. **`shoot`** –

   * original beat → integer (`1`, `2`)
   * inserted beat → same integer + one lowercase letter (`1a`, `1b`).
4. **`index`** – numeric play order. Always regenerated by the **reindex** script.
5. **No decimals, no spaces, no multi-letter suffix.**
   If you somehow exhaust letters (`1z`) insert a new integer (`2`) and renumber storyboard, or (rare) move to `1aa` and bump schema later.

---

### FAQ

| Q                                                                         | A                                                                                                                 |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **What if I discover I need to insert before the very first beat (`1`)?** | Use `0a` (integer `0` with letter) or create a new scene “2” and shuffle indices—whichever your director prefers. |
| **Does the schema allow upper-case letters?**                             | No. Lower-case only (`^[0-9]+[a-z]?$`) keeps sorting predictable.                                                 |
| **Can `scene` numbers skip (1, 3, 5)?**                                   | Yes; they’re labels, not array indices.                                                                           |
| **Do I have to add `index` manually?**                                    | Never. Run the reindex tool after every rename or insert.                                                         |

