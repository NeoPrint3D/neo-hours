#!/bin/bash

# Define the directory of your workspace
WORKSPACE_DIR="."
OUTPUT_FILE="combined_code.txt"

# Navigate to the workspace directory
cd "$WORKSPACE_DIR" || exit

# Create or clear the output file
> "$OUTPUT_FILE"

# Find all files not ignored by .gitignore and concatenate them
git ls-files --cached --others --exclude-standard | while read -r file; do
    # Check if the file is a code file based on its extension
    if [[ "$file" == *.ts || "$file" == *.vue ]]; then
        echo -e "\n\n# $file\n\n" >> "$OUTPUT_FILE"  # Optional: Write file path as a comment
        cat "$file" >> "$OUTPUT_FILE"
    fi
done

echo "All code files have been combined into $OUTPUT_FILE"
