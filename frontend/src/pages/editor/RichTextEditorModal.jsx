import React, { useState, useEffect } from 'preact/compat';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill's CSS

export function RichTextEditorModal({ nodeId, initialText, onSave, onClose }) {
  const [editorContent, setEditorContent] = useState(initialText);
  const [isMobile, setIsMobile] = useState(window.matchMedia('(max-width: 768px)').matches);

  useEffect(() => {
    setEditorContent(initialText);
  }, [initialText]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleMediaQueryChange = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handleMediaQueryChange);
    return () => mediaQuery.removeEventListener('change', handleMediaQueryChange);
  }, []);

  const handleSave = () => {
    onSave(nodeId, editorContent);
    onClose();
  };

  const modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ];

  const currentModalContentStyle = isMobile ? modalStyles.mobileModalContent : modalStyles.modalContent;
  const currentOverlayStyle = isMobile ? modalStyles.mobileOverlay : modalStyles.overlay;

  return (
    <div style={currentOverlayStyle}>
      <div style={currentModalContentStyle}>
        {isMobile && (
          <div style={modalStyles.mobileHeader}>
            <button onClick={onClose} style={modalStyles.mobileCancelButton}>Cancel</button>
            <h2 style={modalStyles.mobileHeaderTitle}>Edit Node: {nodeId}</h2>
            <button onClick={handleSave} style={modalStyles.mobileSaveButton}>Save</button>
          </div>
        )}
        {!isMobile && <h2 style={modalStyles.header}>Edit Node Content: {nodeId}</h2>}
        <ReactQuill
          theme="snow"
          value={editorContent}
          onChange={setEditorContent}
          modules={modules}
          formats={formats}
          style={modalStyles.editor}
        />
        {!isMobile && (
          <div style={modalStyles.buttonGroup}>
            <button onClick={handleSave} style={modalStyles.saveButton}>Save</button>
            <button onClick={onClose} style={modalStyles.cancelButton}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    width: '90%',
    maxWidth: '100%',
    maxHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
    overflowY: 'auto',
  },
  header: {
    marginBottom: '15px',
    color: '#333',
  },
  editor: {
    flexGrow: 1,
    marginBottom: '15px',
    height: 'auto',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
  },
  // Mobile-specific styles
  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileModalContent: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    paddingTop: '60px',
    paddingBottom: '10px',
    paddingLeft: '10px',
    paddingRight: '10px',
    borderRadius: '0',
    display: 'flex',
    flexDirection: 'column',
  },
  mobileHeader: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '50px',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 10px',
    borderBottom: '1px solid #ccc',
    zIndex: 1002,
  },
  mobileHeaderTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  mobileSaveButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '8px 15px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
  },
  mobileCancelButton: {
    backgroundColor: '#F44336',
    color: 'white',
    padding: '8px 15px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
  }
};
