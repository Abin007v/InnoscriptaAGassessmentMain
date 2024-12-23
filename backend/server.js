import express from 'express';
import cors from 'cors';
import axios from 'axios';
import 'dotenv/config';
import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as jsforce from 'jsforce'; // Import jsforce for Salesforce connection
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI('AIzaSyAF0TUxoaLIV9hQbCKj6jlUFyXA64KecG8');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL, // Your React app's URL
}));
app.use(express.json()); // Middleware to parse JSON bodies

// Endpoint to fetch emails using the access token
app.post('/api/emails', async (req, res) => {
    const { accessToken } = req.body; // Get access token from request body

    if (!accessToken) {
        return res.status(401).json({ message: 'Access token is required' });
    }

    try {
        // Fetch user's emails using Graph API
        const response = await axios.get("https://graph.microsoft.com/v1.0/me/messages", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        
        const emails = response.data.value; // Extract the emails
        res.status(200).json({ emails });
    } catch (error) {
        console.error("Error fetching emails:", error);
        return res.status(500).json({ message: "Error fetching emails" });
    }
});

// Endpoint to get folders
app.post("/api/folders", async (req, res) => {
    const { accessToken } = req.body; // Get access token from request body

    if (!accessToken) {
        return res.status(401).json({ message: 'Access token is required' });
    }

    try {
        const response = await axios.get(
            'https://graph.microsoft.com/v1.0/me/mailFolders',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        // Log the fetched folders for debugging
        console.log('Fetched folders:', response.data);

        // Return the response data in the desired format
        return res.status(200).json({
            '@odata.context': response.data['@odata.context'],
            value: response.data.value.map(folder => ({
                id: folder.id,
                displayName: folder.displayName,
                parentFolderId: folder.parentFolderId,
                childFolderCount: folder.childFolderCount,
                unreadItemCount: folder.unreadItemCount,
                totalItemCount: folder.totalItemCount,
                sizeInBytes: folder.sizeInBytes,
                isHidden: folder.isHidden
            }))
        });
    } catch (error) {
        console.error('Error fetching folders:', error);
        return res.status(500).json({ error: 'Failed to fetch folders' });
    }
});

// Add this new endpoint to handle folder messages
app.post("/api/folders/:folderId/messages", async (req, res) => {
    const { folderId } = req.params;
    const { accessToken } = req.body;

    if (!accessToken) {
        return res.status(401).json({ message: 'Access token is required' });
    }

    try {
        const response = await axios.get(
            `https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}/messages`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        // Log the fetched messages for debugging
        console.log('Fetched messages from folder:', folderId);

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching folder messages:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch folder messages',
            details: error.response?.data || error.message 
        });
    }
});

// New endpoint to fetch attachments for a specific email
app.get('/api/attachments/:emailId', async (req, res) => {
    const { emailId } = req.params; // Get email ID from request parameters
    const { accessToken } = req.body; // Get access token from request body

    if (!accessToken) {
        return res.status(401).json({ message: 'Access token is required' });
    }

    try {
        const attachments = await fetchAttachments(emailId, accessToken); // Fetch attachments
        return res.status(200).json({ attachments }); // Send attachments back to client
    } catch (error) {
        console.error('Error fetching attachments:', error);
        return res.status(500).json({ message: 'Error fetching attachments' });
    }
});

// Function to fetch attachments for a specific email
const fetchAttachments = async (emailId, accessToken) => {
    try {
        const response = await fetch(
            `https://graph.microsoft.com/v1.0/me/messages/${emailId}/attachments`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Pass your access token
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch attachments');
        }

        const data = await response.json();
        return data.value; // Array of attachment objects
    } catch (error) {
        console.error('Error fetching attachments:', error);
        return [];
    }
};

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
