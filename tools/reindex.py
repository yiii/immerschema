#!/usr/bin/env python3
"""
Rewrites `index` so shots play in (scene, subScene) order.
Usage:  python tools/reindex.py shots/*.json
"""
import json, sys, pathlib, itertools as it

file_paths = [pathlib.Path(p) for p in sys.argv[1:]]
shots = []
for p in file_paths:
    data = json.load(p.open())
    shots.append((data.get("scene", 0),
                  str(data.get("subScene", "")),
                  data, p))

shots.sort(key=lambda t: (t[0], t[1]))

for i, (_, _, data, path) in enumerate(shots):
    data["index"] = i
    json.dump(data, path.open("w"), indent=2)
print(f"Reindexed {len(shots)} shots.") 