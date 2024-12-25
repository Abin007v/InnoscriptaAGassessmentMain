
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
npm run install-all
```  
This command will install the required dependencies for both the frontend and backend. The command utilizes the global `package.json` configuration with `npm install` to install the dependencies in both applications.  


### 3. Setup Environment Variables  

run the bellow command to create the env files.


On Windows:
```bash
.\setup.bat
```

On macOS/Linux:
```bash
./setup.sh
```


### 4. Build and Run the Application in docker environment 

Launch both frontend and backend services:  

```bash
docker-compose build

docker-compose up -d
```  
 

The application will be running at 3000 port in docker environment.

---

## Initial Configuration  

### 1. Account Setup  

1. Navigate to docker and click on frontend container to access the application.
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


