import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'education-service' }));
app.get('/api/v1/education/courses', (req, res) => res.json({ message: 'Course catalog - xAPI compliant' }));
app.post('/api/v1/education/enrollments', (req, res) => res.json({ message: 'Enroll in course' }));
app.get('/api/v1/education/certificates', (req, res) => res.json({ message: 'Digital certificates' }));

app.listen(PORT, () => console.log(`📚 Education Service running on port ${PORT} - Democratizing education!`));
