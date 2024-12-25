import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Reply, 
  Forward, 
  Star, 
  Archive,
  Trash2,
  Sparkles,
  Languages
} from 'lucide-react';
import useStore from '../useStore';  
import { PDFDocument } from 'pdf-lib'; // Import PDFDocument from pdf-lib
import { API_BASE_URL } from '../api/config';

const EmailView = () => {
  const { setEmail } = useStore((state) => state); // Get setEmail from Zustand store
  const { id } = useParams(); // Use 'id' to get the email ID from the URL
  const navigate = useNavigate();
  const location = useLocation();   
  const [attachments, setAttachments] = useState([]); // State for attachments
  const [pdfData, setPdfData] = useState(null); // State for PDF data

  // Get email from location state
  const email = location.state?.email;
  // console.log('Email from location state:', email); // Log the email from location state

  useEffect(() => {
    if (!email) {
      navigate('/emails');
    } else {
      // console.log('Setting email in store:', email); // Log the email object
      setEmail(email); 
      fetchAttachments(email.id); // Fetch attachments using the email ID
    }
  }, [email, navigate, setEmail]);

  const fetchAttachments = async (emailId) => {
    try {
      const accessToken = sessionStorage.getItem('accessToken') || useStore.getState().accessToken;
      
      if (!accessToken) {
        console.error('No access token available');
        navigate('/');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/attachments/${emailId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch attachments');
      }

      const data = await response.json();
      setAttachments(data.attachments);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    }
  };

  const handleBack = () => {
    navigate('/emails'); // Navigate back to the email list
  };
 
  
 
  const displayPdf = async (contentBytes) => {
    const uint8Array = new Uint8Array(atob(contentBytes).split("").map(char => char.charCodeAt(0)));
    const pdfDoc = await PDFDocument.load(uint8Array);
    const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
    setPdfData(pdfDataUri); // Set the PDF data URI to state
  };

  const handleAttachmentClick = (attachment) => {
    if (attachment["@odata.mediaContentType"] === "application/pdf") {
      displayPdf(attachment.contentBytes); // Display PDF if the attachment is a PDF
    } else {
      // Handle other attachment types if necessary
      const link = document.createElement('a');
      link.href = `data:${attachment["@odata.mediaContentType"]};base64,${attachment.contentBytes}`;
      link.download = attachment.name;
      link.click();
    }
  };

  if (!email) return null;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Email view header */}
      <div className="border-b p-3 sm:p-4">
        <div className=" items-center justify-between">
          <button onClick={handleBack} className="flex items-center space-x-2 text-blue-600">
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-semibold text-center">{email.subject}</h1>
        </div>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-auto p-3 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {/* Sender info */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">From: {email.sender.name || 'Unknown Sender'} ({email.sender.address || 'No Address Available'})</h2>
                <p className="text-sm text-gray-500">Time: {email.time || 'No Time Available'}</p>
              </div>
            </div>

            {/* Email body */}
            <div className="prose max-w-none whitespace-pre-wrap">
              <div dangerouslySetInnerHTML={{ __html: email.body }} />
            </div>


            {/* Attachments section */}
            {attachments.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Attachments</h3>
                <ul className="list-disc pl-5">
                  {attachments.map((attachment) => (
                    <li key={attachment.id} className="text-sm text-gray-700">
                      <button 
                        onClick={() => handleAttachmentClick(attachment)} 
                        className="text-blue-600 hover:underline"
                      >
                        {attachment.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* PDF Viewer */}
            {pdfData && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">PDF Preview</h3>
                <iframe src={pdfData} width="100%" height="500px" />
              </div>
            )}
          </div>
        </div>
      </div> 
    </div>
  );
};

export default EmailView; 