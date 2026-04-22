/* form to create posts*/
/* created by Alen */

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import { TAGS_BY_CATEGORY, Tag } from '@/lib/tags';

import { fadeIn, shimmy, slamDown, AnimatedCardWrapper } from '../app/components/duel/DuelStyles';

type ExistingPost = {
    _id: string;
    tags: Tag[];
    caption: string;
    images: string[];
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
  padding: 1.5% 1%;
`;

const Label = styled.p`
  font-size: 11px;
  color: #326273;
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CityName = styled.p`
  font-family: 'Unbounded', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #BF7245;
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
  color: #BF7245;
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
  font-family: inherit;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.4 : 1};
  border: ${props => props.$selected ? '1.5px solid #326273' : '0.5px solid #e5e7eb'};
  background: ${props => props.$selected ? '#326273' : '#ffffff'};
  color: ${props => props.$selected ? '#ffffff' : '#374151'};
  transition: all 0.15s ease;
`;

const TagCount = styled.span`
  color: #d1d5db;
  font-size: 11px;
  margin-left: 4px;
`;

const Textarea = styled.textarea`
  width: 100%;
  font-size: 13px;
  color: #BF7245;
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

const ImageUploadArea = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 120px;
  border: 0.5px dashed #d1d5db;
  border-radius: 12px;
  cursor: pointer;
  background: #f9fafb;
  box-sizing: border-box;
  &:hover { background: #f3f4f6; }
`;

const ImageUploadText = styled.p`
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
`;

const ImageUploadSubtext = styled.p`
  font-size: 11px;
  color: #d1d5db;
  margin: 4px 0 0;
`;

const ImagePreviewGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const ImagePreviewWrapper = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
`;

const ImagePreview = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 0.5px solid #e5e7eb;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
`;

const UploadingText = styled.p`
  font-size: 11px;
  color: #9ca3af;
  margin: 6px 0 0;
`;

const ErrorText = styled.p`
  font-size: 13px;
  color: #ef4444;
  margin: 0 0 1rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  background: #326273;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  padding: 12px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s ease;
`;

// from Anna, duel styled components :]
const PromptText = styled.p`
  color: #326273;
  margin-bottom: 2%;
  line-height: 1.5;
  font-size: 15px;

  strong {
    color: #BF7245;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1%;
`;

// logic for variants on the button, extended from Alen's
const ActionButton = styled(SubmitButton)<{ $variant?: 'primary' | 'secondary' }>`
  background: ${props => props.$variant === 'secondary' ? 'transparent' : '#326273'};
  color: ${props => props.$variant === 'secondary' ? '#BF7245' : '#EEEEEE'};
  border: ${props => props.$variant === 'secondary' ? '1px solid #BF7245' : 'none'};
  
  &:hover {
    background: ${props => props.$variant === 'secondary' ? 'rgba(191, 114, 69, 0.1)' : '#5C9EAD'};
    transform: translateY(-1px);
  }
`;

const PromptOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  /* re-using my fadeIn animation from my Duel components */
  animation: ${fadeIn} 0.3s ease-out;
`;

const PromptBox = styled.div`
  position: relative;
  width: 90vw;
  max-width: 450px;
  background-color: #EEEEEE;
  border-radius: 2%;
  padding: 2.5%;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  /* re-using my slamDown animation */
  animation: ${slamDown} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
`;


const TitleHeader = styled.h2`
  font-family: 'Unbounded', sans-serif;
  font-size: calc(8px + 2vw);
  font-weight: 700;
  color: #326273;
  margin-bottom: 2.5%;

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

    const [tags, setTags] = useState<Tag[]>(existingPost?.tags ?? []);
    const [caption, setCaption] = useState(existingPost?.caption ?? '');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<string[]>(existingPost?.images ?? []);
    const [uploading, setUploading] = useState(false);

    // from Anna -- for Duel stuff
    const [showDuelPrompt, setShowDuelPrompt] = useState(false); // track if duel  prompt visible
    const [pendingCity, setPendingCity] = useState<{ id: string, name: string } | null>(null); // store city data for duel
    const [showFirstPostModal, setShowFirstPostModal] = useState(false); // see if first post (or only post)

    const toggleTag = (tag: Tag) => {
        setTags(prev => {
            if (prev.includes(tag)) return prev.filter(t => t !== tag);
            if (prev.length >= 3)   return prev;
            return [...prev, tag];
        });
    };
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;

        // max 4 images total
        const remaining = 4 - images.length;
        const toUpload  = files.slice(0, remaining);

        setUploading(true);
        try {
            const uploaded = await Promise.all(
                toUpload.map(async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);

                    const res  = await fetch('/api/upload', { method: 'POST', body: formData });
                    const data = await res.json();

                    if (!res.ok) throw new Error(data.error ?? 'Upload failed');
                    return data.url as string;
                })
            );
            setImages(prev => [...prev, ...uploaded]);
        } catch {
            setError('One or more images failed to upload. Please try again.');
        } finally {
            setUploading(false);
            // reset input so same file can be re-selected if needed
            e.target.value = '';
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (tags.length < 1) {
            setError('Please select at least 1 tag.');
            return;
        }
        setError('');
        setLoading(true);

        const url= isEditing ? `/api/posts/${existingPost!._id}` : '/api/posts';
        const method= isEditing ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, destinationId, tags, caption, images }),
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

            // from Anna --  don't prompt duel on edits, only on new post creations
            if (!isEditing){

                if (data.totalPosts > 1) {
                    setPendingCity({ id: destinationId, name: destinationName });
                    setShowDuelPrompt(true);
                } else {
                    // trigger the "First Post" success modal instead of immediate redirect
                    setShowFirstPostModal(true);
                }
            } else {
                router.push('/');
            }

            

        } catch {
            setError('Network error, please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Wrapper>
            {/* city should be locked */}
            <Section>
                <Label>City</Label>
                <CityName>{destinationName}</CityName>
                {isEditing && (
                    <LockedNote>City cannot be changed after posting.</LockedNote>
                )}
            </Section>

            {/* Tag selector */}
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

            {/* Caption */}
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

            {/* image upload */}
            <Section>
                <Label>
                    Photos <TagCount>(optional, max 4 — jpg, png, heic)</TagCount>
                </Label>

                {images.length < 4 && (
                    <>
                        <ImageUploadArea>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/heic"
                                multiple
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                            <ImageUploadText>Tap to add photos</ImageUploadText>
                            <ImageUploadSubtext>JPG, PNG or HEIC</ImageUploadSubtext>
                        </ImageUploadArea>
                        {uploading && <UploadingText>Uploading...</UploadingText>}
                    </>
                )}

                {images.length > 0 && (
                    <ImagePreviewGrid>
                        {images.map((url, i) => (
                            <ImagePreviewWrapper key={url}>
                                <ImagePreview src={url} alt={`upload ${i + 1}`} />
                                <RemoveImageButton onClick={() => removeImage(i)}>
                                    ✕
                                </RemoveImageButton>
                            </ImagePreviewWrapper>
                        ))}
                    </ImagePreviewGrid>
                )}
            </Section>


            {error && <ErrorText>{error}</ErrorText>}

            <SubmitButton onClick={handleSubmit} disabled={loading || uploading}>
                {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Post'}
            </SubmitButton>
       
       
        {/* from Anna, Duel prompt overlay logic  */}
       {showDuelPrompt && (
            <PromptOverlay>
                <PromptBox>
                    <TitleHeader>
                        Rank Your Discovery
                    </TitleHeader>
                    
                    <PromptText>
                        Would you like to duel <strong>{pendingCity?.name}</strong> against your 
                        other destinations to settle its place in your rankings?
                    </PromptText>

                    <ButtonGroup>
                        {/* bring user to the duel if they choose it */}
                        <ActionButton 
                            onClick={() => router.push(`/duel-gauntlet?challengerId=${pendingCity?.id}`)}
                            >
                            Duel Now
                        </ActionButton>
                        
                        {/* take them out if they choose to do it later          */}
                        <ActionButton 
                            $variant="secondary" 
                            onClick={() => router.push('/')}
                        >
                        Maybe Later
                        </ActionButton>
                    </ButtonGroup>
                </PromptBox>
            </PromptOverlay>
            )}

        {/* show if it's the first or only post */}
        {showFirstPostModal && (
            <PromptOverlay>
                <PromptBox>
                    <TitleHeader>Post Created!</TitleHeader>
                    
                    <PromptText>
                        Your discovery of <strong>{destinationName}</strong> has been saved. 
                        <br /><br />
                        To start <strong>Dueling</strong> and ranking your travels, share at least one more city!
                    </PromptText>

                    <ButtonGroup>
                        <ActionButton onClick={() => router.push('/')}>
                            Go to Feed
                        </ActionButton>
                        
                        <ActionButton 
                            $variant="secondary" 
                            onClick={() => router.push('/search')}
                        >
                            Find Another City
                        </ActionButton>
                    </ButtonGroup>
                </PromptBox>
            </PromptOverlay>
        )}
                
       
        </Wrapper>


        
    );
}