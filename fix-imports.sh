#!/bin/bash

# This script fixes versioned imports for standard Node.js environment

echo "Fixing versioned imports..."

# Find all .tsx and .ts files in components/ui
find components/ui -name "*.tsx" -o -name "*.ts" | while read file; do
  echo "Processing: $file"
  
  # Fix @radix-ui imports
  sed -i.bak 's/@radix-ui\/react-[a-z-]*@[0-9.]*/@radix-ui\/react-&/g' "$file"
  sed -i.bak 's/@radix-ui\/react-\([a-z-]*\)@[0-9.]*/@radix-ui\/react-\1/g' "$file"
  
  # Fix class-variance-authority
  sed -i.bak 's/class-variance-authority@[0-9.]*/class-variance-authority/g' "$file"
  
  # Fix lucide-react
  sed -i.bak 's/lucide-react@[0-9.]*/lucide-react/g' "$file"
  
  # Fix sonner (but keep version 2.0.3 as per guidelines)
  sed -i.bak 's/sonner@[0-9.]*/sonner/g' "$file"
  
  # Fix next-themes
  sed -i.bak 's/next-themes@[0-9.]*/next-themes/g' "$file"
  
  # Remove backup files
  rm -f "$file.bak"
done

echo "Done! All imports fixed."
echo "Note: react-hook-form@7.55.0 should be kept with version as per project requirements."
