
export interface ProcessedSection {
    id: string;
    originalTitle: string;
    title: string; // Title with number prepended
    level: number;
    content?: string;
    number: string;
    slug: string; // anchor slug
    children: ProcessedSection[];
}

export function processDocSections(sections: any[] = []): ProcessedSection[] {
    const root: ProcessedSection[] = [];
    const stack: ProcessedSection[] = []; // Stack to keep track of parents: index 0 is level 1, index 1 is level 2...

    // Counters for each level. We reset deeper levels when a higher level increments.
    // levelCounters[0] is for level 1, levelCounters[1] for level 2, etc.
    const levelCounters: number[] = [];

    sections.forEach((section, index) => {
        const level = section.level || 1;
        // ensure counters exist
        if (!levelCounters[level - 1]) levelCounters[level - 1] = 0;

        // Increment current level counter
        levelCounters[level - 1]++;

        // Reset all deeper counters
        for (let i = level; i < levelCounters.length; i++) {
            levelCounters[i] = 0;
        }

        // Generate number string
        const numberParts = [];
        for (let i = 0; i < level; i++) {
            numberParts.push(levelCounters[i]);
        }
        const numberStr = numberParts.join('.');

        // Create the Node
        const node: ProcessedSection = {
            id: section.id || `section-${index}`,
            originalTitle: section.title,
            title: `${numberStr}. ${section.title}`,
            level: level,
            content: section.content,
            number: numberStr,
            slug: `section-${index}`, // using index-based slug for simplicity/stability as per previous code
            children: []
        };

        if (level === 1) {
            root.push(node);
            stack[0] = node;
            // Clear deeper stack items
            stack.splice(1);
        } else {
            // Find parent
            // Parent should be at stack[level - 2]
            // Example: For level 2, parent is at stack[0] (level 1)
            const parentIndex = level - 2;

            if (parentIndex >= 0 && stack[parentIndex]) {
                stack[parentIndex].children.push(node);
                stack[parentIndex + 1] = node;
                stack.splice(parentIndex + 2);
            } else {
                // Fallback: Level requested but no parent found (e.g. jumped from 1 to 3, or started at 2)
                // Treat as root or child of last available parent? 
                // For robustness, treat as root if no parent, or attach to standard parent logic as best effort.
                // Let's just push to root if we can't find parent, to avoid crash.
                root.push(node);
                // Reset stack somewhat
                stack[0] = node;
                stack.splice(1);
            }
        }
    });

    return root;
}

// Helper to flatten the tree back to array if needed for main content rendering, 
// though we can probably just use the original array and match by ID or index, 
// OR simpler: we can just re-traverse the tree to get the flat list with the new titles.
export function flattenTree(nodes: ProcessedSection[]): ProcessedSection[] {
    let flat: ProcessedSection[] = [];
    nodes.forEach(node => {
        flat.push(node);
        if (node.children.length > 0) {
            flat = flat.concat(flattenTree(node.children));
        }
    });
    return flat;
}
