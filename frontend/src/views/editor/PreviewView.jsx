import React from 'preact/compat';

export function PreviewView({ onBackToList, onEditFlow }) {
  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '8px',
    border: '1px solid #D1D5DB', marginTop: '5px', boxSizing: 'border-box'
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#F9FAFB',
      minHeight: '100vh',
      fontFamily: 'sans-serif'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={onBackToList} style={{ border: 'none', background: 'none', fontSize: '18px' }}>←</button>
        <span style={{ fontWeight: 'bold' }}>Preview</span>
        <button style={{ border: 'none', background: 'none', color: 'red' }}>Del</button>
      </div>

      {/* Cover Placeholder */}
      <div style={{
        width: '150px',
        height: '200px',
        backgroundColor: '#E5E7EB',
        margin: '0 auto 20px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed #9CA3AF'
      }}>
        <span style={{ color: '#6B7280', fontSize: '12px' }}>Add img</span>
      </div>

      {/* Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label>
          <span style={{ fontSize: '12px', color: '#666' }}>Title</span>
          <input style={inputStyle} type="text" placeholder="Write title..." value="My history" />
        </label>

        <label>
          <span style={{ fontSize: '12px', color: '#666' }}>Description</span>
          <textarea style={inputStyle} rows={3} placeholder="about" />
        </label>
      </div>

      {/* Floating Action Button - Start Editor */}
      <button
        onClick={onEditFlow}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          right: '20px',
          backgroundColor: '#FFD54F',
          color: '#000',
          padding: '15px',
          borderRadius: '12px',
          border: 'none',
          fontWeight: 'bold',
          fontSize: '16px',
          boxShadow: '0 4px 10px rgba(255, 213, 79, 0.4)'
        }}
      >
        Edit Story
      </button>
    </div>
  );
}
