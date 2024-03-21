const connectToMongo = require('./db');
var cors = require('cors');

const PORT = 7000;

const express = require('express') 
const app = express();
app.use(cors())

connectToMongo();

app.use(express.json()); 

app.use('/api/user',require('./routes/user'));
app.use('/api/tasks',require('./routes/task'));
app.use('/api/sub_tasks',require('./routes/sub_task'));

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
})