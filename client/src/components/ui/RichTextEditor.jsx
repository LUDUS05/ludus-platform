import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import Input from './Input';
import Alert from './Alert';

// Block types with their configurations
const BLOCK_TYPES = {
  paragraph: {
    icon: '📝',
    label: 'Paragraph',
    component: 'p',
    editable: true,
    hasSettings: false
  },
  heading: {
    icon: '📰',
    label: 'Heading',
    component: 'h2',
    editable: true,
    hasSettings: true,
    settings: ['level', 'alignment']
  },
  image: {
    icon: '🖼️',
    label: 'Image',
    component: 'img',
    editable: false,
    hasSettings: true,
    settings: ['url', 'alt', 'caption', 'alignment', 'size']
  },
  video: {
    icon: '🎥',
    label: 'Video',
    component: 'video',
    editable: false,
    hasSettings: true,
    settings: ['url', 'caption', 'autoplay', 'controls']
  },
  quote: {
    icon: '💬',
    label: 'Quote',
    component: 'blockquote',
    editable: true,
    hasSettings: true,
    settings: ['author', 'source', 'alignment']
  },
  code: {
    icon: '💻',
    label: 'Code Block',
    component: 'pre',
    editable: true,
    hasSettings: true,
    settings: ['language', 'theme']
  },
  list: {
    icon: '📋',
    label: 'List',
    component: 'ul',
    editable: true,
    hasSettings: true,
    settings: ['type', 'style']
  },
  divider: {
    icon: '➖',
    label: 'Divider',
    component: 'hr',
    editable: false,
    hasSettings: true,
    settings: ['style', 'spacing']
  },
  button: {
    icon: '🔘',
    label: 'Button',
    component: 'a',
    editable: true,
    hasSettings: true,
    settings: ['url', 'style', 'size', 'alignment']
  },
  embed: {
    icon: '🌐',
    label: 'Embed',
    component: 'iframe',
    editable: false,
    hasSettings: true,
    settings: ['url', 'height', 'caption']
  }
};

