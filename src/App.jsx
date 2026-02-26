import React, { useState, useRef } from 'react';

const PRODUCTS = {
  'CB Partials': ['Processor Portal Credentials'],
  'CB Reps - Full': ['Processor Portal Credentials', 'Gateway Portal Credentials', 'CRM Credentials', 'Domain/Product Web Page'],
  'Ethoca': [
    'Descriptor',
    'Customer Service Number',
    'If we manage refunds: Gateway Portal Credentials',
    'If we have CRM access: CRM Credentials, MID Aliases, and Gateway/CRM IDs'
  ],
  'CDRN': ['Descriptor', 'Customer Service Number', 'Gateway Portal Credentials'],
  'RDR': ['DBA', 'BIN and CAID (If unavailable, provide a Visa ARN starting with 2 or 7 from the processor portal)'],
  'VAMP': ['DBA', 'BIN and CAID (If unavailable, provide a Visa ARN starting with 2 or 7 from the processor portal)'],
  'OI': ['Order Insight Direct API'],
  'MCOM': ['Descriptor (unique and not enrolled in Ethoca)', 'Gateway', 'CRM', 'Acquirer/bank needs to be either FFB (Fresno) or CBSL (Central Bank of St. Louis)'],
  'MCX': ['Descriptor (unique and not enrolled in Ethoca)']
};

