# Transfer to Tomchei-Shabbos-Website

This folder is the best-of-six composite. To publish it on the empty product repo:

```bash
git clone https://github.com/mennyg19-cmyk/Tomchei-Shabbos-Website.git
cd Tomchei-Shabbos-Website
git checkout -b cursor/best-of-six-composite-e5a5
# wipe the dead-repo placeholder, then copy this tree in
rsync -a --exclude TRANSFER-TO-TOMCHEI.md ./path/to/model-duel-menezmanim/07-composite/ ./
git add -A
git commit -m "Ship best-of-six Tomchei composite from duel winners."
git push -u origin cursor/best-of-six-composite-e5a5
gh pr create --base main --title "Best-of-six composite from model duel" --body "See docs/COMPOSITE-DECISIONS.md"
```

A local copy of the same commits also exists under `/tmp/tomchei-work/target` on the agent VM (branch `cursor/best-of-six-composite-e5a5`, commits `b1c50bf` + `6b6d8b1`) if you have credentials that can push directly.