const RichTextEditor = ({ 
  content = [], 
  onChange, 
  language = 'en',
  placeholder = 'Start writing...',
  readOnly = false,
  maxBlocks = 50,
  allowedBlockTypes = Object.keys(BLOCK_TYPES)
}) => {
  const { t } = useTranslation();
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [dragOverBlock, setDragOverBlock] = useState(null);
  const [focusedBlock, setFocusedBlock] = useState(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showSettingsFor, setShowSettingsFor] = useState(null);
  const fileInputRef = useRef();

  const blocks = useMemo(() => {
    return content.map((block, index) => ({
      ...block,
      id: block.id || `block-${Date.now()}-${index}`,
      order: block.order !== undefined ? block.order : index
    })).sort((a, b) => a.order - b.order);
  }, [content]);

  const updateBlock = useCallback((blockId, updates) => {
    const updatedBlocks = blocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    );
    onChange(updatedBlocks);
  }, [blocks, onChange]);

  const addBlock = useCallback((type, afterBlockId = null) => {
    if (blocks.length >= maxBlocks) {
      alert(`Maximum ${maxBlocks} blocks allowed`);
      return;
    }

    const afterIndex = afterBlockId 
      ? blocks.findIndex(b => b.id === afterBlockId)
      : blocks.length - 1;

    const newBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content: { en: '', ar: '' },
      data: getDefaultData(type),
      settings: getDefaultSettings(type),
      order: afterIndex + 1
    };

    // Reorder existing blocks
    const updatedBlocks = [
      ...blocks.slice(0, afterIndex + 1),
      newBlock,
      ...blocks.slice(afterIndex + 1).map(block => ({
        ...block,
        order: block.order + 1
      }))
    ];

    onChange(updatedBlocks);
    setFocusedBlock(newBlock.id);
    setShowBlockMenu(false);
  }, [blocks, onChange, maxBlocks]);

  const removeBlock = useCallback((blockId) => {
    const updatedBlocks = blocks
      .filter(block => block.id !== blockId)
      .map((block, index) => ({ ...block, order: index }));
    onChange(updatedBlocks);
  }, [blocks, onChange]);

  const duplicateBlock = useCallback((blockId) => {
    const originalBlock = blocks.find(b => b.id === blockId);
    if (!originalBlock) return;

    const newBlock = {
      ...originalBlock,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      order: originalBlock.order + 1,
      content: {
        en: originalBlock.content.en + ' (Copy)',
        ar: originalBlock.content.ar + ' (نسخة)'
      }
    };

    const updatedBlocks = [
      ...blocks.slice(0, originalBlock.order + 1),
      newBlock,
      ...blocks.slice(originalBlock.order + 1).map(block => ({
        ...block,
        order: block.order + 1
      }))
    ];

    onChange(updatedBlocks);
  }, [blocks, onChange]);

  const moveBlock = useCallback((fromId, toId) => {
    const fromIndex = blocks.findIndex(b => b.id === fromId);
    const toIndex = blocks.findIndex(b => b.id === toId);
    
    if (fromIndex === -1 || toIndex === -1) return;

    const updatedBlocks = [...blocks];
    const [movedBlock] = updatedBlocks.splice(fromIndex, 1);
    updatedBlocks.splice(toIndex, 0, movedBlock);

    // Update order
    updatedBlocks.forEach((block, index) => {
      block.order = index;
    });

    onChange(updatedBlocks);
  }, [blocks, onChange]);

  const handleDragStart = useCallback((e, blockId) => {
    setDraggedBlock(blockId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e, blockId) => {
    e.preventDefault();
    if (draggedBlock !== blockId) {
      setDragOverBlock(blockId);
    }
  }, [draggedBlock]);

  const handleDrop = useCallback((e, blockId) => {
    e.preventDefault();
    if (draggedBlock && draggedBlock !== blockId) {
      moveBlock(draggedBlock, blockId);
    }
    setDraggedBlock(null);
    setDragOverBlock(null);
  }, [draggedBlock, moveBlock]);

  const handleImageUpload = useCallback((blockId, file) => {
    if (!file) return;

    // Create a FileReader to convert file to base64 (for demo purposes)
    // In production, you'd upload to a service like Cloudinary
    const reader = new FileReader();
    reader.onload = (e) => {
      updateBlock(blockId, {
        data: {
          ...blocks.find(b => b.id === blockId)?.data,
          url: e.target.result,
          filename: file.name,
          size: file.size
        }
      });
    };
    reader.readAsDataURL(file);
  }, [blocks, updateBlock]);

  function getDefaultData(type) {
    switch (type) {
      case 'heading':
        return { level: 2 };
      case 'image':
        return { url: '', alt: '', caption: '', alignment: 'left', size: 'medium' };
      case 'video':
        return { url: '', caption: '', autoplay: false, controls: true };
      case 'quote':
        return { author: '', source: '', alignment: 'left' };
      case 'code':
        return { language: 'javascript', theme: 'dark' };
      case 'list':
        return { type: 'unordered', items: [''] };
      case 'button':
        return { url: '', style: 'primary', size: 'medium', alignment: 'left' };
      case 'embed':
        return { url: '', height: 400, caption: '' };
      case 'divider':
        return { style: 'solid', spacing: 'medium' };
      default:
        return {};
    }
  }

  function getDefaultSettings(type) {
    return {
      marginTop: 'medium',
      marginBottom: 'medium',
      backgroundColor: 'transparent',
      padding: 'none'
    };
  }

  const renderBlock = useCallback((block) => {
    const blockType = BLOCK_TYPES[block.type];
    const isRTL = language === 'ar';
    const textContent = block.content?.[language] || '';

    const blockClasses = [
      'group relative border border-transparent rounded-lg transition-all duration-200',
      focusedBlock === block.id ? 'border-ludus-orange bg-ludus-orange/5' : 'hover:border-ludus-gray-200',
      dragOverBlock === block.id ? 'border-ludus-blue border-dashed bg-ludus-blue/5' : '',
      draggedBlock === block.id ? 'opacity-50' : '',
      readOnly ? 'cursor-default' : 'cursor-text'
    ].filter(Boolean).join(' ');

    return (
      <div
        key={block.id}
        className={blockClasses}
        draggable={!readOnly}
        onDragStart={(e) => handleDragStart(e, block.id)}
        onDragOver={(e) => handleDragOver(e, block.id)}
        onDrop={(e) => handleDrop(e, block.id)}
        onFocus={() => setFocusedBlock(block.id)}
        onClick={() => setFocusedBlock(block.id)}
      >
        {/* Block Controls */}
        {!readOnly && focusedBlock === block.id && (
          <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} -top-8 flex items-center gap-1 bg-white shadow-lg rounded-md p-1 border z-10`}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSettingsFor(block.id)}
              className="text-xs px-2 py-1"
              title="Settings"
            >
              ⚙️
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => duplicateBlock(block.id)}
              className="text-xs px-2 py-1"
              title="Duplicate"
            >
              📋
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeBlock(block.id)}
              className="text-xs px-2 py-1 text-red-600"
              title="Delete"
            >
              🗑️
            </Button>
          </div>
        )}

        {/* Drag Handle */}
        {!readOnly && (
          <div className={`absolute ${isRTL ? 'right-2' : 'left-2'} top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing`}>
            <div className="w-4 h-4 text-ludus-gray-400 flex items-center justify-center">⋮⋮</div>
          </div>
        )}

        {/* Block Content */}
        <div className={`p-4 ${!readOnly ? 'pl-8 pr-8' : ''}`}>
          {renderBlockContent(block, textContent, isRTL, blockType)}
        </div>

        {/* Add Block Button */}
        {!readOnly && focusedBlock === block.id && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowBlockMenu(block.id)}
              className="bg-ludus-orange text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-ludus-orange/90"
              title="Add block below"
            >
              ➕
            </Button>
          </div>
        )}
      </div>
    );
  }, [
    language, focusedBlock, dragOverBlock, draggedBlock, readOnly,
    handleDragStart, handleDragOver, handleDrop, duplicateBlock, removeBlock
  ]);

  const renderBlockContent = (block, textContent, isRTL, blockType) => {
    const commonProps = {
      dir: isRTL ? 'rtl' : 'ltr',
      className: 'w-full border-none outline-none bg-transparent resize-none'
    };

    switch (block.type) {
      case 'paragraph':
        return readOnly ? (
          <p className="whitespace-pre-wrap" {...commonProps}>{textContent}</p>
        ) : (
          <textarea
            {...commonProps}
            value={textContent}
            onChange={(e) => updateBlock(block.id, { 
              content: { ...block.content, [language]: e.target.value } 
            })}
            placeholder={placeholder}
            className={`${commonProps.className} min-h-[60px]`}
            rows={3}
          />
        );

      case 'heading':
        const HeadingTag = `h${block.data?.level || 2}`;
        const headingClasses = {
          1: 'text-4xl font-bold',
          2: 'text-3xl font-bold',
          3: 'text-2xl font-semibold',
          4: 'text-xl font-semibold',
          5: 'text-lg font-medium',
          6: 'text-base font-medium'
        };
        
        return readOnly ? (
          <HeadingTag className={headingClasses[block.data?.level || 2]} {...commonProps}>
            {textContent}
          </HeadingTag>
        ) : (
          <textarea
            {...commonProps}
            value={textContent}
            onChange={(e) => updateBlock(block.id, { 
              content: { ...block.content, [language]: e.target.value } 
            })}
            placeholder="Heading text..."
            className={`${commonProps.className} ${headingClasses[block.data?.level || 2]} min-h-[50px] font-bold`}
            rows={2}
          />
        );

      case 'image':
        return (
          <div className="text-center">
            {block.data?.url ? (
              <div className="space-y-2">
                <img 
                  src={block.data.url} 
                  alt={block.data?.alt || ''} 
                  className="max-w-full h-auto rounded-lg mx-auto"
                  style={{
                    maxWidth: {
                      small: '300px',
                      medium: '500px',
                      large: '100%'
                    }[block.data?.size || 'medium']
                  }}
                />
                {(block.data?.caption || block.content?.[language]) && (
                  <p className="text-sm text-ludus-gray-600 italic">
                    {block.content?.[language] || block.data?.caption}
                  </p>
                )}
              </div>
            ) : !readOnly ? (
              <div className="border-2 border-dashed border-ludus-gray-300 rounded-lg p-8 text-center">
                <div className="text-4xl mb-2">🖼️</div>
                <p className="text-ludus-gray-600 mb-4">Click to add an image</p>
                <Button
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-ludus-orange text-white"
                >
                  Choose Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(block.id, e.target.files[0])}
                />
              </div>
            ) : null}
          </div>
        );

      case 'quote':
        return (
          <blockquote className="border-l-4 border-ludus-orange pl-4 italic">
            {readOnly ? (
              <>
                <p className="text-lg mb-2">{textContent}</p>
                {block.data?.author && (
                  <cite className="text-sm text-ludus-gray-600">
                    — {block.data.author}
                    {block.data?.source && `, ${block.data.source}`}
                  </cite>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <textarea
                  {...commonProps}
                  value={textContent}
                  onChange={(e) => updateBlock(block.id, { 
                    content: { ...block.content, [language]: e.target.value } 
                  })}
                  placeholder="Quote text..."
                  className={`${commonProps.className} text-lg min-h-[80px]`}
                  rows={3}
                />
                <div className="flex gap-2 text-sm">
                  <Input
                    value={block.data?.author || ''}
                    onChange={(e) => updateBlock(block.id, { 
                      data: { ...block.data, author: e.target.value } 
                    })}
                    placeholder="Author"
                    className="flex-1"
                    size="sm"
                  />
                  <Input
                    value={block.data?.source || ''}
                    onChange={(e) => updateBlock(block.id, { 
                      data: { ...block.data, source: e.target.value } 
                    })}
                    placeholder="Source"
                    className="flex-1"
                    size="sm"
                  />
                </div>
              </div>
            )}
          </blockquote>
        );

      case 'code':
        return (
          <div className="bg-ludus-gray-900 rounded-lg p-4 overflow-x-auto">
            {readOnly ? (
              <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                <code>{textContent}</code>
              </pre>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <select
                    value={block.data?.language || 'javascript'}
                    onChange={(e) => updateBlock(block.id, { 
                      data: { ...block.data, language: e.target.value } 
                    })}
                    className="bg-ludus-gray-800 text-white text-xs px-2 py-1 rounded"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="json">JSON</option>
                    <option value="bash">Bash</option>
                  </select>
                </div>
                <textarea
                  value={textContent}
                  onChange={(e) => updateBlock(block.id, { 
                    content: { ...block.content, [language]: e.target.value } 
                  })}
                  placeholder="Enter your code..."
                  className="w-full bg-transparent text-green-400 text-sm font-mono border-none outline-none resize-none min-h-[120px]"
                  rows={6}
                />
              </div>
            )}
          </div>
        );

      case 'divider':
        return (
          <div className="flex items-center justify-center py-4">
            <hr className={`
              w-full border-0
              ${block.data?.style === 'dotted' ? 'border-t border-dotted border-ludus-gray-300' :
                block.data?.style === 'dashed' ? 'border-t border-dashed border-ludus-gray-300' :
                'border-t border-solid border-ludus-gray-300'
              }
            `} />
          </div>
        );

      default:
        return (
          <div className="text-center text-ludus-gray-500 py-4">
            <div className="text-2xl mb-2">{blockType?.icon || '❓'}</div>
            <p>Block type "{block.type}" not implemented</p>
          </div>
        );
    }
  };

  return (
    <div className="rich-text-editor space-y-4">
      {blocks.length === 0 && !readOnly ? (
        <div className="text-center py-12 border-2 border-dashed border-ludus-gray-300 rounded-lg">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-ludus-dark mb-2">Start Creating Content</h3>
          <p className="text-ludus-gray-600 mb-4">Add your first content block to begin</p>
          <Button
            onClick={() => addBlock('paragraph')}
            className="bg-ludus-orange text-white"
          >
            Add Paragraph
          </Button>
        </div>
      ) : (
        blocks.map(renderBlock)
      )}

      {/* Block Type Menu */}
      {showBlockMenu && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setShowBlockMenu(false)}>
          <div className="bg-white rounded-lg shadow-xl p-4 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Add Content Block</h3>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {allowedBlockTypes.map(type => {
                const blockType = BLOCK_TYPES[type];
                if (!blockType) return null;
                
                return (
                  <Button
                    key={type}
                    variant="outline"
                    className="flex items-center gap-2 p-3 h-auto text-left"
                    onClick={() => addBlock(type, typeof showBlockMenu === 'string' ? showBlockMenu : null)}
                  >
                    <span className="text-xl">{blockType.icon}</span>
                    <span className="text-sm">{blockType.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Block Settings Modal */}
      {showSettingsFor && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setShowSettingsFor(null)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 max-h-96 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Block Settings</h3>
            <div className="space-y-4">
              <p className="text-sm text-ludus-gray-600">Settings panel for block customization would go here.</p>
              <Button onClick={() => setShowSettingsFor(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;