export default function OnboardingEmailGenerator() {
  const [clientName, setClientName] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isManagedCrm, setIsManagedCrm] = useState(true);
  const [selectedGuides, setSelectedGuides] = useState([]); 
  const [showCopyModal, setShowCopyModal] = React.useState(false);
  
  const emailRef = useRef(null);

  const handleProductToggle = (product) => {
    setSelectedProducts(prev => 
      prev.includes(product) ? prev.filter(p => p !== product) : [...prev, product]
    );
  };

  const handleGuideToggle = (guide) => {
    setSelectedGuides(prev => 
      prev.includes(guide) ? prev.filter(g => g !== guide) : [...prev, guide]
    );
  };

  const copyToClipboard = async () => {
    if (!emailRef.current) return;
    const html = emailRef.current.innerHTML;
    const blob = new Blob([html], { type: 'text/html' });
    const clipboardItem = new window.ClipboardItem({ 'text/html': blob });
    
    try {
      await navigator.clipboard.write([clipboardItem]);
      setShowCopyModal(true);
      setTimeout(() => setShowCopyModal(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const getFilteredRequirements = (product) => {
    let reqs = [...PRODUCTS[product]];
    if (!isManagedCrm) {
      reqs = reqs.filter(req => {
        const lowerReq = req.toLowerCase();
        return !lowerReq.includes('crm credentials') && 
               !lowerReq.includes('mid alias') && 
               !lowerReq.includes('crm id');
      });
    }
    return reqs;
  };

  const PRODUCT_ORDER = ['CB Partials', 'CB Reps - Full', 'Ethoca', 'RDR', 'CDRN', 'MCOM', 'VAMP', 'MCX', 'OI'];
  const orderedSelectedProducts = PRODUCT_ORDER.filter(p => selectedProducts.includes(p));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 md:gap-8">
        
        {/* Configuration Panel */}
        <div className="w-full lg:w-1/3 xl:w-1/4 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h2 className="text-xl font-bold mb-6 text-slate-800">Onboarding Requirements</h2>
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2 text-slate-700">Client Name</label>
            <input type="text" className="w-full p-2.5 border border-slate-300 rounded-lg outline-none" placeholder="e.g., Joshua" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2 text-slate-700">CRM Management</label>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={isManagedCrm} onChange={() => setIsManagedCrm(true)} /> Managed CRM</label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={!isManagedCrm} onChange={() => setIsManagedCrm(false)} /> Self-CRM</label>
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2 text-slate-700">Products Required</label>
            <div className="flex flex-col gap-2 text-sm">
              {Object.keys(PRODUCTS).map(product => (
                <label key={product} className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input type="checkbox" checked={selectedProducts.includes(product)} onChange={() => handleProductToggle(product)} /> {product}
                </label>
              ))}
            </div>
          </div>
          {isManagedCrm && (
            <div className="mb-5 pt-4 border-t border-slate-200">
              <label className="block text-sm font-semibold mb-3 text-slate-700">CRM Guide Images</label>
              <div className="flex flex-col gap-3 text-sm">
                <label className="flex items-center gap-2.5 cursor-pointer"><input type="checkbox" checked={selectedGuides.includes('KNK')} onChange={() => handleGuideToggle('KNK')} /> Konnektive / Checkout Champ</label>
                <label className="flex items-center gap-2.5 cursor-pointer"><input type="checkbox" checked={selectedGuides.includes('Sticky')} onChange={() => handleGuideToggle('Sticky')} /> Sticky</label>
              </div>
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className="w-full lg:w-2/3 xl:w-3/4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Email Preview</h2>
            <button onClick={copyToClipboard} disabled={selectedProducts.length === 0 || clientName.trim() === ''} className={`px-5 py-1.5 rounded-lg font-medium shadow-sm ${selectedProducts.length === 0 || clientName.trim() === '' ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white'}`}>Copy</button>
          </div>
          
          <div className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-slate-200 flex-grow">
            <div ref={emailRef} style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', lineHeight: '1.2', color: '#000' }}>
              <div style={{ margin: '0 0 8px 0' }}>Hello {clientName || '[Client Name]'},</div>
              <br />
              <div style={{ margin: '0 0 8px 0' }}>Here's a standardized checklist to streamline the onboarding process and eliminate the back-and-forth relay of information.</div>
              
              {orderedSelectedProducts.length > 0 && (
                <div style={{ margin: '0 0 8px 0' }}>
                  Your current products are primarily <strong>{orderedSelectedProducts.join(', ')}</strong>. Please pay special attention to these requirements:
                </div>
              )}
                <br />
              {orderedSelectedProducts.map(product => {
                const reqs = getFilteredRequirements(product);
                if (reqs.length === 0) return null;
                return (
                  <div key={product} style={{ margin: '0 0 10px 0' }}>
                    <div style={{ fontWeight: 'bold' }}>{product}</div>
                    <ul style={{ margin: '2px 0 0 0', paddingLeft: '20px' }}>
                      {reqs.map((req, idx) => (
                        <li key={idx} style={{ marginBottom: '1px' }}>
                          {req === 'Order Insight Direct API' ? (
                            <a href="https://dispute.myrcvr.com/docs/pages/order-insight-direct" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>Order Insight Direct API setup guide</a>
                          ) : req}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
                <br />
              {isManagedCrm && selectedProducts.length > 0 && selectedGuides.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ margin: '0 0 6px 0' }}>We require <strong>MID Aliases</strong> and <strong>Gateway / CRM IDs</strong> to pull Sales data from your CRM.</div>
                  <div style={{ fontWeight: 'bold', margin: '0 0 6px 0' }}>Guide to identify CRM IDs:</div>
                  
                  {selectedGuides.map(guide => (
                    <div key={guide} style={{ margin: '0 0 10px 0' }}>
                      {selectedGuides.length > 1 && (
                        <div style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>{guide === 'KNK' ? 'Konnektive / Checkout Champ' : 'Sticky'}:</div>
                      )}
                      <img 
                        src={guide === 'KNK' ? '/knk-guide.png' : '/sticky-guide.png'} 
                        alt={guide === 'KNK' ? 'Konnektive' : 'Sticky'} 
                        style={{ 
                              maxWidth: '100%', 
                              width: '500px', 
                              height: 'auto', 
                              border: '1px solid #ccc', 
                              marginTop: '8px' 
                            }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {isManagedCrm && selectedProducts.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ margin: '0 0 4px 0' }}>To set up our CRM access, here are our guides:</div>
                  <ul style={{ paddingLeft: '20px', margin: '0 0 8px 0' }}>
                    {['Sticky', 'Konnektive', 'Checkout Champ'].map((name, i) => (
                      <li key={i} style={{ marginBottom: '1px' }}>
                        <a href={name === 'Sticky' ? "https://myrcvr.atlassian.net/wiki/external/OGZmZDAyNDg0ODFkNDY4MmE2YzEwOWY3YWQ5MzliMmM" : name === 'Konnektive' ? "https://myrcvr.atlassian.net/wiki/external/YWNhMGE5MGYwZjVmNGUyNjkyNTZmNmZmZTkxMmQyZDc" : "https://myrcvr.atlassian.net/wiki/external/NTZjOWIyYzJkNzdlNDdmZjg1MWJjN2FiZjhkNDgyZTA"} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>{name}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(orderedSelectedProducts.some(p => ['CB Reps - Full', 'CB Partials', 'CDRN'].includes(p)) || (selectedProducts.includes('Ethoca') && isManagedCrm)) && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ margin: '0 0 4px 0' }}>When granting user access, you can usually default to:</div>
                  <ul style={{ paddingLeft: '20px', margin: '0 0 4px 0' }}>
                    <li>2fa@myrcvr.com</li>
                    <li>rcvr2fa@gmail.com</li>
                  </ul>
                  <div style={{ margin: '4px 0 0 0' }}>Please let us know the username whenever you send us an invite.</div>
                </div>
              )}

              <div style={{ marginTop: '12px', marginBottom: '4px' }}>That should cover everything.</div>
              <br />
              <div style={{ margin: '0' }}>Thank you.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/20 backdrop-blur-sm px-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center max-w-sm w-full animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Copied</h3>
            <p className="text-slate-500 mt-1">Ready for sending.</p>
          </div>
        </div>
      )}
    </div>
  );
}