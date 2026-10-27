require('dotenv').config();
const mongoose = require('mongoose');
const Department = require('./src/models/Department');
const User = require('./src/models/User');
const Subject = require('./src/models/Subject');
const Material = require('./src/models/Material');
const Syllabus = require('./src/models/Syllabus');
const ModelPaper = require('./src/models/ModelPaper');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spc_syllabus_management');
    console.log('Connected to MongoDB for migration');

    const departments = await Department.find();
    const deptMap = {};
    departments.forEach(d => {
      deptMap[d.name] = d._id;
      deptMap[d.code] = d._id;
    });

    const models = [User, Subject, Material, Syllabus, ModelPaper];

    for (const Model of models) {
      // Find documents where department is NOT an ObjectId
      // Since it's a CastError to query by string if schema expects ObjectId, we must use native MongoDB driver
      const collection = mongoose.connection.collection(Model.collection.name);
      const docs = await collection.find({}).toArray();

      let updated = 0;
      for (const doc of docs) {
        if (doc.department && typeof doc.department === 'string') {
          // It's a string! Needs migration
          const newDeptId = deptMap[doc.department] || null;
          if (newDeptId) {
            await collection.updateOne({ _id: doc._id }, { $set: { department: newDeptId } });
            updated++;
          } else {
            // If we can't find a mapping, we unset it to avoid CastErrors
            await collection.updateOne({ _id: doc._id }, { $unset: { department: "" } });
            updated++;
          }
        }
      }
      console.log(`Migrated ${updated} documents in ${Model.collection.name} collection`);
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
