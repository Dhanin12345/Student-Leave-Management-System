import React from 'react';
import { FileText, Download, ExternalLink, X, ShieldCheck } from 'lucide-react';

export default function DocumentModal({ documentUrl, studentName, leaveInfo, onClose }) {
  if (!documentUrl) return null;

  const fileName = documentUrl || 'supporting_document.pdf';
  const documentApiUrl = `/api/documents/${encodeURIComponent(fileName)}`;

  const handleOpenNewTab = () => {
    window.open(documentApiUrl, '_blank');
  };

  const handleDownload = () => {
    window.open(documentApiUrl, '_blank');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1rem', fontWeight: 600 }}>{fileName}</h3>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Uploaded by {studentName || 'Student'} • Official Attachment
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ backgroundColor: '#f8fafc', padding: '1.5rem' }}>
          {/* Document Paper Preview Box */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: 'var(--radius-md)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
            position: 'relative'
          }}>
            {/* Stamp Overlay */}
            <div style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              border: '2px dashed #16a34a',
              color: '#16a34a',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              transform: 'rotate(-4deg)'
            }}>
              <ShieldCheck size={14} /> Verified Document
            </div>

            <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>
              College Leave Portal Verification
            </div>

            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: '#0f172a', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              Supporting Document Preview
            </h2>

            <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#334155' }}>
              <p style={{ marginBottom: '0.75rem' }}>
                <strong>Attached Document Name:</strong> <code>{fileName}</code>
              </p>
              <p style={{ marginBottom: '0.75rem' }}>
                This supporting document was attached for student <strong>{studentName || 'Alex Morgan'}</strong>.
              </p>
              {leaveInfo && (
                <div style={{ backgroundColor: '#f1f5f9', padding: '0.85rem', borderRadius: '8px', margin: '1rem 0', fontSize: '0.85rem' }}>
                  <div><strong>Leave Category:</strong> {leaveInfo.leave_type?.name || 'Sick Leave'}</div>
                  <div><strong>Duration:</strong> {leaveInfo.start_date} to {leaveInfo.end_date} ({leaveInfo.total_days} days)</div>
                  <div><strong>Submitted Reason:</strong> {leaveInfo.reason}</div>
                </div>
              )}
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1.25rem' }}>
                💡 Click <strong>"Open Document in New Tab"</strong> to view the full printable certificate document or save it as PDF.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn-outline" onClick={onClose}>Close</button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-outline" onClick={handleOpenNewTab}>
              <ExternalLink size={16} />
              <span>Open in New Tab</span>
            </button>
            <button className="btn-primary" onClick={handleDownload}>
              <Download size={16} />
              <span>View & Save Document</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
