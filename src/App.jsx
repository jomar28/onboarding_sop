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
               !lowerReq.includes('crm id') &&
               !lowerReq.includes('managed crm actions');
      });
    }
    return reqs;
  };

  const PRODUCT_ORDER = ['CB Partials', 'CB Reps - Full', 'Ethoca', 'RDR', 'CDRN', 'MCOM', 'VAMP', 'MCX', 'OI'];
  const orderedSelectedProducts = PRODUCT_ORDER.filter(p => selectedProducts.includes(p));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      {/* Responsive Wrapper: Columns on large screens, stacks on mobile */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 md:gap-8">
        
        {/* Configuration Panel (Left Side on Desktop) */}
        <div className="w-full lg:w-1/3 xl:w-1/4 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h2 className="text-xl font-bold mb-6 text-slate-800">Onboarding Requirements</h2>
          
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2 text-slate-700">Client Name</label>
            <input 
              type="text" 
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g., Joshua"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2 text-slate-700">CRM Management</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="radio" className="w-4 h-4 text-blue-600 focus:ring-blue-500" checked={isManagedCrm} onChange={() => setIsManagedCrm(true)} />
                Managed CRM
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="radio" className="w-4 h-4 text-blue-600 focus:ring-blue-500" checked={!isManagedCrm} onChange={() => setIsManagedCrm(false)} />
                Self-CRM
              </label>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2 text-slate-700">Products Required</label>
            <div className="flex flex-col gap-2.5">
              {Object.keys(PRODUCTS).map(product => (
                <label key={product} className="flex items-center gap-2.5 cursor-pointer text-sm hover:bg-slate-50 p-1 rounded transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    checked={selectedProducts.includes(product)}
                    onChange={() => handleProductToggle(product)}
                  />
                  {product}
                </label>
              ))}
            </div>
          </div>

          {isManagedCrm && (
            <div className="mb-5 pt-4 border-t border-slate-200">
              <label className="block text-sm font-semibold mb-3 text-slate-700">CRM Guide Images to Include</label>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    checked={selectedGuides.includes('KNK')} 
                    onChange={() => handleGuideToggle('KNK')} 
                  /> 
                  Konnektive / Checkout Champ
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-sm">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    checked={selectedGuides.includes('Sticky')} 
                    onChange={() => handleGuideToggle('Sticky')} 
                  /> 
                  Sticky
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Output Panel (Right Side on Desktop) */}
        <div className="w-full lg:w-2/3 xl:w-3/4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Real-Time Email Preview</h2>
            <button 
              onClick={copyToClipboard}
              disabled={selectedProducts.length === 0 || clientName.trim() === ''}
              className={`px-5 py-1.5 rounded-lg font-medium transition-colors shadow-sm ${
                selectedProducts.length === 0 || clientName.trim() === ''
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Copy
            </button>
          </div>
          
          <div className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-slate-200 flex-grow">
            <div ref={emailRef} style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', lineHeight: '1.5', color: '#000' }}>
              <p>Hello {clientName || '[Client Name]'},</p>
              <br />
              <p>Here's a standardized checklist to streamline the onboarding process and eliminate the back-and-forth relay of information.</p>
              
              {selectedProducts.length > 0 ? (
                <>
                  <p>Your current products are primarily <strong>{orderedSelectedProducts.join(', ')}</strong>. Please pay special attention to these requirements:</p>
                  <br />
                  {orderedSelectedProducts.map(product => {
                    const reqs = getFilteredRequirements(product);
                    if (reqs.length === 0) return null;
                    return (
                      <div key={product} style={{ marginBottom: '16px' }}>
                        <strong>{product}</strong>
                        <ul style={{ margin: '4px 0 0 0', paddingLeft: '24px' }}>
                          {reqs.map((req, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>
                              {req === 'Order Insight Direct API' ? (
                                <a href="https://dispute.myrcvr.com/docs/pages/order-insight-direct" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                                  Order Insight Direct API setup guide
                                </a>
                              ) : (
                                req
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </>
              ) : (
                <p style={{ color: '#888', fontStyle: 'italic' }}>[Select products on the left to generate the requirements checklist...]</p>
              )}

              {isManagedCrm && selectedProducts.length > 0 && selectedGuides.length > 0 && (
                <>
                  <p>We require <strong>MID Aliases</strong> and <strong>Gateway / CRM IDs</strong> to pull Sales data from your CRM.</p>
                  <br />
                  <p style={{ fontWeight: 'bold', marginBottom: '16px' }}>Guide to identify CRM IDs:</p>
                  
                  {selectedGuides.map(guide => (
                        <p key={guide} style={{ marginBottom: '16px' }}>
                          {selectedGuides.length > 1 && (
                            <><strong>{guide === 'KNK' ? 'Konnektive / Checkout Champ' : 'Sticky'}:</strong><br/></>
                          )}
                          <img 
                            src={guide === 'KNK' ? '/knk-guide.png' : '/sticky-guide.png'} 
                            alt={guide === 'KNK' ? 'Konnektive Guide' : 'Sticky Guide'} 
                            style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ccc', marginTop: '8px' }} 
                          />
                        </p>
                      ))}
                </>
              )}

              {isManagedCrm && selectedProducts.length > 0 && (
                <>
                  <p style={{ marginTop: '16px', marginBottom: '4px' }}>To set up our CRM access, here are our guides:</p>
                  <ul style={{ paddingLeft: '24px', margin: '0 0 16px 0' }}>
                    <li style={{ marginBottom: '4px' }}>
                      <a href="https://myrcvr.atlassian.net/wiki/external/OGZmZDAyNDg0ODFkNDY4MmE2YzEwOWY3YWQ5MzliMmM" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                        Sticky
                      </a>
                    </li>
                    <li style={{ marginBottom: '4px' }}>
                      <a href="https://myrcvr.atlassian.net/wiki/external/YWNhMGE5MGYwZjVmNGUyNjkyNTZmNmZmZTkxMmQyZDc" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                        Konnektive
                      </a>
                    </li>
                    <li style={{ marginBottom: '4px' }}>
                      <a href="https://myrcvr.atlassian.net/wiki/external/NTZjOWIyYzJkNzdlNDdmZjg1MWJjN2FiZjhkNDgyZTA" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                        Checkout Champ
                      </a>
                    </li>
                  </ul>
                </>
              )}

              {(
                selectedProducts.includes('CB Reps - Full') ||
                selectedProducts.includes('CB Partials') ||
                selectedProducts.includes('CDRN') ||
                (selectedProducts.includes('Ethoca') && isManagedCrm)
              ) && (
                <>
                  <p style={{ marginTop: '16px', marginBottom: '4px' }}>When granting user access, you can usually default to the following email addresses for processors and gateways:</p>
                  <ul style={{ paddingLeft: '24px', marginBottom: '4px'}}>
                    <li>2fa@myrcvr.com</li>
                    <li>rcvr2fa@gmail.com</li>
                  </ul>
                  <p>Please let us know the username of an account whenever you send us an invite.</p>
                </>
              )}
              <br />
              <p>That should cover everything.</p>
              <br />
              <p>Thank you.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/20 backdrop-blur-sm transition-opacity px-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center animate-in fade-in zoom-in duration-200 max-w-sm w-full">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Copied</h3>
            <p className="text-slate-500 mt-1">Ready for sending.</p>
          </div>
        </div>
      )}
    </div>
  );
}