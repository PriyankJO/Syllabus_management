const axios = require('axios');

const test = async () => {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@college.edu',
      password: 'admin'
    });
    const token = loginRes.data.token;
    console.log('Login success');

    const headers = { Authorization: `Bearer ${token}` };

    const dashRes = await axios.get('http://localhost:5000/api/dashboard/admin', { headers });
    console.log('Dashboard success:', !!dashRes.data);

    const subjRes = await axios.get('http://localhost:5000/api/subjects', { headers });
    const subject = subjRes.data.data[0];
    
    if (subject) {
      console.log('Updating subject', subject._id);
      try {
        const updateRes = await axios.put(`http://localhost:5000/api/subjects/${subject._id}`, {
          ...subject,
          name: subject.name + ' Updated'
        }, { headers });
        console.log('Subject update success:', updateRes.data.success);
      } catch (err) {
        console.error('Subject update error:', err.response?.data);
      }
    }

    const stuRes = await axios.get('http://localhost:5000/api/users?role=STUDENT', { headers });
    const student = stuRes.data.data[0];
    
    if (student) {
      console.log('Updating student', student._id);
      try {
        const updateRes = await axios.put(`http://localhost:5000/api/users/${student._id}`, {
          ...student,
          name: student.name + ' Updated',
          department: student.department._id // simulating frontend flattening
        }, { headers });
        console.log('Student update success:', updateRes.data.success);
      } catch (err) {
        console.error('Student update error:', err.response?.data);
      }
    }

    console.log('Done');
  } catch (err) {
    console.error('Initial error:', err.response?.data || err.message);
  }
};

test();
