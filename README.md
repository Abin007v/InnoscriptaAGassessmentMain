Here’s the updated README with the requested highlighting of the `.env` variables for clarity:

---

## Prerequisites

- Node.js (v16 or higher)  
- Docker Desktop  
- Microsoft Azure Account with Graph API access  

---

## Installation & Setup  

### 1. Clone the Repository  

```bash
git clone [repository-url]  
cd [repository-name]
```  

### 2. Install Dependencies  

```bash
npm install
```  

This command utilizes the global `package.json` configuration with `Concurrently` to manage both applications.  

### 3. Configure Elasticsearch  

Ensure Docker Desktop is running, then start Elasticsearch using Docker Compose:  

```bash
docker-compose up
```  

Verify Elasticsearch is running by accessing: [http://localhost:9200](http://localhost:9200)  

### 4. Start the Application  

Launch both frontend and backend services:  

```bash
npm run dev
```  

This command utilizes the global `package.json` configuration with `Concurrently` to manage both applications.  

The application will be available at: [http://localhost:3000](http://localhost:3000)  

---

## Initial Configuration  

### 1. Account Setup  

1. Navigate to [http://localhost:3000](http://localhost:3000)  
2. Create a new account using the registration form  
3. Proceed to Microsoft account linking  

### 2. Microsoft Graph API Permissions  

Before linking your Microsoft account, ensure the following Graph API permissions are granted:  

#### Required Endpoints:  
- `https://graph.microsoft.com/v1.0/me/messages`  
- `https://graph.microsoft.com/v1.0/users/{user-id}/mailFolders`  

#### Permission Scopes:  
- `Mail.Read`  
- `Mail.ReadWrite`  
- `User.Read`  
- `offline_access`  

### 3. Microsoft Account Integration  

1. After account creation, you'll be prompted to link your Microsoft account  
2. Review and consent to the requested permissions  
3. Complete the authentication process  

---

## Architecture  

- **Frontend**: React with Tailwind CSS  
- **Backend**: Node.js with Express  
- **Database**: Elasticsearch  
- **Authentication**: Microsoft Azure AD  
- **API Integration**: Microsoft Graph API  

---

## Features  

- Secure email synchronization  
- Real-time email updates  
- Folder management  
- Search capabilities  
- Modern, responsive UI  

---

## Development  

The application uses:  
- ESM modules  
- Docker containerization  
- Concurrent development servers  
- Environment-based configuration  

---

## Environment Variables  

### Backend  

**Create a `.env` file in the `backend` directory** and add the following variables:  

```plaintext
# Azure AD Configuration  
AZURE_CLIENT_ID=88ae7529-44dc-4b77-9773-a23cc03283c5  
AZURE_TENANT_ID=d25e697e-9987-4146-87ba-800be6fd457c  
AZURE_CLIENT_SECRET=iri8Q~fHAIsaSebR68Hrb97nSUxrsXO.-FXxxa4m  
REDIRECT_URI=http://localhost:3001  

# Frontend URL  
FRONTEND_URL=http://localhost:3000  

# Session Secret  
SESSION_SECRET=Helloworld  

# Server Port  
PORT=5001  

# Elasticsearch URL  
ELASTICSEARCH_URL=http://localhost:9200  

# CORS  
CORS_ORIGIN=http://localhost:3000  
```  

**Create a `.env.docker` file in the `backend` directory** and add the following variables:  

```plaintext
PORT=5000  
ELASTICSEARCH_URL=http://elasticsearch:9200  
```  

### Frontend  

**Create a `.env` file in the `frontend` directory** and highlight the variables:  

```plaintext
REACT_APP_PORT=3001  
REACT_APP_API_URL=http://localhost:5001  
```  

**OR, for Docker, create a `.env` file in the `frontend` directory** and highlight the variables:  

```plaintext
REACT_APP_PORT=3001  
REACT_APP_API_URL=http://backend:5001  
```  

---

This structure ensures clarity, highlighting the `.env` variables for easy setup and differentiation between local and Docker configurations.
