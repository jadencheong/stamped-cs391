/**
 * components/TagSelector.tsx
 *
 * tag selector component — used in the post creation flow
 * renders tags grouped by category as selectable chips
 * enforces min 1, max 3 tag selection per post
 *
 * props:
 *  - selectedTags: currently selected tags (controlled by parent)
 *  - onChange: callback fired when selection of tags changes
 *
 *  imports from lib/tags.ts (for the source of truth tag list)
 *  do not hardcode tags
 *
 *
 *  created by: Jaden
 *
 *  we'll replace w/ styled components when we get to it — just wanted to test logic and build
 */

'use client';

import { TAGS_BY_CATEGORY, Tag } from '@/lib/tags';

// defining TagSelectorProps object
interface TagSelectorProps {
    // array of Tag type from lib/tags.ts
    selectedTags: Tag[];
    // call when selection changes
    onChange: (tags: Tag[]) => void;
}

// receives selectedTags from parent and calls onChange to tell parents to update
export default function TagSelector({ selectedTags, onChange }: TagSelectorProps) {

    // handles clicks for 3 different states
    const handleTagClick = (tag: Tag) => {
        // if already selected, deselect it
        if (selectedTags.includes(tag)) {
            onChange(selectedTags.filter(t => t !== tag));
            return;
        }

        // if at max (3), do nothing
        if (selectedTags.length >= 3) return;

        // otherwise add it
        onChange([...selectedTags, tag]);
    };

    return (
        <div>
            {/* min/max reminder */}
            <p>Select 1–3 tags ({selectedTags.length}/3 selected)</p>

            {/* render each category section
                converts object into array of [key, value] pairs based off of
                the [category, specific tag]
            */}
            {Object.entries(TAGS_BY_CATEGORY).map(([category, tags]) => (
                <div key={category}>
                    <p>{category}</p>

                    {/* render chips for each tag in this category */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {tags.map(tag => {
                            const isSelected = selectedTags.includes(tag);
                            const isDisabled = !isSelected && selectedTags.length >= 3;

                            return (
                                <button
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    disabled={isDisabled}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '999px',
                                        border: isSelected ? '2px solid black' : '1px solid gray',
                                        background: isSelected ? 'black' : 'white',
                                        color: isSelected ? 'white' : 'black',
                                        opacity: isDisabled ? 0.4 : 1,
                                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {tag}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* validation message — shown if user tries to proceed with 0 tags */}
            {selectedTags.length === 0 && (
                <p style={{ color: 'red' }}>Please select at least 1 tag</p>
            )}
        </div>
    );
}