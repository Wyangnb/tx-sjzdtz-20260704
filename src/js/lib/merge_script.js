const fs = require('fs');

const files = process.argv.slice(2);

files.forEach(filePath => {
    console.log(filePath);
    
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Regex to find arrays of objects.
        // We match [ followed by anything that is NOT [ or ], followed by ]
        // This targets the innermost arrays.
        // We use a replacement function.
        const newContent = content.replace(/\[[^\[\]]*\]/g, (match) => {
            // Check if this array contains idType 11 or 12
            // We check for various formats of idType key
            if (!match.includes('idType') || 
                (!match.includes('11') && !match.includes('12'))) {
                return match;
            }

            try {
                // Parse the array
                // We wrap it in parentheses to ensure it evaluates to an expression
                // But evaling just [...] is fine.
                let arr;
                try {
                    // We use new Function to evaluate the array string
                    // This handles loose JSON (unquoted keys if any) and standard JS
                    arr = new Function('return ' + match)();
                } catch (e) {
                    // If eval fails, it might be because of variables or comments.
                    // If so, skip.
                    return match;
                }

                if (!Array.isArray(arr)) return match;

                // Find items
                let item11Index = arr.findIndex(i => i.idType == 11);
                let item12Index = arr.findIndex(i => i.idType == 12);

                if (item11Index === -1 && item12Index === -1) return match;

                let changed = false;

                // Logic:
                // If both exist: merge 12 into 11.
                // If only 12 exists: convert 12 to 11.
                // If only 11 exists: do nothing.

                if (item11Index !== -1 && item12Index !== -1) {
                    const item11 = arr[item11Index];
                    const item12 = arr[item12Index];
                    
                    // Merge num
                    item11.num = (parseInt(item11.num) || 0) + (parseInt(item12.num) || 0);
                    
                    // Remove item12
                    arr.splice(item12Index, 1);
                    changed = true;
                } else if (item11Index === -1 && item12Index !== -1) {
                    // Only 12 exists
                    const item12 = arr[item12Index];
                    item12.idType = 11;
                    // Keep icon/lang as is because we don't have 11's reference
                    changed = true;
                }

                if (changed) {
                    modified = true;
                    // Return valid JSON string
                    // To avoid messing up too much, we can use JSON.stringify
                    return JSON.stringify(arr, null, 2);
                }
                
                return match;

            } catch (e) {
                console.error(`Error processing match in ${filePath}:`, e);
                return match;
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated: ${filePath}`);
        } else {
            console.log(`No changes needed: ${filePath}`);
        }

    } catch (err) {
        console.error(`Error processing file ${filePath}:`, err);
    }
});
