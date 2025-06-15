**Cheat-sheet: when to use which token**

| Token                                   | Altitude (°)        | Azimuth (°)        | Typical uses                                           |
| --------------------------------------- | ------------------- | ------------------ | ------------------------------------------------------ |
| **full\_dome**                          | 0…±90 (entire dome) | 0…360              | Global sky fills, star-fields, ambience plates         |
| **zenith**                              | +90                 | n/a                | Milky Way, overhead comets, cosmic portals             |
| **upper**                               | +45 … +75           | n/a                | Tall buildings, soaring dragons                        |
| **horizon**                             | −15 … +15           | n/a                | Main action, dialogue focal plane                      |
| **lower**                               | −45 … −75           | n/a                | Ground-level FX, foot traffic in VR walkthrough        |
| **nadir**                               | −90                 | n/a                | Drain-portals, whirlpools, “falling” illusions         |
| **front / right / rear / left**         | n/a                 | 0 / 90 / 180 / 270 | Quick tags for mono-band cues; match Ambisonic azimuth |
| Quadrants (e.g. **upper\_front\_left**) | see combo           | see combo          | Precise speaker panning, choreography, laser hits      |


Quick mnemonic
lua
Copy
Edit
VERTICAL  : zenith → upper → horizon → lower → nadir
HORIZONTAL: front (0°) → right (90°) → rear (180°) → left (270°)
Combine one vertical + one horizontal for a quadrant; prepend vertical first (upper_front_left).