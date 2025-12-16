import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/upa-estimating-db';

async function checkSaved() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const Project = mongoose.model('Project', new mongoose.Schema({}, { strict: false }), 'projects');
    
    const project: any = await Project.findById('6940dbb1d14a386335082daa').lean();
    
    console.log('Project haulingConfig from database:');
    console.log(JSON.stringify(project.haulingConfig, null, 2));
    
    await mongoose.disconnect();
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

checkSaved();
