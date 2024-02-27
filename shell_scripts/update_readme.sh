# Backup the README.md excluding the Updates section
awk '/## Updates/{exit} {print}' README.md > README.tmp

# Append the Updates Header
echo "## Updates" >> README.tmp

# Append the list of learning note to the Updates section
for file in LearningNotes/*.md; do
    if [[ -f "$file" ]]; then
    echo "- [$(basename "$file" .md)]($file)" >> README.tmp
    fi
done

# Append the rest of the README.md after Updates section if it exists
awk '/## Updates\{f=1;next} f' README.md >> README.tmp || true

# Replace the old README with the new one
mv README.tmp README.md