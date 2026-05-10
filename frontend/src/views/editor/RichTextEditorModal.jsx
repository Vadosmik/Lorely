import React, { useState, useEffect } from 'preact/compat';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill's CSS

export function RichTextEditorModal({ nodeId, initialText, onSave, onClose }) {
  const [editorContent, setEditorContent] = useState(initialText);

  useEffect(() => {
    setEditorContent(initialText);
  }, [initialText]);

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

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modalContent}>
        <h2 style={modalStyles.header}>Edit Node Content: {nodeId}</h2>
        <ReactQuill
          theme="snow"
          value={editorContent}
          onChange={setEditorContent}
          modules={modules}
          formats={formats}
          style={modalStyles.editor}
        />
        <div style={modalStyles.buttonGroup}>
          <button onClick={handleSave} style={modalStyles.saveButton}>Save</button>
          <button onClick={onClose} style={modalStyles.cancelButton}>Cancel</button>
        </div>
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
    maxWidth: '800px',
    maxHeight: '90%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
  },
  header: {
    marginBottom: '15px',
    color: '#333',
  },
  editor: {
    flexGrow: 1,
    marginBottom: '15px',
    height: 'auto', // Allow editor to adjust height
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
};
