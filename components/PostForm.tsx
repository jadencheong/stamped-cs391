/* form to create posts*/
/* created by Alen */

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { TAGS_BY_CATEGORY, Tag } from '@/lib/tags';

type ExistingPost = {
    _id: string;
    tags: Tag[];
    caption: string;
};

type Props = {
    mode: 'create' | 'edit';
    userId: string;
    destinationId: string;
    destinationName: string;
    existingPost?: ExistingPost;
};

const Wrapper = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
`;

const Label = styled.p`
  font-size: 11px;
  color: #9ca3af;
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CityName = styled.p`
  font-family: 'Unbounded', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px;
`;

const LockedNote = styled.p`
  font-size: 11px;
  color: #d1d5db;
  margin: 0;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
`;

const CategoryLabel = styled.p`
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 8px;
`;

const TagGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const TagButton = styled.button<{ $selected: boolean; $disabled: boolean }>`
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 99px;
  border: 0.5px solid;
`;

const TagCount = styled.span`
  color: #d1d5db;
  font-size: 11px;
  margin-left: 4px;
`;

const Textarea = styled.textarea`
  width: 100%;
  font-size: 13px;
  color: #374151;
  border: 0.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 16px;
  resize: none;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
`;

const CharCount = styled.p`
  font-size: 11px;
  color: #d1d5db;
  text-align: right;
  margin: 4px 0 0;
`;

const ErrorText = styled.p`
  font-size: 13px;
  color: #ef4444;
  margin: 0 0 1rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  background: #2563eb;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  padding: 12px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s ease;
`;

export default function PostForm({
    mode,
    userId,
    destinationId,
    destinationName,
    existingPost,
    }: Props) {
    const router = useRouter();
    const isEditing = mode === 'edit';

    const [tags, setTags]       = useState<Tag[]>(existingPost?.tags ?? []);
    const [caption, setCaption] = useState(existingPost?.caption ?? '');
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);

    const toggleTag = (tag: Tag) => {
        setTags(prev => {
            if (prev.includes(tag)) return prev.filter(t => t !== tag);
            if (prev.length >= 3)   return prev;
            return [...prev, tag];
        });
    };

    const handleSubmit = async () => {
        if (tags.length < 1) {
            setError('Please select at least 1 tag.');
            return;
        }
        setError('');
        setLoading(true);

        const url    = isEditing ? `/api/posts/${existingPost!._id}` : '/api/posts';
        const method = isEditing ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, destinationId, tags, caption }),
            });

            const data = await res.json();

            if (res.status === 409) {
                setError('You have already made a post for this city.');
                router.push(`/posts/${data.postId}/edit`);
                return;
            }

            if (!res.ok) {
                setError(data.error ?? 'Something went wrong, please try again.');
                return;
            }

            router.push('/');

        } catch {
            setError('Network error, please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Wrapper>
            <Section>
                <Label>City</Label>
                <CityName>{destinationName}</CityName>
                {isEditing && (
                    <LockedNote>City cannot be changed after posting.</LockedNote>
                )}
            </Section>

            <Section>
                <Label>
                    Tags <TagCount>({tags.length}/3 selected, min 1)</TagCount>
                </Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {Object.entries(TAGS_BY_CATEGORY).map(([category, categoryTags]) => (
                        <div key={category}>
                            <CategoryLabel>{category}</CategoryLabel>
                            <TagGrid>
                                {categoryTags.map(tag => {
                                    const selected = tags.includes(tag);
                                    const maxed    = tags.length >= 3 && !selected;
                                    return (
                                        <TagButton
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            disabled={maxed}
                                            $selected={selected}
                                            $disabled={maxed}
                                        >
                                            {tag}
                                        </TagButton>
                                    );
                                })}
                            </TagGrid>
                        </div>
                    ))}
                </div>
            </Section>

            <Section>
                <Label>Note <TagCount>(optional)</TagCount></Label>
                <Textarea
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    maxLength={2200}
                    rows={4}
                    placeholder="Share what made this place memorable..."
                />
                <CharCount>{caption.length}/2200</CharCount>
            </Section>

            {/* TODO: image upload ig we need to discuss how this works */}

            {error && <ErrorText>{error}</ErrorText>}

            <SubmitButton onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Post'}
            </SubmitButton>
        </Wrapper>
    );
}