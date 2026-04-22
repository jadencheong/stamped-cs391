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
 */

'use client';

import { TAGS_BY_CATEGORY, Tag } from '@/lib/tags';
import styled from 'styled-components';

// defining TagSelectorProps object
interface TagSelectorProps {
    // array of Tag type from lib/tags.ts
    selectedTags: Tag[];
    // call when selection changes
    onChange: (tags: Tag[]) => void;
}

// STYLED COMPONENTS

// outer wrapper for entire selector
const Wrapper = styled.div`
  width: 100%;
`;

// count indicator at top
// shows "x/3 selected"
const CountLabel = styled.p`
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 16px;
`;

// section for each category group
const CategorySection = styled.div`
  margin-bottom: 16px;
`;

// category name label
const CategoryLabel = styled.p`
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 8px;
`;

// row of chips for each category
const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

// individual tag chip — styles change based on selected/disabled state
const TagChip = styled.button<{ $selected: boolean; $disabled: boolean }>`
  padding: 5px 12px;
  border-radius: 99px;
  font-size: 12px;
  font-family: inherit;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.4 : 1};
  border: ${props => props.$selected ? '1.5px solid #326273' : '0.5px solid #e5e7eb'};
  background: ${props => props.$selected ? '#326273' : '#ffffff'};
  color: ${props => props.$selected ? '#ffffff' : '#374151'};
  transition: all 0.15s ease;
`;

// validation message shown when 0 tags selected
const ValidationText = styled.p`
  font-size: 12px;
  color: #ef4444;
  margin: 8px 0 0;
`;

// END OF STYLED COMPONENTS

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
        <Wrapper>
            <CountLabel>
                Select 1–3 tags ({selectedTags.length}/3 selected)
            </CountLabel>

            {Object.entries(TAGS_BY_CATEGORY).map(([category, tags]) => (
                <CategorySection key={category}>
                    <CategoryLabel>{category}</CategoryLabel>
                    <ChipRow>
                        {tags.map(tag => {
                            const isSelected = selectedTags.includes(tag);
                            const isDisabled = !isSelected && selectedTags.length >= 3;
                            return (
                                <TagChip
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    disabled={isDisabled}
                                    $selected={isSelected}
                                    $disabled={isDisabled}
                                >
                                    {tag}
                                </TagChip>
                            );
                        })}
                    </ChipRow>
                </CategorySection>
            ))}

            {selectedTags.length === 0 && (
                <ValidationText>Please select at least 1 tag</ValidationText>
            )}
        </Wrapper>
    );
}