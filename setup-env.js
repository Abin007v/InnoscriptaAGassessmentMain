const fs = require('fs').promises;
const path = require('path');

async function createEnvFiles() {
  const envSetupContent = await fs.readFile('envsetup.txt', 'utf8');
  
  // Parse the content to extract different env files
  const envFiles = {
    'backend/.env': '',
    'backend/.env.docker': '',
    'frontend/.env': '',
    'frontend/.env.docker': ''
  };

  let currentFile = '';
  const lines = envSetupContent.split('\n');

  for (const line of lines) {
    if (line.includes('backend/.env') && !line.includes('.docker')) {
      currentFile = 'backend/.env';
      continue;
    } else if (line.includes('backend/.env.docker')) {
      currentFile = 'backend/.env.docker';
      continue;
    } else if (line.includes('frontend/.env') && !line.includes('.docker')) {
      currentFile = 'frontend/.env';
      continue;
    } else if (line.includes('frontend/.env.docker')) {
      currentFile = 'frontend/.env.docker';
      continue;
    }

    if (currentFile && line.trim() && !line.startsWith('```')) {
      envFiles[currentFile] += line + '\n';
    }
  }

  // Create directories if they don't exist
  await fs.mkdir('backend', { recursive: true });
  await fs.mkdir('frontend', { recursive: true });

  // Write the env files
  for (const [filePath, content] of Object.entries(envFiles)) {
    if (content.trim()) {
      try {
        await fs.writeFile(filePath, content.trim() + '\n');
        console.log(`✅ Created ${filePath}`);
      } catch (error) {
        console.error(`❌ Error creating ${filePath}:`, error);
      }
    }
  }
}

// Run the script
createEnvFiles()
  .then(() => console.log('🎉 Environment setup complete!'))
  .catch(error => console.error('❌ Setup failed:', error)); 